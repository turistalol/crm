import { Box, Tabs, TabList, TabPanels, Tab, TabPanel, Heading } from '@chakra-ui/react';
import QuickReplyManager from '../components/chat/QuickReplyManager';

const ChatSettingsPage = () => {
  return (
    <Box p={5}>
      <Heading size="lg" mb={5}>Chat Settings</Heading>
      
      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab>Quick Replies</Tab>
          <Tab>WhatsApp Connection</Tab>
          <Tab>Notifications</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel>
            <QuickReplyManager />
          </TabPanel>
          
          <TabPanel>
            <Box p={4}>
              <Heading size="md" mb={4}>WhatsApp Connection</Heading>
              {/* WhatsApp connection settings will be implemented in a future update */}
              <p>WhatsApp connection settings will be available in a future update.</p>
            </Box>
          </TabPanel>
          
          <TabPanel>
            <Box p={4}>
              <Heading size="md" mb={4}>Notification Settings</Heading>
              {/* Notification settings will be implemented in a future update */}
              <p>Notification settings will be available in a future update.</p>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default ChatSettingsPage; 