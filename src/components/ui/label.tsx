import * as React from "react"
import { FormLabel, FormLabelProps } from "@mui/material"

export interface LabelProps extends FormLabelProps {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <FormLabel
      ref={ref}
      sx={{
        fontSize: '0.875rem',
        fontWeight: 500,
        color: 'text.primary',
        marginBottom: 1,
        ...(className && { className })
      }}
      {...props}
    />
  )
)
Label.displayName = "Label"

export { Label } 