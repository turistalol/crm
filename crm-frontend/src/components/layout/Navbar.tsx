import React from 'react';
import {
  Box,
  Flex,
  Text,
  IconButton,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorMode,
} from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      padding={4}
      bg={colorMode === 'light' ? 'white' : 'gray.800'}
      color={colorMode === 'light' ? 'gray.800' : 'white'}
      boxShadow="sm"
    >
      <Text fontSize="xl" fontWeight="bold">
        CRM System
      </Text>

      <Flex align="center">
        <IconButton
          aria-label="Toggle color mode"
          mr={3}
          onClick={toggleColorMode}
          icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
          variant="ghost"
        />

        <Menu>
          <MenuButton>
            <Avatar size="sm" name="User" src="https://bit.ly/broken-link" />
          </MenuButton>
          <MenuList>
            <MenuItem>Profile</MenuItem>
            <MenuItem>Settings</MenuItem>
            <MenuItem>Logout</MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Flex>
  );
};

export default Navbar; 