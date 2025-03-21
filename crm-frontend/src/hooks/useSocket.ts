import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { Message, MessageStatus } from '../types/chat';
import { useToast } from '@chakra-ui/react';

interface SocketHookProps {
  onNewMessage?: (message: Message) => void;
  onMessageStatusChange?: (messageId: string, status: MessageStatus) => void;
  onTypingStatus?: (userId: string, chatId: string, isTyping: boolean) => void;
  onConnectionChange?: (isConnected: boolean) => void;
}

const useSocket = (props: SocketHookProps = {}) => {
  const { onNewMessage, onMessageStatusChange, onTypingStatus, onConnectionChange } = props;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>();
  const { user } = useAuth();
  const toast = useToast();
  
  // Initialize socket connection
  useEffect(() => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    if (!token || !user) return;
    
    const connectSocket = () => {
      setIsConnecting(true);
      
      const socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:3001', {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000
      });
      
      setSocket(socketInstance);
    };
    
    // Clear any existing reconnect timer
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = undefined;
    }
    
    connectSocket();
    
    return () => {
      if (socket) {
        socket.disconnect();
      }
      
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
        reconnectTimer.current = undefined;
      }
    };
  }, [user]);
  
  // Setup socket event listeners
  useEffect(() => {
    if (!socket) return;
    
    // Connection event handlers
    const onConnect = () => {
      console.log('Socket connected successfully');
      setIsConnected(true);
      setIsConnecting(false);
      setConnectionAttempts(0);
      
      if (onConnectionChange) {
        onConnectionChange(true);
      }
    };
    
    const onDisconnect = (reason: string) => {
      console.log(`Socket disconnected: ${reason}`);
      setIsConnected(false);
      
      if (onConnectionChange) {
        onConnectionChange(false);
      }
      
      // Auto reconnect if disconnected for specific reasons
      if (
        reason === 'io server disconnect' || 
        reason === 'transport close' ||
        reason === 'ping timeout'
      ) {
        // Only attempt reconnect if we haven't reached max attempts
        if (connectionAttempts < 5) {
          const nextAttempt = connectionAttempts + 1;
          setConnectionAttempts(nextAttempt);
          
          // Exponential backoff for reconnect attempts (1s, 2s, 4s, 8s, 16s)
          const delay = Math.min(1000 * Math.pow(2, connectionAttempts), 30000);
          
          toast({
            title: 'Connection lost',
            description: `Attempting to reconnect in ${delay/1000} seconds...`,
            status: 'warning',
            duration: 3000,
            isClosable: true,
          });
          
          reconnectTimer.current = setTimeout(() => {
            setIsConnecting(true);
            socket.connect();
          }, delay);
        } else {
          toast({
            title: 'Connection failed',
            description: 'Could not connect to the server after multiple attempts.',
            status: 'error',
            duration: null,
            isClosable: true,
          });
        }
      }
    };
    
    const onError = (error: Error) => {
      console.error('Socket error:', error);
      setIsConnected(false);
      setIsConnecting(false);
      
      toast({
        title: 'Connection error',
        description: error.message || 'Failed to connect to the server',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      if (onConnectionChange) {
        onConnectionChange(false);
      }
    };
    
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onError);
    
    // Custom event handlers
    if (onNewMessage) {
      socket.on('new_message', onNewMessage);
    }
    
    if (onMessageStatusChange) {
      socket.on('message_status', (data) => {
        onMessageStatusChange(data.messageId, data.status);
      });
    }
    
    if (onTypingStatus) {
      socket.on('typing_status', (data) => {
        onTypingStatus(data.userId, data.chatId, data.isTyping);
      });
    }
    
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onError);
      
      if (onNewMessage) {
        socket.off('new_message', onNewMessage);
      }
      
      if (onMessageStatusChange) {
        socket.off('message_status');
      }
      
      if (onTypingStatus) {
        socket.off('typing_status');
      }
    };
  }, [socket, connectionAttempts, onNewMessage, onMessageStatusChange, onTypingStatus, onConnectionChange, toast]);
  
  // Join a chat room
  const joinChat = useCallback((chatId: string) => {
    if (socket && isConnected) {
      socket.emit('join_chat', chatId);
    }
  }, [socket, isConnected]);
  
  // Leave a chat room
  const leaveChat = useCallback((chatId: string) => {
    if (socket && isConnected) {
      socket.emit('leave_chat', chatId);
    }
  }, [socket, isConnected]);
  
  // Send a message
  const sendMessage = useCallback((chatId: string, message: string, mediaUrl?: string, mediaType?: string) => {
    if (socket && isConnected) {
      socket.emit('send_message', { chatId, message, mediaUrl, mediaType });
      return true;
    }
    return false;
  }, [socket, isConnected]);
  
  // Send typing status
  const sendTypingStatus = useCallback((chatId: string, isTyping: boolean) => {
    if (socket && isConnected) {
      socket.emit('typing', { chatId, isTyping });
      return true;
    }
    return false;
  }, [socket, isConnected]);
  
  // Force reconnection
  const reconnect = useCallback(() => {
    if (socket) {
      setIsConnecting(true);
      socket.connect();
    }
  }, [socket]);
  
  return {
    socket,
    isConnected,
    isConnecting,
    connectionAttempts,
    joinChat,
    leaveChat,
    sendMessage,
    sendTypingStatus,
    reconnect
  };
};

export default useSocket; 