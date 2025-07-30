import React from 'react';
import { Box, BoxProps } from '@mui/material';

interface FlexGridProps extends Omit<BoxProps, 'children'> {
  container?: boolean;
  spacing?: number;
  children: React.ReactNode;
  xs?: number | 'auto';
  sm?: number | 'auto';
  md?: number | 'auto';
  lg?: number | 'auto';
  xl?: number | 'auto';
}

export const FlexGrid: React.FC<FlexGridProps> = ({
  container = false,
  spacing = 0,
  xs,
  sm,
  md,
  lg,
  xl,
  children,
  sx,
  ...props
}) => {
  if (container) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: spacing * 0.5, // MUI spacing unit is 8px, so spacing={3} = 24px gap
          ...sx,
        }}
        {...props}
      >
        {children}
      </Box>
    );
  }

  // Calculate flex basis for grid items
  const getFlexBasis = (breakpoint: number | 'auto' | undefined) => {
    if (!breakpoint) return undefined;
    if (breakpoint === 'auto') return 'auto';
    if (breakpoint === 12) return '100%';
    return `${(breakpoint / 12) * 100}%`;
  };

  return (
    <Box
      sx={{
        flex: {
          xs: xs ? `0 0 ${getFlexBasis(xs)}` : '1 1 auto',
          sm: sm ? `0 0 ${getFlexBasis(sm)}` : undefined,
          md: md ? `0 0 ${getFlexBasis(md)}` : undefined,
          lg: lg ? `0 0 ${getFlexBasis(lg)}` : undefined,
          xl: xl ? `0 0 ${getFlexBasis(xl)}` : undefined,
        },
        minWidth: 0, // Prevent flex items from overflowing
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export default FlexGrid;