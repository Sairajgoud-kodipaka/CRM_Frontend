import * as React from "react"
import { Select as MuiSelect, SelectProps, MenuItem, FormControl, InputLabel, Box, InputBase } from "@mui/material"
import { styled } from "@mui/material/styles"

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

export interface SelectComponentProps extends Omit<SelectProps, 'variant'> {
  options?: SelectOption[]
  placeholder?: string
  label?: string
  variant?: 'outlined' | 'filled' | 'standard'
}

const SelectComponent = React.forwardRef<HTMLDivElement, SelectComponentProps>(
  ({ className, options = [], placeholder, label, variant = 'outlined', ...props }, ref) => {
    return (
      <FormControl
        fullWidth
        variant={variant}
        size="small"
        sx={{
          ...(className && { className })
        }}
      >
        {label && <InputLabel>{label}</InputLabel>}
        <MuiSelect
          ref={ref}
          label={label}
          displayEmpty
          {...props}
        >
          {placeholder && (
            <MenuItem value="" disabled>
              {placeholder}
            </MenuItem>
          )}
          {options.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </MenuItem>
          ))}
        </MuiSelect>
      </FormControl>
    )
  }
)
SelectComponent.displayName = "Select"

// Add the missing components that are expected by the pipeline page
const SelectTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { className?: string }
>(({ className, children, ...props }, ref) => (
  <Box
    ref={ref}
    sx={{
      minHeight: 40,
      border: '1px solid',
      borderColor: 'grey.300',
      borderRadius: 1,
      padding: '8px 12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer',
      '&:hover': {
        borderColor: 'grey.400',
      },
      ...(className && { className })
    }}
    {...props}
  >
    {children}
  </Box>
))
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & { placeholder?: string }
>(({ className, placeholder, children, ...props }, ref) => (
  <span
    ref={ref}
    style={{
      color: children ? 'inherit' : 'rgba(0, 0, 0, 0.6)',
      ...(className && { className })
    }}
    {...props}
  >
    {children || placeholder}
  </span>
))
SelectValue.displayName = "SelectValue"

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <Box
    ref={ref}
    sx={{
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      backgroundColor: 'background.paper',
      border: '1px solid',
      borderColor: 'grey.300',
      borderRadius: 1,
      boxShadow: 2,
      zIndex: 1000,
      maxHeight: 200,
      overflow: 'auto',
      ...(className && { className })
    }}
    {...props}
  >
    {children}
  </Box>
))
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string | number }
>(({ className, children, value, ...props }, ref) => (
  <Box
    ref={ref}
    sx={{
      padding: '8px 12px',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: 'action.hover',
      },
      ...(className && { className })
    }}
    data-value={value}
    {...props}
  >
    {children}
  </Box>
))
SelectItem.displayName = "SelectItem"

export { 
  SelectComponent as Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} 