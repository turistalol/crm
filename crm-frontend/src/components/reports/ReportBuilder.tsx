import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Stack,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormErrorMessage,
  Flex,
  Heading,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { Report, ReportType, CreateReportDto } from '../../types/api';
import reportService from '../../services/reportService';

interface ReportBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onReportCreated: (report: Report) => void;
  companyId: string;
  userId: string;
}

const ReportBuilder: React.FC<ReportBuilderProps> = ({
  isOpen,
  onClose,
  onReportCreated,
  companyId,
  userId,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<CreateReportDto>({
    defaultValues: {
      companyId,
      createdById: userId,
      type: ReportType.PIPELINE_PERFORMANCE,
      filters: {},
    },
  });

  const reportType = watch('type');

  const onSubmit = async (data: CreateReportDto) => {
    setIsSubmitting(true);
    try {
      const createdReport = await reportService.createReport(data);
      toast({
        title: 'Report created.',
        description: `${data.name} has been created successfully.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      onReportCreated(createdReport);
      reset();
      onClose();
    } catch (error) {
      console.error('Error creating report:', error);
      toast({
        title: 'Failed to create report.',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFilterFields = () => {
    switch (reportType) {
      case ReportType.PIPELINE_PERFORMANCE:
        return (
          <FormControl>
            <FormLabel>Pipeline</FormLabel>
            <Select {...register('filters.pipelineId')}>
              <option value="">All Pipelines</option>
              {/* Pipelines would be fetched and mapped here */}
            </Select>
          </FormControl>
        );
      case ReportType.TEAM_PERFORMANCE:
        return (
          <FormControl>
            <FormLabel>Team</FormLabel>
            <Select {...register('filters.teamId')}>
              <option value="">All Teams</option>
              {/* Teams would be fetched and mapped here */}
            </Select>
          </FormControl>
        );
      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create New Report</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <Stack spacing={4}>
              <FormControl isInvalid={!!errors.name} isRequired>
                <FormLabel>Report Name</FormLabel>
                <Input
                  {...register('name', {
                    required: 'Report name is required',
                    minLength: {
                      value: 3,
                      message: 'Report name must be at least 3 characters',
                    },
                  })}
                  placeholder="Monthly Pipeline Performance"
                />
                <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.type} isRequired>
                <FormLabel>Report Type</FormLabel>
                <Select
                  {...register('type', {
                    required: 'Report type is required',
                  })}
                >
                  <option value={ReportType.PIPELINE_PERFORMANCE}>Pipeline Performance</option>
                  <option value={ReportType.TEAM_PERFORMANCE}>Team Performance</option>
                  <option value={ReportType.CONVERSION_RATES}>Conversion Rates</option>
                  <option value={ReportType.LEAD_SOURCE}>Lead Source Analysis</option>
                  <option value={ReportType.SALES_FORECAST}>Sales Forecast</option>
                </Select>
                <FormErrorMessage>{errors.type?.message}</FormErrorMessage>
              </FormControl>

              <Box>
                <Heading size="sm" mb={2}>
                  Filters
                </Heading>
                <Stack spacing={3}>
                  <FormControl>
                    <FormLabel>Date Range</FormLabel>
                    <Flex gap={4}>
                      <FormControl>
                        <FormLabel fontSize="sm">Start Date</FormLabel>
                        <Input
                          type="date"
                          {...register('filters.startDate')}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm">End Date</FormLabel>
                        <Input
                          type="date"
                          {...register('filters.endDate')}
                        />
                      </FormControl>
                    </Flex>
                  </FormControl>

                  {renderFilterFields()}
                </Stack>
              </Box>
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              type="submit"
              isLoading={isSubmitting}
              loadingText="Creating"
            >
              Create Report
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default ReportBuilder; 