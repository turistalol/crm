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
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const PasswordChangeForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
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
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
        title: 'Password updated.',
        description: 'Your password has been updated successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Reset form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
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
        <Heading size="md">Change Password</Heading>
        <Text color="gray.600">Update your password for better security</Text>
        
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <VStack spacing={4} width="100%">
            <FormControl isInvalid={!!errors.currentPassword}>
              <FormLabel>Current Password</FormLabel>
              <InputGroup>
                <Input
                  name="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={handleChange}
                />
                <InputRightElement>
                  <IconButton
                    aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                    icon={showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  />
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>{errors.currentPassword}</FormErrorMessage>
            </FormControl>
            
            <FormControl isInvalid={!!errors.newPassword}>
              <FormLabel>New Password</FormLabel>
              <InputGroup>
                <Input
                  name="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={handleChange}
                />
                <InputRightElement>
                  <IconButton
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    icon={showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  />
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>{errors.newPassword}</FormErrorMessage>
            </FormControl>
            
            <FormControl isInvalid={!!errors.confirmPassword}>
              <FormLabel>Confirm New Password</FormLabel>
              <InputGroup>
                <Input
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <InputRightElement>
                  <IconButton
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    icon={showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
            </FormControl>
            
            <Button
              mt={4}
              colorScheme="blue"
              isLoading={isLoading}
              type="submit"
              width={{ base: '100%', md: 'auto' }}
              alignSelf="flex-end"
            >
              Update Password
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
};

export default PasswordChangeForm; 