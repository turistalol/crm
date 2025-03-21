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
  InputGroup,
  InputRightElement,
  IconButton,
  FormErrorMessage,
  Spinner,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useForm } from '../../hooks/useForm';

interface LoginFormValues {
  email: string;
  password: string;
}

const Login = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const toast = useToast();
  const { login, isLoading, error, setError } = useAuth();

  const validationRules = {
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      required: true,
      minLength: 6,
    }
  };

  const { values, errors, handleChange, handleSubmit } = useForm<LoginFormValues>(
    { email: '', password: '' },
    validationRules
  );

  const onSubmit = async (formValues: LoginFormValues) => {
    try {
      await login(formValues.email, formValues.password);
      toast({
        title: 'Login successful',
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
        <Heading textAlign="center">Login to CRM</Heading>
        
        <Box as="form" onSubmit={handleSubmit(onSubmit)}>
          <VStack spacing={4}>
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
            </FormControl>

            <FormControl id="password" isRequired isInvalid={!!errors.password || !!error}>
              <FormLabel>Password</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={values.password}
                  onChange={handleChange}
                  placeholder="********"
                  onFocus={() => setError(null)}
                />
                <InputRightElement>
                  <Button
                    h="1.75rem"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </Button>
                </InputRightElement>
              </InputGroup>
              {errors.password && <FormErrorMessage>{errors.password}</FormErrorMessage>}
              {error && <FormErrorMessage>{error}</FormErrorMessage>}
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              width="full"
              isLoading={isLoading}
              loadingText="Logging in"
            >
              Login
            </Button>
          </VStack>
        </Box>

        <Text textAlign="center">
          Don't have an account?{' '}
          <Link as={RouterLink} to="/register" color="blue.500">
            Register
          </Link>
        </Text>
      </VStack>
    </Box>
  );
};

export default Login; 