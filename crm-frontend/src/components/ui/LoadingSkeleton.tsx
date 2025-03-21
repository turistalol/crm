import React from 'react';
import { Skeleton, SkeletonText, Box, Stack, SkeletonProps } from '@chakra-ui/react';

interface LoadingSkeletonProps extends SkeletonProps {
  count?: number;
  type?: 'box' | 'text' | 'circle';
  height?: string | number;
  width?: string | number;
  isLoaded?: boolean;
  children?: React.ReactNode;
  noOfLines?: number;
  spacing?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  count = 1,
  type = 'box',
  height = '20px',
  width = '100%',
  isLoaded = false,
  children,
  noOfLines = 3,
  spacing = 4,
  ...rest
}) => {
  if (isLoaded) {
    return <>{children}</>;
  }

  const items = Array(count).fill(0);

  if (type === 'text') {
    return (
      <Stack spacing={spacing}>
        {items.map((_, index) => (
          <SkeletonText key={index} noOfLines={noOfLines} spacing={2} {...rest} />
        ))}
      </Stack>
    );
  }

  if (type === 'circle') {
    return (
      <Stack spacing={spacing}>
        {items.map((_, index) => (
          <Skeleton
            key={index}
            height={height}
            width={width}
            borderRadius="full"
            {...rest}
          />
        ))}
      </Stack>
    );
  }

  return (
    <Stack spacing={spacing}>
      {items.map((_, index) => (
        <Skeleton key={index} height={height} width={width} {...rest} />
      ))}
    </Stack>
  );
};

export default LoadingSkeleton; 