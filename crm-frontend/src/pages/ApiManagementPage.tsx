import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useDisclosure,
  useToast,
  Heading,
  Flex,
} from '@chakra-ui/react';
import { useAuth } from '../hooks/useAuth';
import ApiKeysList from '../components/api/ApiKeysList';
import WebhooksList from '../components/api/WebhooksList';
import CreateApiKeyModal from '../components/api/CreateApiKeyModal';
import CreateWebhookModal from '../components/api/CreateWebhookModal';
import ApiDocumentation from '../components/api/ApiDocumentation';
import { ApiKey, CreateApiKeyDto, Webhook, CreateWebhookDto, UpdateWebhookDto } from '../types/api';
import apiManagementService from '../services/apiManagementService';

const ApiManagementPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  
  // API Keys state
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoadingKeys, setIsLoadingKeys] = useState(true);
  const { isOpen: isApiKeyModalOpen, onOpen: onApiKeyModalOpen, onClose: onApiKeyModalClose } = useDisclosure();
  
  // Webhooks state
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [isLoadingWebhooks, setIsLoadingWebhooks] = useState(true);
  const { isOpen: isWebhookModalOpen, onOpen: onWebhookModalOpen, onClose: onWebhookModalClose } = useDisclosure();
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);

  useEffect(() => {
    if (user?.companyId) {
      fetchApiKeys();
      fetchWebhooks();
    }
  }, [user?.companyId]);

  // API Keys functions
  const fetchApiKeys = async () => {
    if (!user?.companyId) return;
    
    setIsLoadingKeys(true);
    try {
      const keys = await apiManagementService.getApiKeys(user.companyId);
      setApiKeys(keys);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      toast({
        title: 'Error',
        description: 'Failed to load API keys. Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoadingKeys(false);
    }
  };

  const handleCreateKey = async (data: CreateApiKeyDto): Promise<ApiKey> => {
    try {
      const newKey = await apiManagementService.createApiKey(data);
      setApiKeys([newKey, ...apiKeys]);
      return newKey;
    } catch (error) {
      console.error('Error creating API key:', error);
      throw error;
    }
  };

  const handleRevokeKey = async (id: string): Promise<void> => {
    try {
      await apiManagementService.updateApiKey(id, { isActive: false });
      setApiKeys(
        apiKeys.map((key) =>
          key.id === id ? { ...key, isActive: false } : key
        )
      );
    } catch (error) {
      console.error('Error revoking API key:', error);
      throw error;
    }
  };

  // Webhooks functions
  const fetchWebhooks = async () => {
    if (!user?.companyId) return;
    
    setIsLoadingWebhooks(true);
    try {
      const hooks = await apiManagementService.getWebhooks(user.companyId);
      setWebhooks(hooks);
    } catch (error) {
      console.error('Error fetching webhooks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load webhooks. Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoadingWebhooks(false);
    }
  };

  const handleCreateWebhook = async (data: CreateWebhookDto): Promise<Webhook> => {
    try {
      const newWebhook = await apiManagementService.createWebhook(data);
      setWebhooks([newWebhook, ...webhooks]);
      return newWebhook;
    } catch (error) {
      console.error('Error creating webhook:', error);
      throw error;
    }
  };

  const handleUpdateWebhook = async (id: string, data: UpdateWebhookDto): Promise<Webhook> => {
    try {
      const updatedWebhook = await apiManagementService.updateWebhook(id, data);
      setWebhooks(
        webhooks.map((webhook) =>
          webhook.id === id ? updatedWebhook : webhook
        )
      );
      return updatedWebhook;
    } catch (error) {
      console.error('Error updating webhook:', error);
      throw error;
    }
  };

  const handleDeleteWebhook = async (id: string): Promise<void> => {
    try {
      await apiManagementService.deleteWebhook(id);
      setWebhooks(webhooks.filter((webhook) => webhook.id !== id));
    } catch (error) {
      console.error('Error deleting webhook:', error);
      throw error;
    }
  };

  const handleTestWebhook = async (id: string): Promise<void> => {
    try {
      await apiManagementService.testWebhook(id);
    } catch (error) {
      console.error('Error testing webhook:', error);
      throw error;
    }
  };

  const handleEditWebhook = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    onWebhookModalOpen();
  };

  return (
    <Container maxW="container.xl" py={5}>
      <Flex justifyContent="space-between" alignItems="center" mb={5}>
        <Heading size="lg">API & Integrations</Heading>
      </Flex>

      <Tabs variant="enclosed" isLazy>
        <TabList>
          <Tab>API Keys</Tab>
          <Tab>Webhooks</Tab>
          <Tab>Documentation</Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0}>
            <Box>
              <ApiKeysList
                apiKeys={apiKeys}
                isLoading={isLoadingKeys}
                onCreateKey={onApiKeyModalOpen}
                onRevokeKey={handleRevokeKey}
              />
            </Box>
          </TabPanel>

          <TabPanel px={0}>
            <Box>
              <WebhooksList
                webhooks={webhooks}
                isLoading={isLoadingWebhooks}
                onCreateWebhook={onWebhookModalOpen}
                onEditWebhook={handleEditWebhook}
                onDeleteWebhook={handleDeleteWebhook}
                onTestWebhook={handleTestWebhook}
              />
            </Box>
          </TabPanel>

          <TabPanel>
            <Box>
              <ApiDocumentation />
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {user && (
        <>
          <CreateApiKeyModal
            isOpen={isApiKeyModalOpen}
            onClose={onApiKeyModalClose}
            onCreateKey={handleCreateKey}
            companyId={user.companyId || ''}
          />

          <CreateWebhookModal
            isOpen={isWebhookModalOpen}
            onClose={() => {
              onWebhookModalClose();
              setSelectedWebhook(null);
            }}
            onCreateWebhook={handleCreateWebhook}
            onUpdateWebhook={handleUpdateWebhook}
            companyId={user.companyId || ''}
            webhookToEdit={selectedWebhook}
          />
        </>
      )}
    </Container>
  );
};

export default ApiManagementPage; 