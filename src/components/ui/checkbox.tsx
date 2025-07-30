"use client"

import * as React from "react"
import { Checkbox, CheckboxProps } from "@mui/material"
import { FormControlLabel } from "@mui/material"

export interface CheckboxProps extends Omit<CheckboxProps, 'color'> {
  label?: string
}

const CheckboxComponent = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => {
    const checkbox = (
      <Checkbox
        ref={ref}
        color="primary"
        sx={{
          ...(className && { className })
        }}
        {...props}
      />
    )

    if (label) {
      return (
        <FormControlLabel
          control={checkbox}
          label={label}
          sx={{
            margin: 0,
            '& .MuiFormControlLabel-label': {
              fontSize: '0.875rem',
            }
          }}
        />
      )
    }

    return checkbox
  }
)
CheckboxComponent.displayName = "Checkbox"

export { CheckboxComponent as Checkbox } 