import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  VStack,
  Image,
  Flex,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { Company } from '../../services/companyService';

interface CompanyFormProps {
  company: Company | null;
  onSubmit: (data: Partial<Company>) => Promise<void>;
  isLoading: boolean;
}

const CompanyForm = ({ company, onSubmit, isLoading }: CompanyFormProps) => {
  const [logoPreview, setLogoPreview] = useState<string | undefined>(company?.logo);
  const formBackground = useColorModeValue('white', 'gray.700');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Partial<Company>>({
    defaultValues: {
      name: company?.name || '',
      domain: company?.domain || '',
      logo: company?.logo || '',
    },
  });

  const handleFormSubmit = async (data: Partial<Company>) => {
    // Only send modified fields
    const changedData: Partial<Company> = {};
    if (data.name !== company?.name) changedData.name = data.name;
    if (data.domain !== company?.domain) changedData.domain = data.domain;
    if (data.logo !== company?.logo) changedData.logo = data.logo;
    
    await onSubmit(changedData);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setLogoPreview(url);
  };

  return (
    <Box 
      bg={formBackground} 
      borderRadius="lg" 
      p={6} 
      boxShadow="md"
      width="100%"
      maxWidth="800px"
      mx="auto"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <VStack spacing={4} align="flex-start">
          <Flex width="100%" gap={6} direction={{ base: 'column', md: 'row' }}>
            <Box width={{ base: '100%', md: '60%' }}>
              <FormControl isInvalid={!!errors.name} isRequired mb={4}>
                <FormLabel htmlFor="name">Company Name</FormLabel>
                <Input
                  id="name"
                  {...register('name', {
                    required: 'Company name is required',
                  })}
                />
                <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.domain} mb={4}>
                <FormLabel htmlFor="domain">Domain</FormLabel>
                <Input
                  id="domain"
                  placeholder="company.com"
                  {...register('domain')}
                />
                <FormErrorMessage>{errors.domain?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.logo} mb={4}>
                <FormLabel htmlFor="logo">Logo URL</FormLabel>
                <Input
                  id="logo"
                  placeholder="https://example.com/logo.png"
                  {...register('logo')}
                  onChange={handleLogoChange}
                />
                <FormErrorMessage>{errors.logo?.message}</FormErrorMessage>
              </FormControl>
            </Box>

            <Box width={{ base: '100%', md: '40%' }}>
              <Text fontWeight="medium" mb={2}>Logo Preview</Text>
              <Box
                border="1px"
                borderColor="gray.200"
                borderRadius="md"
                p={4}
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="200px"
                bg="gray.50"
              >
                {logoPreview ? (
                  <Image 
                    src={logoPreview} 
                    alt="Company Logo" 
                    maxH="180px" 
                    maxW="100%" 
                    fallback={<Text>Invalid image URL</Text>}
                  />
                ) : (
                  <Text color="gray.500">No logo uploaded</Text>
                )}
              </Box>
            </Box>
          </Flex>

          <Button
            mt={4}
            colorScheme="blue"
            isLoading={isLoading}
            type="submit"
            alignSelf="flex-end"
          >
            Save Changes
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default CompanyForm; 