import * as React from "react"
import { Button as MuiButton, ButtonProps as MuiButtonProps } from "@mui/material"
import { styled } from "@mui/material/styles"

// Styled button variants
const StyledButton = styled(MuiButton)<{ variant?: string; size?: string }>(({ theme, variant, size }) => ({
  ...(variant === 'destructive' && {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.error.dark,
    },
  }),
  ...(variant === 'outline' && {
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  }),
  ...(variant === 'secondary' && {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.secondary.dark,
    },
  }),
  ...(variant === 'ghost' && {
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  }),
  ...(variant === 'link' && {
    backgroundColor: 'transparent',
    color: theme.palette.primary.main,
    textDecoration: 'underline',
    '&:hover': {
      backgroundColor: 'transparent',
      textDecoration: 'underline',
    },
  }),
  ...(size === 'sm' && {
    height: '36px',
    padding: '0 12px',
    fontSize: '0.875rem',
  }),
  ...(size === 'lg' && {
    height: '44px',
    padding: '0 32px',
    fontSize: '1rem',
  }),
  ...(size === 'icon' && {
    minWidth: '40px',
    width: '40px',
    height: '40px',
    padding: 0,
  }),
}))

export interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'size'> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    // Map our variants to MUI variants
    const muiVariant = variant === 'default' ? 'contained' : 
                      variant === 'outline' ? 'outlined' : 
                      variant === 'ghost' || variant === 'link' ? 'text' : 'contained'
    
    return (
      <StyledButton
        variant={muiVariant}
        size={size === 'default' ? 'medium' : size === 'sm' ? 'small' : 'large'}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button } 