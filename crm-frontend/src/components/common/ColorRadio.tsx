import React from 'react';
import { Box, useRadio, UseRadioProps } from '@chakra-ui/react';

interface ColorRadioProps extends UseRadioProps {
  children: React.ReactNode;
}

const ColorRadio = (props: ColorRadioProps) => {
  const { getInputProps, getRadioProps } = useRadio(props);
  
  const input = getInputProps();
  const checkbox = getRadioProps();

  return (
    <Box as="label">
      <input {...input} />
      <Box
        {...checkbox}
        cursor="pointer"
        borderWidth="2px"
        borderRadius="full"
        p="1px"
        borderColor="transparent"
        _checked={{
          borderColor: 'blue.500',
        }}
        _focus={{
          boxShadow: 'outline',
        }}
      >
        {props.children}
      </Box>
    </Box>
  );
};

export default ColorRadio; 