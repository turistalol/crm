import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Switch,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  HStack,
  VStack,
  Code,
  IconButton,
  Tooltip,
  Flex
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, CopyIcon, CheckIcon } from '@chakra-ui/icons';
import { ApiKey } from '../../types/api';
import { createApiKey, getApiKeys, deleteApiKey, updateApiKey } from '../../services/apiService';
import { getUserFromToken } from '../../utils/auth';

interface ApiKeyListProps {
  companyId: string;
}

const ApiKeyList: React.FC<ApiKeyListProps> = ({ companyId }) => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newApiKey, setNewApiKey] = useState<ApiKey | null>(null);
  const [keyName, setKeyName] = useState<string>('');
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const toast = useToast();

  // Load API keys
  useEffect(() => {
    fetchApiKeys();
  }, [companyId]);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const keys = await getApiKeys(companyId);
      setApiKeys(keys);
    } catch (error) {
      toast({
        title: 'Error fetching API keys',
        description: 'Could not load API keys. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApiKey = async () => {
    if (!keyName.trim()) {
      toast({
        title: 'Name required',
        description: 'Please provide a name for the API key',
        status: 'warning',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    try {
      const createdKey = await createApiKey({ name: keyName, companyId });
      setNewApiKey(createdKey);
      setApiKeys([createdKey, ...apiKeys]);
      setKeyName('');
      toast({
        title: 'API key created',
        description: 'New API key has been created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      toast({
        title: 'Error creating API key',
        description: 'Could not create API key. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handleDeleteApiKey = async () => {
    if (!selectedKey) return;

    try {
      await deleteApiKey(selectedKey.id);
      setApiKeys(apiKeys.filter(key => key.id !== selectedKey.id));
      toast({
        title: 'API key deleted',
        description: 'API key has been deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      onDeleteClose();
    } catch (error) {
      toast({
        title: 'Error deleting API key',
        description: 'Could not delete API key. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handleToggleApiKey = async (key: ApiKey) => {
    try {
      const updatedKey = await updateApiKey(key.id, { isActive: !key.isActive });
      setApiKeys(apiKeys.map(k => k.id === key.id ? updatedKey : k));
      toast({
        title: `API key ${updatedKey.isActive ? 'activated' : 'deactivated'}`,
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      toast({
        title: 'Error updating API key',
        description: 'Could not update API key status. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const copyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: 'API key copied',
      description: 'API key has been copied to clipboard',
      status: 'info',
      duration: 2000,
      isClosable: true
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="md">API Keys</Heading>
        <Button 
          leftIcon={<AddIcon />} 
          colorScheme="blue" 
          onClick={onCreateOpen}
        >
          Create New API Key
        </Button>
      </Flex>

      {apiKeys.length === 0 && !loading ? (
        <Box textAlign="center" py={10}>
          <Text>No API keys found. Create your first API key to access the API.</Text>
        </Box>
      ) : (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Created</Th>
              <Th>Last Used</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {apiKeys.map((key) => (
              <Tr key={key.id}>
                <Td fontWeight="medium">{key.name}</Td>
                <Td>{formatDate(key.createdAt)}</Td>
                <Td>{key.lastUsed ? formatDate(key.lastUsed) : 'Never'}</Td>
                <Td>
                  <Badge colorScheme={key.isActive ? 'green' : 'red'}>
                    {key.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </Td>
                <Td>
                  <HStack spacing={2}>
                    <Switch 
                      isChecked={key.isActive} 
                      onChange={() => handleToggleApiKey(key)}
                      colorScheme="green"
                    />
                    <Tooltip label="Delete API key">
                      <IconButton
                        icon={<DeleteIcon />}
                        aria-label="Delete API key"
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => {
                          setSelectedKey(key);
                          onDeleteOpen();
                        }}
                      />
                    </Tooltip>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      {/* Create API Key Modal */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New API Key</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {!newApiKey ? (
              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input 
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  placeholder="Enter a name for this API key"
                />
              </FormControl>
            ) : (
              <VStack spacing={4} align="stretch">
                <Text fontWeight="bold">Your API Key has been created</Text>
                <Text fontSize="sm" color="red.500">
                  This is the only time you'll be able to view this API key. Please copy it now.
                </Text>
                <Box position="relative">
                  <Code p={3} fontSize="sm" width="100%" borderRadius="md">
                    {newApiKey.key}
                  </Code>
                  <IconButton
                    icon={copied ? <CheckIcon /> : <CopyIcon />}
                    aria-label="Copy API key"
                    size="xs"
                    position="absolute"
                    top={2}
                    right={2}
                    colorScheme={copied ? "green" : "blue"}
                    onClick={() => copyApiKey(newApiKey.key)}
                  />
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            {!newApiKey ? (
              <>
                <Button variant="ghost" mr={3} onClick={onCreateClose}>
                  Cancel
                </Button>
                <Button colorScheme="blue" onClick={handleCreateApiKey}>
                  Create
                </Button>
              </>
            ) : (
              <Button colorScheme="blue" onClick={onCreateClose}>
                Done
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete API Key
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this API key? This action cannot be undone 
              and any applications using this key will no longer be able to access the API.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteApiKey} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default ApiKeyList; 