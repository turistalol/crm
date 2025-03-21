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
  Tooltip,
  useColorModeValue,
  HStack,
  Tag,
} from '@chakra-ui/react';
import { ChevronDownIcon, DeleteIcon, EditIcon, CheckIcon } from '@chakra-ui/icons';
import { Webhook } from '../../types/api';
import { WebhookEvent } from '../../types/enums';
import { format } from 'date-fns';

interface WebhooksListProps {
  webhooks: Webhook[];
  isLoading: boolean;
  onCreateWebhook: () => void;
  onEditWebhook: (webhook: Webhook) => void;
  onDeleteWebhook: (id: string) => Promise<void>;
  onTestWebhook: (id: string) => Promise<void>;
}

const WebhooksList: React.FC<WebhooksListProps> = ({
  webhooks,
  isLoading,
  onCreateWebhook,
  onEditWebhook,
  onDeleteWebhook,
  onTestWebhook,
}) => {
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTesting, setIsTesting] = useState<string | null>(null);
  const toast = useToast();
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const tableBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleDelete = async () => {
    if (!selectedWebhook) return;
    
    setIsDeleting(true);
    try {
      await onDeleteWebhook(selectedWebhook.id);
      toast({
        title: 'Webhook deleted',
        description: `The webhook "${selectedWebhook.name}" has been deleted successfully.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to delete webhook: ${error instanceof Error ? error.message : 'Unknown error'}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
      setIsAlertOpen(false);
      setSelectedWebhook(null);
    }
  };

  const handleTest = async (id: string) => {
    setIsTesting(id);
    try {
      await onTestWebhook(id);
      toast({
        title: 'Test successful',
        description: 'The webhook test was completed successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Test failed',
        description: `Failed to test webhook: ${error instanceof Error ? error.message : 'Unknown error'}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsTesting(null);
    }
  };

  // Helper to render event tags
  const renderEventTags = (events: WebhookEvent[]) => {
    return (
      <HStack spacing={2} wrap="wrap">
        {events.map((event) => (
          <Tag size="sm" key={event} colorScheme="blue">
            {event.replace(/_/g, ' ')}
          </Tag>
        ))}
      </HStack>
    );
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
        <Text fontSize="lg" fontWeight="bold">Webhooks</Text>
        <Button colorScheme="blue" onClick={onCreateWebhook}>
          Create New Webhook
        </Button>
      </Flex>

      {webhooks.length === 0 ? (
        <Box p={5} textAlign="center" borderWidth="1px" borderRadius="lg">
          <Text mb={4}>No webhooks found. Create your first webhook to integrate with external services.</Text>
          <Button colorScheme="blue" onClick={onCreateWebhook}>
            Create Webhook
          </Button>
        </Box>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple" bg={tableBg} borderWidth="1px" borderRadius="lg" borderColor={borderColor}>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>URL</Th>
                <Th>Events</Th>
                <Th>Status</Th>
                <Th>Created</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {webhooks.map((webhook) => (
                <Tr key={webhook.id}>
                  <Td fontWeight="medium">{webhook.name}</Td>
                  <Td>
                    <Text isTruncated maxW="200px">
                      {webhook.url}
                    </Text>
                  </Td>
                  <Td>{renderEventTags(webhook.events)}</Td>
                  <Td>
                    <Badge colorScheme={webhook.isActive ? 'green' : 'red'}>
                      {webhook.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </Td>
                  <Td>{format(new Date(webhook.createdAt), 'MMM d, yyyy')}</Td>
                  <Td>
                    <Menu>
                      <MenuButton
                        as={Button}
                        rightIcon={<ChevronDownIcon />}
                        size="sm"
                        variant="outline"
                      >
                        Actions
                      </MenuButton>
                      <MenuList>
                        <MenuItem
                          icon={<EditIcon />}
                          onClick={() => onEditWebhook(webhook)}
                        >
                          Edit
                        </MenuItem>
                        <MenuItem
                          icon={isTesting === webhook.id ? <Spinner size="sm" /> : <CheckIcon />}
                          isDisabled={isTesting !== null}
                          onClick={() => handleTest(webhook.id)}
                        >
                          Test webhook
                        </MenuItem>
                        <MenuItem
                          icon={<DeleteIcon />}
                          onClick={() => {
                            setSelectedWebhook(webhook);
                            setIsAlertOpen(true);
                          }}
                          color="red.500"
                        >
                          Delete
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
              Delete Webhook
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete the webhook "{selectedWebhook?.name}"? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsAlertOpen(false)}>
                Cancel
              </Button>
              <Button 
                colorScheme="red" 
                onClick={handleDelete} 
                ml={3}
                isLoading={isDeleting}
                loadingText="Deleting"
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default WebhooksList; 