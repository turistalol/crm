import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  useToast,
  Alert,
  AlertIcon,
  Box,
  Text,
  Stack,
  CheckboxGroup,
  Checkbox,
  InputGroup,
  InputLeftAddon,
  Flex,
} from '@chakra-ui/react';
import { useForm, Controller } from 'react-hook-form';
import { Webhook, CreateWebhookDto, UpdateWebhookDto } from '../../types/api';
import { WebhookEvent } from '../../types/enums';

interface CreateWebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateWebhook: (data: CreateWebhookDto) => Promise<Webhook>;
  onUpdateWebhook?: (id: string, data: UpdateWebhookDto) => Promise<Webhook>;
  companyId: string;
  webhookToEdit?: Webhook | null;
}

interface FormData {
  name: string;
  url: string;
  events: WebhookEvent[];
}

const CreateWebhookModal: React.FC<CreateWebhookModalProps> = ({
  isOpen,
  onClose,
  onCreateWebhook,
  onUpdateWebhook,
  companyId,
  webhookToEdit,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testStatus, setTestStatus] = useState<{ success: boolean; message: string } | null>(null);
  const toast = useToast();
  const isEditMode = !!webhookToEdit;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      name: '',
      url: '',
      events: [],
    },
  });

  // Load webhook data if in edit mode
  useEffect(() => {
    if (webhookToEdit) {
      setValue('name', webhookToEdit.name);
      setValue('url', webhookToEdit.url);
      setValue('events', webhookToEdit.events);
    }
  }, [webhookToEdit, setValue]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setTestStatus(null);
      if (!isEditMode) {
        reset();
      }
    }
  }, [isOpen, reset, isEditMode]);

  const handleSave = async (data: FormData) => {
    if (data.events.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select at least one event to trigger this webhook.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode && webhookToEdit && onUpdateWebhook) {
        await onUpdateWebhook(webhookToEdit.id, {
          name: data.name,
          url: data.url,
          events: data.events,
        });
        toast({
          title: 'Webhook updated',
          description: 'The webhook has been updated successfully.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        await onCreateWebhook({
          name: data.name,
          url: data.url,
          events: data.events,
          companyId,
        });
        toast({
          title: 'Webhook created',
          description: 'The new webhook has been created successfully.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
      onClose();
    } catch (error) {
      console.error('Error saving webhook:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save webhook',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format event name for display
  const formatEventName = (event: string) => {
    return event.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{isEditMode ? 'Edit Webhook' : 'Create Webhook'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form id="webhook-form" onSubmit={handleSubmit(handleSave)}>
            <Stack spacing={4}>
              <FormControl isInvalid={!!errors.name} isRequired>
                <FormLabel htmlFor="name">Webhook Name</FormLabel>
                <Input
                  id="name"
                  placeholder="E.g., Lead Notifications"
                  {...register('name', {
                    required: 'Webhook name is required',
                    minLength: {
                      value: 3,
                      message: 'Webhook name must be at least 3 characters',
                    },
                  })}
                />
                <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.url} isRequired>
                <FormLabel htmlFor="url">Endpoint URL</FormLabel>
                <Input
                  id="url"
                  placeholder="https://your-app.com/webhook"
                  {...register('url', {
                    required: 'Webhook URL is required',
                    pattern: {
                      value: /^https?:\/\/.+/i,
                      message: 'Must be a valid URL starting with http:// or https://',
                    },
                  })}
                />
                <FormErrorMessage>{errors.url?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Events to Subscribe</FormLabel>
                <Controller
                  control={control}
                  name="events"
                  render={({ field: { onChange, value } }) => (
                    <CheckboxGroup colorScheme="blue" value={value} onChange={onChange}>
                      <Stack spacing={2}>
                        {Object.values(WebhookEvent).map((event) => (
                          <Checkbox key={event} value={event}>
                            {formatEventName(event)}
                          </Checkbox>
                        ))}
                      </Stack>
                    </CheckboxGroup>
                  )}
                />
              </FormControl>

              {testStatus && (
                <Alert status={testStatus.success ? 'success' : 'error'}>
                  <AlertIcon />
                  {testStatus.message}
                </Alert>
              )}

              <Box>
                <Text fontSize="sm" color="gray.500">
                  Webhooks allow external applications to receive notifications when events happen in your CRM.
                  You'll need to configure your application to handle these webhook requests.
                </Text>
              </Box>
            </Stack>
          </form>
        </ModalBody>

        <ModalFooter>
          <Flex gap={2}>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              type="submit"
              form="webhook-form"
              isLoading={isSubmitting}
              loadingText={isEditMode ? 'Updating' : 'Creating'}
            >
              {isEditMode ? 'Update Webhook' : 'Create Webhook'}
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateWebhookModal; 