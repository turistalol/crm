import React from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  Link,
  useToast,
  FormErrorMessage,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useForm } from '../../hooks/useForm';

interface RegisterFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Register = () => {
  const toast = useToast();
  const { register, isLoading, error, setError } = useAuth();

  const validationRules = {
    firstName: {
      required: true,
      minLength: 2
    },
    lastName: {
      required: true,
      minLength: 2
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      required: true,
      minLength: 6,
    },
    confirmPassword: {
      required: true,
      validate: (value: string, formValues: RegisterFormValues) => 
        value === formValues.password || 'Passwords do not match'
    }
  };

  const { values, errors, handleChange, handleSubmit } = useForm<RegisterFormValues>(
    { 
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationRules
  );

  const onSubmit = async (formValues: RegisterFormValues) => {
    try {
      await register(
        formValues.firstName,
        formValues.lastName,
        formValues.email,
        formValues.password
      );
      toast({
        title: 'Registration successful',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      // Error is handled by the auth context
    }
  };

  return (
    <Box p={8} maxWidth="md" mx="auto">
      <VStack spacing={8} align="stretch">
        <Heading textAlign="center">Create Account</Heading>
        
        <Box as="form" onSubmit={handleSubmit(onSubmit)}>
          <VStack spacing={4}>
            <FormControl id="firstName" isRequired isInvalid={!!errors.firstName}>
              <FormLabel>First Name</FormLabel>
              <Input
                type="text"
                name="firstName"
                value={values.firstName}
                onChange={handleChange}
                placeholder="John"
              />
              {errors.firstName && <FormErrorMessage>{errors.firstName}</FormErrorMessage>}
            </FormControl>

            <FormControl id="lastName" isRequired isInvalid={!!errors.lastName}>
              <FormLabel>Last Name</FormLabel>
              <Input
                type="text"
                name="lastName"
                value={values.lastName}
                onChange={handleChange}
                placeholder="Doe"
              />
              {errors.lastName && <FormErrorMessage>{errors.lastName}</FormErrorMessage>}
            </FormControl>

            <FormControl id="email" isRequired isInvalid={!!errors.email || !!error}>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                name="email"
                value={values.email}
                onChange={handleChange}
                placeholder="your@email.com"
                onFocus={() => setError(null)}
              />
              {errors.email && <FormErrorMessage>{errors.email}</FormErrorMessage>}
              {error && <FormErrorMessage>{error}</FormErrorMessage>}
            </FormControl>

            <FormControl id="password" isRequired isInvalid={!!errors.password}>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                name="password"
                value={values.password}
                onChange={handleChange}
                placeholder="********"
              />
              {errors.password && <FormErrorMessage>{errors.password}</FormErrorMessage>}
            </FormControl>

            <FormControl id="confirmPassword" isRequired isInvalid={!!errors.confirmPassword}>
              <FormLabel>Confirm Password</FormLabel>
              <Input
                type="password"
                name="confirmPassword"
                value={values.confirmPassword}
                onChange={handleChange}
                placeholder="********"
              />
              {errors.confirmPassword && <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>}
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              width="full"
              isLoading={isLoading}
              loadingText="Registering"
            >
              Register
            </Button>
          </VStack>
        </Box>

        <Text textAlign="center">
          Already have an account?{' '}
          <Link as={RouterLink} to="/login" color="blue.500">
            Login
          </Link>
        </Text>
      </VStack>
    </Box>
  );
};

export default Register; 