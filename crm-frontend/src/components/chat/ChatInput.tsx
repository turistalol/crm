import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Box, 
  Flex, 
  Input, 
  IconButton, 
  Popover, 
  PopoverTrigger, 
  PopoverContent, 
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Text,
  Progress
} from '@chakra-ui/react';
import { EmojiClickData } from 'emoji-picker-react';
import EmojiPicker from 'emoji-picker-react';
import { useDropzone } from 'react-dropzone';
import { QuickReply, MediaType } from '../../types/chat';

// Custom icons since they're not available in Chakra UI
const SmileIcon = (props: React.SVGAttributes<SVGElement>) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path>
    <path d="M14.829 14.828a4.055 4.055 0 0 1-1.272.858 4.002 4.002 0 0 1-4.875-1.45.999.999 0 1 1 1.749-.96A1.993 1.993 0 0 0 12 14.001c.551 0 1.065-.182 1.484-.51a1.998 1.998 0 0 0 .825-1.103c.074-.301.363-.509.674-.551.31-.042.623.101.779.374.156.273.149.609-.033.873z"></path>
    <path d="M8.999 9.999a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm6-2a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"></path>
  </svg>
);

const PaperClipIcon = (props: React.SVGAttributes<SVGElement>) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M4.5 3a2.5 2.5 0 0 1 5 0v9a1.5 1.5 0 0 1-3 0V5a.5.5 0 0 1 1 0v7a.5.5 0 0 0 1 0V3a1.5 1.5 0 1 0-3 0v9a2.5 2.5 0 0 0 5 0V5a.5.5 0 0 1 1 0v7a3.5 3.5 0 1 1-7 0V3z"></path>
  </svg>
);

const SendIcon = (props: React.SVGAttributes<SVGElement>) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M476.59 227.05l-.16-.07L49.35 49.84A23.56 23.56 0 0027.14 52 24.65 24.65 0 0016 72.59v113.29a24 24 0 0019.52 23.57l232.93 43.07a4 4 0 010 7.86L35.53 303.45A24 24 0 0016 327v113.31A23.57 23.57 0 0026.59 460a23.94 23.94 0 0013.22 4 24.55 24.55 0 009.52-1.93L476.4 285.94l.19-.09a32 32 0 000-58.8z"></path>
  </svg>
);

interface ChatInputProps {
  chatId: string;
  onSendMessage: (content: string, mediaUrl?: string, mediaType?: MediaType) => Promise<void>;
  quickReplies?: QuickReply[];
  onTyping?: (isTyping: boolean) => void;
  isConnected?: boolean;
}

// Helper function for image compression
const compressImage = async (file: File, maxWidth = 1024, quality = 0.8): Promise<File> => {
  return new Promise<File>((resolve, reject) => {
    // Skip compression for small images or non-image files
    if (!file.type.startsWith('image/') || file.size < 100 * 1024) {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          const ratio = maxWidth / width;
          width = maxWidth;
          height = height * ratio;
        }
        
        // Create canvas for compression
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Could not get canvas context'));
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error('Could not create blob'));
          
          // Create new file from blob with same name but compressed
          const compressedFile = new File(
            [blob], 
            file.name, 
            { 
              type: file.type,
              lastModified: Date.now()
            }
          );
          
          resolve(compressedFile);
        }, file.type, quality);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
  });
};

const ChatInput: React.FC<ChatInputProps> = ({ 
  chatId, 
  onSendMessage, 
  quickReplies = [],
  onTyping,
  isConnected = true
}) => {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isOpen: isEmojiOpen, onToggle: onEmojiToggle, onClose: onEmojiClose } = useDisclosure();
  const { onClose: onQuickReplyClose } = useDisclosure();

  // Handle typing indicator
  useEffect(() => {
    if (!onTyping) return;
    
    let typingTimeout: ReturnType<typeof setTimeout> | undefined;
    
    if (message.trim()) {
      onTyping(true);
      
      // Clear previous timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
      // Set new timeout to stop typing indicator after 3 seconds of inactivity
      typingTimeout = setTimeout(() => {
        onTyping(false);
      }, 3000);
    } else {
      onTyping(false);
    }
    
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [message, onTyping]);

  // Handle message sending with file upload simulation
  const handleSendMessage = useCallback(() => {
    if (message.trim() || selectedFile) {
      // Logic to handle message sending
      const mediaType = selectedFile ? 
        (selectedFile.type.startsWith('image/') ? MediaType.IMAGE : 
         selectedFile.type.startsWith('video/') ? MediaType.VIDEO :
         selectedFile.type.startsWith('audio/') ? MediaType.AUDIO :
         MediaType.DOCUMENT) : undefined;
      
      try {
        // If we have a file, simulate upload with progress
        if (selectedFile) {
          setIsUploading(true);
          setUploadProgress(0);
          
          // Simulate file upload with progress
          const uploadSimulation = setInterval(() => {
            setUploadProgress(prev => {
              const newProgress = prev + 10;
              if (newProgress >= 100) {
                clearInterval(uploadSimulation);
                setIsUploading(false);
                
                // Send message after "upload" completes
                onSendMessage(
                  message, 
                  URL.createObjectURL(selectedFile), 
                  mediaType
                ).catch(error => {
                  console.error('Error sending message:', error);
                });
                
                setMessage('');
                setSelectedFile(null);
                setPreview(null);
                return 100;
              }
              return newProgress;
            });
          }, 200);
        } else {
          // Text-only message, send immediately
          onSendMessage(message).catch(error => {
            console.error('Error sending message:', error);
          });
          
          setMessage('');
        }
      } catch (error) {
        console.error('Error preparing message:', error);
        setIsUploading(false);
      }
    }
  }, [message, selectedFile, onSendMessage]);

  // File upload handling with react-dropzone
  const { getRootProps, getInputProps, open } = useDropzone({
    noClick: true,
    noKeyboard: true,
    accept: {
      'image/*': [],
      'video/*': [],
      'audio/*': [],
      'application/pdf': [],
      'application/msword': [],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': []
    },
    onDrop: async (acceptedFiles) => {
      // Take only the first file for simplicity
      const file = acceptedFiles[0];
      if (file) {
        try {
          // Apply compression if it's an image file
          let fileToUpload = file;
          
          if (file.type.startsWith('image/')) {
            // Show compressed status
            setIsUploading(true);
            setUploadProgress(0);
            
            // Simulate progress for compression process
            const compressionInterval = setInterval(() => {
              setUploadProgress(prev => Math.min(prev + 5, 40));
            }, 100);
            
            // Compress the image
            const compressedFile = await compressImage(file);
            fileToUpload = compressedFile as typeof file;
            
            clearInterval(compressionInterval);
            setUploadProgress(50); // Set to 50% after compression
            
            console.log(`Compressed ${file.name} from ${Math.round(file.size / 1024)}KB to ${Math.round(fileToUpload.size / 1024)}KB`);
          }
          
          setSelectedFile(fileToUpload);
          
          // Create preview for images
          if (fileToUpload.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => {
              setPreview(reader.result as string);
              setIsUploading(false);
              setUploadProgress(0);
            };
            reader.readAsDataURL(fileToUpload);
          } else {
            // For non-image files, just show the name
            setPreview(null);
          }
        } catch (error) {
          console.error('Error processing file:', error);
          setIsUploading(false);
          setUploadProgress(0);
        }
      }
    },
    maxSize: 10 * 1024 * 1024 // 10MB max file size
  });

  return (
    <Box
      p={4}
      borderTop="1px"
      borderColor="gray.200"
      bg="white"
      position="relative"
    >
      {/* Connection status indicator */}
      {!isConnected && (
        <Box 
          position="absolute" 
          top="-6" 
          left="0" 
          right="0" 
          textAlign="center"
          bg="red.500"
          color="white"
          fontSize="xs"
          py="1"
        >
          Offline Mode - Some features may be limited
        </Box>
      )}
      
      {/* Quick replies row */}
      {quickReplies.length > 0 && (
        <Flex overflowX="auto" pb={2} mb={2} css={{ scrollbarWidth: 'thin' }}>
          {quickReplies.slice(0, 5).map((reply) => (
            <Button
              key={reply.id}
              size="sm"
              mr={2}
              colorScheme="blue"
              variant="outline"
              onClick={() => {
                setMessage(reply.content);
                if (inputRef.current) {
                  inputRef.current.focus();
                }
              }}
              flexShrink={0}
            >
              {reply.title}
            </Button>
          ))}
          {quickReplies.length > 5 && (
            <Menu>
              <MenuButton 
                as={Button} 
                size="sm" 
                variant="ghost" 
                colorScheme="blue"
              >
                More...
              </MenuButton>
              <MenuList>
                {quickReplies.slice(5).map((reply) => (
                  <MenuItem 
                    key={reply.id}
                    onClick={() => {
                      setMessage(reply.content);
                      if (inputRef.current) {
                        inputRef.current.focus();
                      }
                    }}
                  >
                    {reply.title}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
          )}
        </Flex>
      )}
      
      {/* Selected file preview */}
      {selectedFile && (
        <Flex 
          p={2} 
          borderRadius="md" 
          bg="gray.100" 
          mb={2} 
          direction="column"
        >
          <Flex justify="space-between" align="center">
            <Text fontSize="sm" noOfLines={1}>
              {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
            </Text>
            <Button 
              size="xs" 
              colorScheme="red" 
              onClick={() => {
                setSelectedFile(null);
                setPreview(null);
                setIsUploading(false);
              }}
              isDisabled={isUploading}
            >
              Remove
            </Button>
          </Flex>
          
          {isUploading && (
            <Progress 
              value={uploadProgress} 
              size="xs" 
              colorScheme="blue" 
              mt={2} 
              borderRadius="full"
            />
          )}
        </Flex>
      )}
      
      <Flex>
        <Popover 
          isOpen={isEmojiOpen} 
          onClose={onEmojiClose}
          placement="top-start"
        >
          <PopoverTrigger>
            <IconButton
              aria-label="Emoji"
              icon={<SmileIcon />}
              variant="ghost"
              onClick={onEmojiToggle}
            />
          </PopoverTrigger>
          <PopoverContent>
            <EmojiPicker 
              onEmojiClick={(emojiData: EmojiClickData) => {
                setMessage(prev => prev + emojiData.emoji);
                onEmojiClose();
                if (inputRef.current) {
                  inputRef.current.focus();
                }
              }}
              width="100%"
              height="350px"
            />
          </PopoverContent>
        </Popover>
        
        <IconButton
          aria-label="Attach file"
          icon={<PaperClipIcon />}
          variant="ghost"
          ml={1}
          onClick={open}
        />
        
        <Input
          flex="1"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          mx={2}
          ref={inputRef}
        />
        
        <IconButton
          aria-label="Send message"
          icon={<SendIcon />}
          colorScheme="blue"
          isDisabled={(!message.trim() && !selectedFile) || isUploading || !isConnected}
          onClick={handleSendMessage}
        />
        
        {/* Hidden file input */}
        <input {...getInputProps()} />
      </Flex>
    </Box>
  );
};

export default ChatInput; 