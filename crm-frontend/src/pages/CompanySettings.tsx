import { useEffect, useState } from 'react';
import { Box, Heading, useToast } from '@chakra-ui/react';
import CompanyForm from '../components/company/CompanyForm';
import { getCompany, updateCompany } from '../services/companyService';
import { useAuth } from '../hooks/useAuth';

interface Company {
  id: string;
  name: string;
  domain?: string;
  logo?: string;
}

const CompanySettings = () => {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setLoading(true);
        if (user?.companyId) {
          const companyData = await getCompany(user.companyId);
          setCompany(companyData);
        }
      } catch (error) {
        toast({
          title: 'Error fetching company data',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [toast, user]);

  const handleSubmit = async (data: Partial<Company>) => {
    try {
      if (company?.id) {
        const updatedCompany = await updateCompany(company.id, data);
        setCompany(updatedCompany);
        toast({
          title: 'Company updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Error updating company',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={4}>
      <Heading mb={6}>Company Settings</Heading>
      {!loading && (
        <CompanyForm 
          company={company} 
          onSubmit={handleSubmit} 
          isLoading={loading}
        />
      )}
    </Box>
  );
};

export default CompanySettings; 