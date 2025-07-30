import * as React from "react"
import { FormControl, FormHelperText, FormLabel } from "@mui/material"
import { Label } from "./label"

export interface FormFieldProps {
  label?: string
  error?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, error, required, children, className }, ref) => {
    return (
      <FormControl
        ref={ref}
        error={!!error}
        required={required}
        fullWidth
        sx={{
          marginBottom: 2,
          ...(className && { className })
        }}
      >
        {label && (
          <FormLabel
            sx={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'text.primary',
              marginBottom: 1,
            }}
          >
            {label}
            {required && <span style={{ color: 'error.main' }}> *</span>}
          </FormLabel>
        )}
        {children}
        {error && (
          <FormHelperText
            sx={{
              margin: 0,
              marginTop: 0.5,
              fontSize: '0.75rem',
            }}
          >
            {error}
          </FormHelperText>
        )}
      </FormControl>
    )
  }
)
FormField.displayName = "FormField"

export { FormField } 