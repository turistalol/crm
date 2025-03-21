import { useEffect, useRef, useState } from 'react';
import { Box, VStack, Flex, Text, Avatar, Badge, Spinner, IconButton, Image, Icon, Link } from '@chakra-ui/react';
import { ArrowBackIcon, DownloadIcon, AttachmentIcon } from '@chakra-ui/icons';
import { Chat, Message, MessageDirection, MessageStatus, MediaType } from '../../types/chat';
import { getMessagesByChat } from '../../services/chatService';
import { formatDistanceToNow } from 'date-fns';

interface ChatWindowProps {
  chat: Chat;
  onBack?: () => void;
  isMobile?: boolean;
  isConnected?: boolean;
}

const ChatWindow = ({ chat, onBack, isMobile = false, isConnected = true }: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        setIsLoading(true);
        const data = await getMessagesByChat(chat.id);
        setMessages(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading messages:', error);
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [chat.id]);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const getStatusText = (status: MessageStatus) => {
    switch (status) {
      case MessageStatus.SENT:
        return 'Sent';
      case MessageStatus.DELIVERED:
        return 'Delivered';
      case MessageStatus.READ:
        return 'Read';
      case MessageStatus.FAILED:
        return 'Failed';
      default:
        return '';
    }
  };

  const getMediaContent = (message: Message) => {
    if (!message.mediaUrl) return null;

    const getFileExtension = (url: string) => {
      const parts = url.split('.');
      if (parts.length > 1) {
        return parts[parts.length - 1].toLowerCase();
      }
      return null;
    };

    const getFileIcon = (extension: string | null) => {
      // Common file types
      switch (extension) {
        case 'pdf':
          return '📄';
        case 'doc':
        case 'docx':
          return '📝';
        case 'xls':
        case 'xlsx':
          return '📊';
        case 'ppt':
        case 'pptx':
          return '📑';
        case 'zip':
        case 'rar':
          return '🗄️';
        case 'txt':
          return '📄';
        default:
          return '📎';
      }
    };

    const fileExtension = getFileExtension(message.mediaUrl);

    switch (message.mediaType) {
      case MediaType.IMAGE:
        return (
          <Box maxW="250px" borderRadius="md" overflow="hidden" mt={2}>
            <Image 
              src={message.mediaUrl} 
              alt="Media" 
              width="100%" 
              fallback={
                <Flex 
                  height="150px" 
                  bg="gray.100" 
                  justifyContent="center" 
                  alignItems="center"
                  borderRadius="md"
                >
                  <Text>Image could not be loaded</Text>
                </Flex>
              }
              onClick={() => window.open(message.mediaUrl, '_blank')}
              cursor="pointer"
              _hover={{ opacity: 0.9 }}
              transition="opacity 0.2s"
            />
          </Box>
        );
      case MediaType.VIDEO:
        return (
          <Box maxW="250px" borderRadius="md" overflow="hidden" mt={2}>
            <video 
              src={message.mediaUrl} 
              controls 
              style={{ width: '100%', borderRadius: '8px' }}
              preload="metadata"
            />
          </Box>
        );
      case MediaType.AUDIO:
        return (
          <Box maxW="250px" mt={2} bg="gray.50" p={2} borderRadius="md">
            <Text fontSize="xs" mb={1} color="gray.500">Audio message</Text>
            <audio 
              src={message.mediaUrl} 
              controls 
              style={{ width: '100%' }}
              preload="metadata"
            />
          </Box>
        );
      case MediaType.DOCUMENT:
        return (
          <Flex 
            mt={2} 
            p={3} 
            bg="gray.50" 
            borderRadius="md" 
            alignItems="center"
            maxW="250px"
            cursor="pointer"
            _hover={{ bg: 'gray.100' }}
            onClick={() => window.open(message.mediaUrl, '_blank')}
          >
            <Box mr={3} fontSize="24px">
              {getFileIcon(fileExtension)}
            </Box>
            <Box flex="1" overflow="hidden">
              <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                {message.mediaUrl.split('/').pop() || 'Document'}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {fileExtension ? fileExtension.toUpperCase() : 'File'}
              </Text>
            </Box>
            <Icon as={DownloadIcon} ml={2} color="blue.500" boxSize={4} />
          </Flex>
        );
      default:
        return null;
    }
  };

  return (
    <Box w="100%" h="100%">
      {/* Chat Header */}
      <Flex 
        align="center" 
        p={4} 
        borderBottom="1px" 
        borderColor="gray.200" 
        bg="white"
        position="sticky"
        top={0}
        zIndex={1}
      >
        {isMobile && (
          <IconButton
            icon={<ArrowBackIcon />}
            aria-label="Back"
            mr={2}
            onClick={onBack}
            variant="ghost"
          />
        )}
        <Avatar 
          size="md" 
          name={chat.contact.name} 
          src={chat.contact.profilePic} 
          mr={3}
        />
        <Box flex="1">
          <Text fontWeight="bold">{chat.contact.name}</Text>
          <Text fontSize="sm" color="gray.500">{chat.contact.phoneNumber}</Text>
        </Box>
        <Flex align="center">
          <Badge 
            colorScheme={isConnected ? "green" : "red"}
            borderRadius="full"
            px={2}
          >
            {isConnected ? "Connected" : "Offline"}
          </Badge>
        </Flex>
      </Flex>

      {/* Messages */}
      <Box 
        p={4} 
        pb={20} 
        bg="gray.50" 
        h="calc(100% - 80px)"
        overflowY="auto"
      >
        {isLoading ? (
          <Flex justify="center" align="center" h="100%">
            <Spinner />
          </Flex>
        ) : (
          <VStack spacing={4} align="stretch">
            {messages.length === 0 ? (
              <Flex justify="center" align="center" h="300px">
                <Text color="gray.500">No messages yet</Text>
              </Flex>
            ) : (
              messages.map((message) => (
                <Flex 
                  key={message.id} 
                  justify={message.direction === MessageDirection.OUTBOUND ? 'flex-end' : 'flex-start'}
                >
                  <Box 
                    maxW="70%" 
                    p={3}
                    borderRadius="lg"
                    bg={message.direction === MessageDirection.OUTBOUND ? 'blue.500' : 'white'}
                    color={message.direction === MessageDirection.OUTBOUND ? 'white' : 'black'}
                    boxShadow="sm"
                  >
                    <Text>{message.content}</Text>
                    {getMediaContent(message)}
                    <Flex justify="flex-end" mt={1}>
                      <Text fontSize="xs" color={message.direction === MessageDirection.OUTBOUND ? 'whiteAlpha.700' : 'gray.500'}>
                        {formatTime(message.createdAt)}
                      </Text>
                      {message.direction === MessageDirection.OUTBOUND && (
                        <Badge 
                          ml={1}
                          fontSize="2xs"
                          colorScheme={
                            message.status === MessageStatus.READ 
                              ? 'green' 
                              : message.status === MessageStatus.DELIVERED 
                              ? 'blue' 
                              : message.status === MessageStatus.FAILED 
                              ? 'red' 
                              : 'gray'
                          }
                        >
                          {getStatusText(message.status)}
                        </Badge>
                      )}
                    </Flex>
                  </Box>
                </Flex>
              ))
            )}
            <div ref={messagesEndRef} />
          </VStack>
        )}
      </Box>
    </Box>
  );
};

export default ChatWindow; 