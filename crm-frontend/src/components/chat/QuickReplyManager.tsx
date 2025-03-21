import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Button,
  VStack,
  HStack,
  Text,
  IconButton,
  Flex,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast,
  Spinner
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { QuickReply } from '../../types/chat';
import { 
  getQuickRepliesByCompany, 
  createQuickReply, 
  updateQuickReply, 
  deleteQuickReply 
} from '../../services/chatService';
import { useAuth } from '../../context/AuthContext';

interface QuickReplyFormData {
  id?: string;
  title: string;
  content: string;
}

const QuickReplyManager = () => {
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReply, setSelectedReply] = useState<QuickReplyFormData>({
    title: '',
    content: ''
  });
  const [isEdit, setIsEdit] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { user } = useAuth();

  // Load quick replies
  useEffect(() => {
    const loadQuickReplies = async () => {
      try {
        if (!user?.companyId) {
          setIsLoading(false);
          return;
        }
        
        const data = await getQuickRepliesByCompany(user.companyId);
        setQuickReplies(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading quick replies:', error);
        toast({
          title: 'Error',
          description: 'Failed to load quick replies.',
          status: 'error',
          duration: 5000,
          isClosable: true
        });
        setIsLoading(false);
      }
    };

    loadQuickReplies();
  }, [user, toast]);

  // Handle form submission
  const handleSubmit = async () => {
    try {
      if (!user?.companyId) {
        toast({
          title: 'Error',
          description: 'Company ID is required.',
          status: 'error',
          duration: 5000,
          isClosable: true
        });
        return;
      }

      if (isEdit && selectedReply.id) {
        // Update existing quick reply
        const updated = await updateQuickReply(selectedReply.id, {
          title: selectedReply.title,
          content: selectedReply.content
        });

        setQuickReplies(prevReplies => 
          prevReplies.map(reply => 
            reply.id === updated.id ? updated : reply
          )
        );

        toast({
          title: 'Success',
          description: 'Quick reply updated successfully.',
          status: 'success',
          duration: 5000,
          isClosable: true
        });
      } else {
        // Create new quick reply
        const created = await createQuickReply({
          title: selectedReply.title,
          content: selectedReply.content,
          companyId: user.companyId
        });

        setQuickReplies(prevReplies => [...prevReplies, created]);

        toast({
          title: 'Success',
          description: 'Quick reply created successfully.',
          status: 'success',
          duration: 5000,
          isClosable: true
        });
      }

      handleClose();
    } catch (error) {
      console.error('Error saving quick reply:', error);
      toast({
        title: 'Error',
        description: 'Failed to save quick reply.',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      await deleteQuickReply(id);
      setQuickReplies(prevReplies => 
        prevReplies.filter(reply => reply.id !== id)
      );

      toast({
        title: 'Success',
        description: 'Quick reply deleted successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true
      });
    } catch (error) {
      console.error('Error deleting quick reply:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete quick reply.',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };

  // Handle edit
  const handleEdit = (reply: QuickReply) => {
    setSelectedReply({
      id: reply.id,
      title: reply.title,
      content: reply.content
    });
    setIsEdit(true);
    onOpen();
  };

  // Handle add new
  const handleAddNew = () => {
    setSelectedReply({
      title: '',
      content: ''
    });
    setIsEdit(false);
    onOpen();
  };

  // Handle modal close
  const handleClose = () => {
    setSelectedReply({
      title: '',
      content: ''
    });
    onClose();
  };

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md">Quick Replies</Heading>
        <Button 
          leftIcon={<AddIcon />} 
          colorScheme="blue" 
          size="sm"
          onClick={handleAddNew}
        >
          Add New
        </Button>
      </Flex>

      {isLoading ? (
        <Flex justify="center" py={10}>
          <Spinner />
        </Flex>
      ) : (
        <VStack spacing={3} align="stretch">
          {quickReplies.length === 0 ? (
            <Box textAlign="center" py={10}>
              <Text color="gray.500">No quick replies found</Text>
              <Button 
                mt={4} 
                colorScheme="blue" 
                variant="outline"
                onClick={handleAddNew}
              >
                Create your first quick reply
              </Button>
            </Box>
          ) : (
            quickReplies.map(reply => (
              <Box 
                key={reply.id} 
                p={3} 
                borderWidth="1px" 
                borderRadius="md"
                _hover={{ shadow: 'sm' }}
              >
                <Flex justify="space-between" align="flex-start">
                  <Box flex="1">
                    <Text fontWeight="bold">{reply.title}</Text>
                    <Text fontSize="sm" color="gray.600" noOfLines={2}>
                      {reply.content}
                    </Text>
                  </Box>
                  <HStack spacing={1}>
                    <IconButton
                      icon={<EditIcon />}
                      aria-label="Edit"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(reply)}
                    />
                    <IconButton
                      icon={<DeleteIcon />}
                      aria-label="Delete"
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => handleDelete(reply.id)}
                    />
                  </HStack>
                </Flex>
              </Box>
            ))
          )}
        </VStack>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEdit ? 'Edit Quick Reply' : 'Create Quick Reply'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Title</FormLabel>
                <Input
                  value={selectedReply.title}
                  onChange={(e) => setSelectedReply({
                    ...selectedReply,
                    title: e.target.value
                  })}
                  placeholder="Enter a title for this quick reply"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Content</FormLabel>
                <Textarea
                  value={selectedReply.content}
                  onChange={(e) => setSelectedReply({
                    ...selectedReply,
                    content: e.target.value
                  })}
                  placeholder="Enter the message content"
                  rows={5}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleSubmit}
              isDisabled={!selectedReply.title || !selectedReply.content}
            >
              {isEdit ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default QuickReplyManager; 