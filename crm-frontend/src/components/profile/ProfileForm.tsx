import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  Avatar,
  Center,
  Flex,
  FormErrorMessage,
  Divider,
} from '@chakra-ui/react';

// Mock user data
const user = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  avatar: 'https://bit.ly/dan-abramov',
  company: 'Acme Inc.',
  role: 'Admin',
};

const ProfileForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const toast = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: 'Profile updated.',
        description: 'Your profile information has been updated successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    }, 1500);
  };

  return (
    <Box
      p={8}
      bg="white"
      boxShadow="sm"
      borderRadius="lg"
      width="100%"
    >
      <VStack spacing={6} align="flex-start" width="100%">
        <Heading size="md">Profile Information</Heading>
        <Text color="gray.600">Update your personal information</Text>
        
        <Center w="100%">
          <Avatar size="2xl" name={`${user.firstName} ${user.lastName}`} src={user.avatar} />
        </Center>
        
        <Divider />
        
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <VStack spacing={4} width="100%">
            <Flex width="100%" gap={4} direction={{ base: 'column', md: 'row' }}>
              <FormControl isInvalid={!!errors.firstName}>
                <FormLabel>First Name</FormLabel>
                <Input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                />
                <FormErrorMessage>{errors.firstName}</FormErrorMessage>
              </FormControl>
              
              <FormControl isInvalid={!!errors.lastName}>
                <FormLabel>Last Name</FormLabel>
                <Input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                />
                <FormErrorMessage>{errors.lastName}</FormErrorMessage>
              </FormControl>
            </Flex>
            
            <FormControl isInvalid={!!errors.email}>
              <FormLabel>Email Address</FormLabel>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
              <FormErrorMessage>{errors.email}</FormErrorMessage>
            </FormControl>
            
            <FormControl>
              <FormLabel>Company</FormLabel>
              <Input
                value={user.company}
                isReadOnly
                bg="gray.50"
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Role</FormLabel>
              <Input
                value={user.role}
                isReadOnly
                bg="gray.50"
              />
            </FormControl>
            
            <Button
              mt={4}
              colorScheme="blue"
              isLoading={isLoading}
              type="submit"
              width={{ base: '100%', md: 'auto' }}
              alignSelf="flex-end"
            >
              Save Changes
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
};

export default ProfileForm; 