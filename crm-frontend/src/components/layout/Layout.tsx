import React, { ReactNode } from 'react';
import { Box, Flex, useColorMode } from '@chakra-ui/react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { colorMode } = useColorMode();

  return (
    <Flex direction="column" h="100vh">
      <Navbar />
      <Flex flex="1">
        <Sidebar />
        <Box
          flex="1"
          p={4}
          bg={colorMode === 'light' ? 'gray.50' : 'gray.900'}
          overflowY="auto"
        >
          {children}
        </Box>
      </Flex>
    </Flex>
  );
};

export default Layout; 