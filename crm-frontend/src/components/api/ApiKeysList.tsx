import React, { useState } from 'react';
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Flex,
  Text,
  Spinner,
  useClipboard,
  Input,
  useColorModeValue,
} from '@chakra-ui/react';
import { ChevronDownIcon, DeleteIcon, CopyIcon, LockIcon, CheckIcon } from '@chakra-ui/icons';
import { ApiKey } from '../../types/api';
import { format } from 'date-fns';

interface ApiKeysListProps {
  apiKeys: ApiKey[];
  isLoading: boolean;
  onCreateKey: () => void;
  onRevokeKey: (id: string) => Promise<void>;
}

const ApiKeysList: React.FC<ApiKeysListProps> = ({
  apiKeys,
  isLoading,
  onCreateKey,
  onRevokeKey,
}) => {
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const toast = useToast();
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const tableBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Copy to clipboard functionality
  const { hasCopied, onCopy } = useClipboard("");
  const [copyKey, setCopyKey] = useState("");
  
  const handleCopy = (key: string) => {
    setCopyKey(key);
    setTimeout(() => {
      onCopy();
    }, 100);
  };

  const handleRevoke = async () => {
    if (!selectedKey) return;
    
    setIsRevoking(true);
    try {
      await onRevokeKey(selectedKey.id);
      toast({
        title: 'API key revoked',
        description: `The API key "${selectedKey.name}" has been revoked successfully.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to revoke API key: ${error instanceof Error ? error.message : 'Unknown error'}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsRevoking(false);
      setIsAlertOpen(false);
      setSelectedKey(null);
    }
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="200px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box>
      <Flex justifyContent="space-between" mb={4}>
        <Text fontSize="lg" fontWeight="bold">API Keys</Text>
        <Button colorScheme="blue" onClick={onCreateKey}>
          Create New API Key
        </Button>
      </Flex>

      {apiKeys.length === 0 ? (
        <Box p={5} textAlign="center" borderWidth="1px" borderRadius="lg">
          <Text mb={4}>No API keys found. Create your first API key to integrate with external services.</Text>
          <Button colorScheme="blue" onClick={onCreateKey}>
            Create API Key
          </Button>
        </Box>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple" bg={tableBg} borderWidth="1px" borderRadius="lg" borderColor={borderColor}>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Key</Th>
                <Th>Status</Th>
                <Th>Created</Th>
                <Th>Last Used</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {apiKeys.map((key) => (
                <Tr key={key.id}>
                  <Td fontWeight="medium">{key.name}</Td>
                  <Td>
                    <Flex align="center">
                      <Text mr={2} as="span" fontFamily="mono">
                        {key.key.substring(0, 10)}...
                      </Text>
                      <Input 
                        type="hidden" 
                        value={key.key}
                        aria-hidden="true"
                        id={`key-${key.id}`}
                      />
                      <IconButton
                        aria-label="Copy API key"
                        icon={hasCopied && copyKey === key.key ? <CheckIcon /> : <CopyIcon />}
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopy(key.key)}
                      />
                    </Flex>
                  </Td>
                  <Td>
                    <Badge colorScheme={key.isActive ? 'green' : 'red'}>
                      {key.isActive ? 'Active' : 'Revoked'}
                    </Badge>
                  </Td>
                  <Td>{format(new Date(key.createdAt), 'MMM d, yyyy')}</Td>
                  <Td>
                    {key.lastUsed
                      ? format(new Date(key.lastUsed), 'MMM d, yyyy')
                      : 'Never used'}
                  </Td>
                  <Td>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<ChevronDownIcon />}
                        variant="ghost"
                        size="sm"
                      />
                      <MenuList>
                        <MenuItem
                          icon={<DeleteIcon />}
                          color="red.500"
                          onClick={() => {
                            setSelectedKey(key);
                            setIsAlertOpen(true);
                          }}
                          isDisabled={!key.isActive}
                        >
                          Revoke Key
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      <AlertDialog
        isOpen={isAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsAlertOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Revoke API Key
            </AlertDialogHeader>

            <AlertDialogBody>
              <Text>
                Are you sure you want to revoke the API key "{selectedKey?.name}"?
              </Text>
              <Text mt={2} fontWeight="bold" color="red.500">
                This action cannot be undone. All applications using this key will immediately lose access.
              </Text>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsAlertOpen(false)}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleRevoke}
                ml={3}
                leftIcon={<LockIcon />}
                isLoading={isRevoking}
                loadingText="Revoking"
              >
                Revoke
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default ApiKeysList; 