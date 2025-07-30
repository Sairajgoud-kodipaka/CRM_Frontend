"use client"

import * as React from "react"
import { Divider, DividerProps } from "@mui/material"

export interface SeparatorProps extends Omit<DividerProps, 'orientation'> {
  orientation?: 'horizontal' | 'vertical'
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation = 'horizontal', ...props }, ref) => (
    <Divider
      ref={ref}
      orientation={orientation}
      sx={{
        margin: orientation === 'horizontal' ? '16px 0' : '0 16px',
        ...(className && { className })
      }}
      {...props}
    />
  )
)
Separator.displayName = "Separator"

export { Separator } 