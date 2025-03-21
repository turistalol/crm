import { useEffect, useState } from 'react';
import { useToast } from '@chakra-ui/react';

interface UseNotificationProps {
  onNotificationClick?: () => void;
}

const useNotification = ({ onNotificationClick }: UseNotificationProps = {}) => {
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [notificationSound] = useState<HTMLAudioElement | null>(
    typeof Audio !== 'undefined' ? new Audio('/notification.mp3') : null
  );
  const toast = useToast();
  
  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          setPermission(permission);
        });
      }
    }
  }, []);
  
  // Play notification sound
  const playSound = () => {
    if (notificationSound) {
      notificationSound.currentTime = 0;
      notificationSound.play().catch(error => {
        console.error('Error playing notification sound:', error);
      });
    }
  };
  
  // Show browser notification
  const showNotification = (title: string, options?: NotificationOptions) => {
    // Show toast notification in the app
    toast({
      title,
      description: options?.body,
      status: 'info',
      duration: 5000,
      isClosable: true,
      position: 'top-right',
    });
    
    // Play sound
    playSound();
    
    // Show browser notification if permission is granted
    if ('Notification' in window && permission === 'granted') {
      const notification = new Notification(title, options);
      
      // Handle notification click
      if (onNotificationClick) {
        notification.onclick = () => {
          window.focus();
          onNotificationClick();
          notification.close();
        };
      }
    }
  };
  
  return {
    showNotification,
    playSound,
    notificationPermission: permission,
  };
};

export default useNotification; 