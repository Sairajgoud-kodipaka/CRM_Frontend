import * as React from "react"
import { TextField, TextFieldProps } from "@mui/material"

export interface InputProps extends Omit<TextFieldProps, 'variant'> {
  variant?: 'outlined' | 'filled' | 'standard'
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = 'outlined', ...props }, ref) => {
    return (
      <TextField
        type={type}
        variant={variant}
        fullWidth
        size="small"
        sx={{
          '& .MuiOutlinedInput-root': {
            height: '40px',
            fontSize: '0.875rem',
          },
          ...(className && { className })
        }}
        inputRef={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input } 