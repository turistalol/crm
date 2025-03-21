import { useState, useEffect, useCallback } from 'react';
import { 
  Box,
  VStack,
  Text,
  Flex,
  Avatar,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
  Divider,
  Skeleton,
  SkeletonCircle,
  SkeletonText
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { getAllChats } from '../../services/chatService';
import { Chat } from '../../types/chat';
import { formatDistanceToNow } from 'date-fns';

interface ChatListProps {
  onSelect: (chat: Chat) => void;
  selectedChatId?: string;
  chats?: Chat[];
  unreadCounts?: Record<string, number>;
  isLoading?: boolean;
}

const ChatList = ({ 
  onSelect, 
  selectedChatId, 
  chats: initialChats, 
  unreadCounts = {}, 
  isLoading = false 
}: ChatListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState<Chat[]>([]);

  // Load chats if not provided
  useEffect(() => {
    const loadChats = async () => {
      if (initialChats) {
        setChats(initialChats);
      } else {
        try {
          const data = await getAllChats();
          setChats(data);
        } catch (error) {
          console.error('Error loading chats:', error);
        }
      }
    };
    
    loadChats();
  }, [initialChats]);

  // Filter chats based on search query
  const filteredChats = chats.filter(chat => 
    chat.contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format timestamp
  const formatTime = useCallback((timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return '';
    }
  }, []);

  return (
    <Box h="100%">
      <Box p={4} borderBottom="1px" borderColor="gray.200">
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search conversations"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="filled"
            bg="gray.100"
            _focus={{ bg: 'white' }}
          />
        </InputGroup>
      </Box>
      
      <Box overflowY="auto" h="calc(100% - 72px)" p={2}>
        {isLoading ? (
          // Loading skeletons
          <VStack spacing={4} align="stretch">
            {[...Array(5)].map((_, i) => (
              <Flex key={i} p={3} gap={3} align="center">
                <SkeletonCircle size="12" />
                <Box flex="1">
                  <Skeleton height="20px" width="60%" mb={2} />
                  <SkeletonText noOfLines={1} spacing="4" />
                </Box>
              </Flex>
            ))}
          </VStack>
        ) : filteredChats.length === 0 ? (
          <Flex 
            justify="center" 
            align="center" 
            h="100%" 
            color="gray.500"
          >
            No conversations found
          </Flex>
        ) : (
          <VStack spacing={1} align="stretch">
            {filteredChats.map(chat => (
              <Box
                key={chat.id}
                p={3}
                borderRadius="md"
                cursor="pointer"
                bg={selectedChatId === chat.id ? 'blue.50' : 'transparent'}
                _hover={{ bg: selectedChatId === chat.id ? 'blue.50' : 'gray.50' }}
                onClick={() => onSelect(chat)}
                position="relative"
              >
                <Flex gap={3} align="center">
                  <Avatar 
                    name={chat.contact.name} 
                    src={chat.contact.profilePic} 
                    size="md" 
                  />
                  <Box flex="1" overflow="hidden">
                    <Flex justify="space-between" align="center">
                      <Text fontWeight="bold" noOfLines={1}>
                        {chat.contact.name}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {chat.lastMessage && formatTime(chat.lastMessage.createdAt)}
                      </Text>
                    </Flex>
                    <Flex justify="space-between" align="center">
                      <Text fontSize="sm" color="gray.600" noOfLines={1}>
                        {chat.lastMessage?.content || "No messages yet"}
                      </Text>
                      
                      {/* Unread count badge */}
                      {unreadCounts[chat.id] > 0 && (
                        <Badge 
                          colorScheme="blue" 
                          borderRadius="full" 
                          px={2}
                          fontSize="xs"
                        >
                          {unreadCounts[chat.id]}
                        </Badge>
                      )}
                    </Flex>
                  </Box>
                </Flex>
                <Divider mt={2} />
              </Box>
            ))}
          </VStack>
        )}
      </Box>
    </Box>
  );
};

export default ChatList; 