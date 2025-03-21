import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Box, 
  Flex, 
  useBreakpointValue, 
  useToast, 
  Badge, 
  IconButton,
  Button,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter
} from '@chakra-ui/react';
import { BellIcon, RepeatIcon } from '@chakra-ui/icons';
import ChatList from '../components/chat/ChatList';
import ChatWindow from '../components/chat/ChatWindow';
import ChatInput from '../components/chat/ChatInput';
import useSocket from '../hooks/useSocket';
import useNotification from '../hooks/useNotification';
import { 
  getAllChats, 
  getQuickRepliesByCompany, 
  sendTextMessage, 
  sendMediaMessage,
  createMessage,
  updateMessageStatus 
} from '../services/chatService';
import { 
  Chat, 
  Message, 
  QuickReply, 
  MediaType, 
  MessageDirection, 
  MessageStatus 
} from '../types/chat';
import { useAuth } from '../context/AuthContext';

const ChatPage = () => {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [showChatList, setShowChatList] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [retryQueue, setRetryQueue] = useState<Message[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const isRetrying = useRef(false);
  const isMobile = useBreakpointValue({ base: true, md: false });
  const toast = useToast();
  const { user } = useAuth();
  const { isOpen: isReconnectModalOpen, onOpen: openReconnectModal, onClose: closeReconnectModal } = useDisclosure();

  // Handle chat selection
  const handleSelectChat = useCallback((chat: Chat) => {
    setSelectedChat(chat);
    
    // Reset unread count for this chat
    setUnreadCounts(prev => ({
      ...prev,
      [chat.id]: 0
    }));
    
    if (isMobile) {
      setShowChatList(false);
    }
  }, [isMobile]);

  // Initialize notification system
  const { showNotification } = useNotification({
    onNotificationClick: () => {
      if (selectedChat) {
        // Focus on current chat
        const chatWindow = document.getElementById('chat-window');
        if (chatWindow) {
          chatWindow.focus();
        }
      }
    }
  });

  // Handle connection status change
  const handleConnectionChange = useCallback((isConnected: boolean) => {
    setConnectionStatus(isConnected ? 'connected' : 'disconnected');
    
    if (isConnected) {
      toast({
        title: 'Connected',
        description: 'You are now connected to the chat server',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } else {
      // If disconnection persists, show modal to manually reconnect
      setTimeout(() => {
        if (connectionStatus === 'disconnected') {
          openReconnectModal();
        }
      }, 10000);
    }
  }, [connectionStatus, toast, openReconnectModal]);

  // Handle incoming messages
  const handleNewMessage = useCallback((message: Message) => {
    // Update chat list and message list if needed
    setChats(prevChats => {
      const updatedChats = [...prevChats];
      const chatIndex = updatedChats.findIndex(chat => chat.id === message.chatId);
      
      if (chatIndex >= 0) {
        // Update the last message of the chat
        const updatedChat = { 
          ...updatedChats[chatIndex], 
          lastMessage: message 
        };
        
        // Move this chat to the top of the list
        updatedChats.splice(chatIndex, 1);
        updatedChats.unshift(updatedChat);
      }
      
      return updatedChats;
    });
    
    // If this is the currently selected chat, update UI accordingly
    if (selectedChat && message.chatId === selectedChat.id) {
      setSelectedChat(prev => {
        if (!prev) return null;
        return {
          ...prev,
          lastMessage: message
        };
      });
    } else {
      // Increment unread count for incoming messages if chat is not currently selected
      if (message.direction === MessageDirection.INBOUND) {
        setUnreadCounts(prev => ({
          ...prev,
          [message.chatId]: (prev[message.chatId] || 0) + 1
        }));
      }
    }
    
    // Show notification for incoming messages
    if (message.direction === MessageDirection.INBOUND) {
      const contact = message.contact?.name || 'Unknown';
      showNotification(`New message from ${contact}`, {
        body: message.content,
        icon: message.contact?.profilePic || '/default-avatar.png'
      });
    }
  }, [selectedChat, showNotification]);
  
  // Handle message status changes
  const handleMessageStatus = useCallback((messageId: string, status: string) => {
    // Update message status in UI and database
    console.log(`Message ${messageId} status changed to ${status}`);
    
    // Handle failed messages by adding to retry queue
    if (status === MessageStatus.FAILED) {
      setChats(prevChats => {
        const newChats = [...prevChats];
        for (const chat of newChats) {
          if (chat.messages) {
            const failedMessage = chat.messages.find(m => m.id === messageId);
            if (failedMessage) {
              // Add to retry queue if not already there
              setRetryQueue(prev => {
                if (!prev.some(m => m.id === messageId)) {
                  return [...prev, failedMessage];
                }
                return prev;
              });
              break;
            }
          }
        }
        return newChats;
      });
    }
  }, []);

  // Socket.io connection
  const { 
    isConnected, 
    isConnecting,
    connectionAttempts,
    sendMessage, 
    sendTypingStatus, 
    joinChat,
    reconnect 
  } = useSocket({
    onNewMessage: handleNewMessage,
    onMessageStatusChange: handleMessageStatus,
    onConnectionChange: handleConnectionChange,
    onTypingStatus: (userId, chatId, isTyping) => {
      // Handle typing indicator
      console.log(`User ${userId} is ${isTyping ? 'typing' : 'not typing'} in chat ${chatId}`);
    }
  });

  // Update connection status
  useEffect(() => {
    if (isConnecting) {
      setConnectionStatus('connecting');
    } else if (isConnected) {
      setConnectionStatus('connected');
    } else {
      setConnectionStatus('disconnected');
    }
  }, [isConnected, isConnecting]);

  // Load chats and quick replies
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [chatsData, quickRepliesData] = await Promise.all([
          getAllChats(),
          user?.companyId ? getQuickRepliesByCompany(user.companyId) : Promise.resolve([])
        ]);
        
        setChats(chatsData);
        setQuickReplies(quickRepliesData);
        
        // Initialize unread counts
        const counts: Record<string, number> = {};
        chatsData.forEach(chat => {
          // Count unread messages for each chat
          counts[chat.id] = 0;
        });
        setUnreadCounts(counts);
      } catch (error) {
        console.error('Error loading chat data:', error);
        toast({
          title: 'Error loading chats',
          description: 'Could not load your conversations.',
          status: 'error',
          duration: 5000,
          isClosable: true
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user, toast]);

  // Handle sending a message
  const handleSendMessage = useCallback(async (content: string, mediaUrl?: string, mediaType?: MediaType) => {
    if (!selectedChat) return;
    
    try {
      // Create optimistic message
      const optimisticMessage: Partial<Message> = {
        id: `temp-${Date.now()}`,
        content,
        mediaUrl,
        mediaType,
        direction: MessageDirection.OUTBOUND,
        status: MessageStatus.SENT,
        contactId: selectedChat.contactId,
        chatId: selectedChat.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Update UI optimistically
      handleNewMessage(optimisticMessage as Message);
      
      // Attempt to send message via socket first
      let sentViaSocket = false;
      if (isConnected) {
        sentViaSocket = sendMessage(selectedChat.id, content, mediaUrl, mediaType?.toString());
      }
      
      // If socket send failed, use REST API as fallback
      if (!sentViaSocket) {
        // Fallback to REST API if socket is not connected
        if (mediaUrl && mediaType) {
          await sendMediaMessage(
            selectedChat.contact.phoneNumber, 
            mediaUrl, 
            content || '', 
            mediaType
          );
        } else {
          await sendTextMessage(selectedChat.contact.phoneNumber, content);
        }
        
        // Create message in database
        await createMessage({
          content,
          mediaUrl,
          mediaType,
          direction: MessageDirection.OUTBOUND,
          contactId: selectedChat.contactId,
          chatId: selectedChat.id
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error sending message',
        description: 'Your message could not be sent. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
      
      // Handle the error by updating the message status
      // Note: In a real implementation, we'd update the actual message ID
      // Here we're just showing the concept
      updateMessageStatus(`temp-${Date.now()}`, MessageStatus.FAILED);
    }
  }, [selectedChat, isConnected, sendMessage, handleNewMessage, toast]);

  // Effect to join the chat room when a chat is selected
  useEffect(() => {
    if (selectedChat && isConnected) {
      joinChat(selectedChat.id);
    }
  }, [selectedChat, isConnected, joinChat]);

  // Effect to retry failed messages
  useEffect(() => {
    const retryMessages = async () => {
      if (retryQueue.length === 0 || isRetrying.current || !isConnected) return;
      
      isRetrying.current = true;
      
      try {
        const message = retryQueue[0];
        console.log(`Retrying message: ${message.id}`);
        
        // Try to send the message again
        if (message.mediaUrl && message.mediaType) {
          await sendMediaMessage(
            message.contact.phoneNumber,
            message.mediaUrl,
            message.content || '',
            message.mediaType
          );
        } else {
          await sendTextMessage(message.contact.phoneNumber, message.content);
        }
        
        // Remove from retry queue if successful
        setRetryQueue(prev => prev.filter(m => m.id !== message.id));
        
        // Update the message status
        updateMessageStatus(message.id, MessageStatus.SENT);
        
        toast({
          title: 'Message resent',
          description: 'Your message has been successfully resent.',
          status: 'success',
          duration: 3000,
          isClosable: true
        });
      } catch (error) {
        console.error('Error retrying message:', error);
        toast({
          title: 'Retry failed',
          description: 'Could not resend your message. Will try again later.',
          status: 'error',
          duration: 5000,
          isClosable: true
        });
      } finally {
        isRetrying.current = false;
      }
    };
    
    const intervalId = setInterval(retryMessages, 30000); // Try every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [retryQueue, isConnected, toast]);

  // Handle back button on mobile
  const handleBack = () => {
    setShowChatList(true);
  };

  // Handle manual reconnection
  const handleManualReconnect = () => {
    reconnect();
    closeReconnectModal();
  };

  // Total unread count across all chats
  const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  return (
    <Flex h="calc(100vh - 64px)" overflow="hidden" position="relative">
      {/* Connection status indicator */}
      <Box 
        position="absolute"
        top="0"
        left="0"
        right="0"
        zIndex="20"
        py="1"
        textAlign="center"
        bg={
          connectionStatus === 'connected' ? 'green.500' :
          connectionStatus === 'connecting' ? 'yellow.500' :
          'red.500'
        }
        color="white"
        fontSize="xs"
        opacity={connectionStatus === 'connected' ? '0' : '1'}
        transition="opacity 0.3s ease-in-out"
        _hover={{
          opacity: 1
        }}
      >
        {connectionStatus === 'connected' && 'Connected'}
        {connectionStatus === 'connecting' && 'Connecting to server...'}
        {connectionStatus === 'disconnected' && (
          <Flex justify="center" align="center">
            <Text mr="2">Disconnected</Text>
            <IconButton
              aria-label="Reconnect"
              icon={<RepeatIcon />}
              size="xs"
              colorScheme="white"
              variant="ghost"
              onClick={reconnect}
            />
          </Flex>
        )}
      </Box>
      
      {/* Unread notification badge for mobile */}
      {isMobile && showChatList && totalUnread > 0 && (
        <Badge
          position="absolute"
          top="4"
          right="4"
          colorScheme="red"
          borderRadius="full"
          p="1"
          zIndex="1"
        >
          {totalUnread}
        </Badge>
      )}
      
      {/* Chat List */}
      {(!isMobile || (isMobile && showChatList)) && (
        <Box 
          w={isMobile ? "100%" : "350px"} 
          h="100%" 
          borderRight="1px" 
          borderColor="gray.200"
        >
          <ChatList 
            chats={chats}
            onSelect={handleSelectChat} 
            selectedChatId={selectedChat?.id}
            unreadCounts={unreadCounts}
            isLoading={isLoading}
          />
        </Box>
      )}
      
      {/* Chat Window */}
      {(!isMobile || (isMobile && !showChatList)) && (
        <Flex 
          direction="column" 
          flex="1" 
          h="100%" 
          position="relative"
          id="chat-window"
        >
          {selectedChat ? (
            <>
              <ChatWindow 
                chat={selectedChat} 
                onBack={isMobile ? handleBack : undefined}
                isMobile={isMobile}
                isConnected={isConnected}
              />
              <ChatInput 
                chatId={selectedChat.id} 
                onSendMessage={handleSendMessage}
                quickReplies={quickReplies}
                onTyping={(isTyping) => sendTypingStatus(selectedChat.id, isTyping)}
                isConnected={isConnected}
              />
              
              {/* Retry button for failed messages */}
              {retryQueue.length > 0 && (
                <IconButton
                  aria-label="Retry failed messages"
                  icon={<BellIcon />}
                  position="absolute"
                  bottom="20"
                  right="4"
                  colorScheme="red"
                  borderRadius="full"
                  onClick={() => {
                    // Trigger retry immediately
                    isRetrying.current = false;
                  }}
                />
              )}
            </>
          ) : (
            <Flex 
              justify="center" 
              align="center" 
              h="100%" 
              bg="gray.50"
              color="gray.500"
              fontSize="lg"
            >
              Select a conversation to start chatting
            </Flex>
          )}
        </Flex>
      )}
      
      {/* Reconnection Modal */}
      <Modal isOpen={isReconnectModalOpen} onClose={closeReconnectModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Connection Lost</ModalHeader>
          <ModalBody>
            <Text>
              You've been disconnected from the chat server. Would you like to try reconnecting?
            </Text>
            {connectionAttempts > 0 && (
              <Text mt="2" color="red.500">
                Previous attempts: {connectionAttempts}
              </Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={closeReconnectModal}>
              Dismiss
            </Button>
            <Button colorScheme="blue" onClick={handleManualReconnect}>
              Reconnect
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default ChatPage; 