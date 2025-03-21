import React, { useState } from 'react';
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
  Code,
  useClipboard,
  Flex,
  IconButton,
} from '@chakra-ui/react';
import { CopyIcon, CheckIcon } from '@chakra-ui/icons';
import { useForm } from 'react-hook-form';
import { ApiKey, CreateApiKeyDto } from '../../types/api';

interface CreateApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateKey: (data: CreateApiKeyDto) => Promise<ApiKey>;
  companyId: string;
}

interface FormData {
  name: string;
}

const CreateApiKeyModal: React.FC<CreateApiKeyModalProps> = ({
  isOpen,
  onClose,
  onCreateKey,
  companyId,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdKey, setCreatedKey] = useState<ApiKey | null>(null);
  const toast = useToast();
  const { hasCopied, onCopy } = useClipboard(createdKey?.key || '');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  const handleCreateKey = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const newKey = await onCreateKey({
        name: data.name,
        companyId,
      });
      setCreatedKey(newKey);
      reset();
    } catch (error) {
      console.error('Error creating API key:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create API key',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCreatedKey(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create API Key</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {createdKey ? (
            <Box>
              <Alert status="success" mb={4}>
                <AlertIcon />
                API key created successfully
              </Alert>
              <Text mb={2} fontWeight="bold">
                API Key: {createdKey.name}
              </Text>
              <Box position="relative" mb={4}>
                <Code p={2} borderRadius="md" width="100%" display="block" fontFamily="mono" fontSize="sm">
                  {createdKey.key}
                </Code>
                <IconButton
                  aria-label="Copy API key"
                  icon={hasCopied ? <CheckIcon /> : <CopyIcon />}
                  position="absolute"
                  top="2px"
                  right="2px"
                  size="sm"
                  onClick={onCopy}
                />
              </Box>
              <Alert status="warning">
                <AlertIcon />
                <Text>
                  Make sure to copy this key now. For security reasons, you won't be able to view it
                  again after closing this dialog.
                </Text>
              </Alert>
            </Box>
          ) : (
            <form id="create-key-form" onSubmit={handleSubmit(handleCreateKey)}>
              <FormControl isInvalid={!!errors.name} isRequired>
                <FormLabel htmlFor="name">Key Name</FormLabel>
                <Input
                  id="name"
                  placeholder="E.g., Production API Key"
                  {...register('name', {
                    required: 'Key name is required',
                    minLength: {
                      value: 3,
                      message: 'Key name must be at least 3 characters',
                    },
                  })}
                />
                <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
              </FormControl>

              <Text mt={4} fontSize="sm" color="gray.500">
                This API key will have full access to your organization's data. Keep it secure and
                never share it publicly.
              </Text>
            </form>
          )}
        </ModalBody>

        <ModalFooter>
          {createdKey ? (
            <Button colorScheme="blue" onClick={handleClose}>
              Done
            </Button>
          ) : (
            <Flex gap={2}>
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                type="submit"
                form="create-key-form"
                isLoading={isSubmitting}
                loadingText="Creating"
              >
                Create Key
              </Button>
            </Flex>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateApiKeyModal; 