"use client"

import * as React from "react"
import { Tabs, TabsProps, Tab, TabProps, Box } from "@mui/material"

export interface TabsListProps extends Omit<TabsProps, 'orientation'> {
  orientation?: 'horizontal' | 'vertical'
}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, orientation = 'horizontal', ...props }, ref) => (
    <Tabs
      ref={ref}
      orientation={orientation}
      variant="scrollable"
      scrollButtons="auto"
      sx={{
        borderBottom: orientation === 'horizontal' ? 1 : 0,
        borderRight: orientation === 'vertical' ? 1 : 0,
        borderColor: 'divider',
        ...(className && { className })
      }}
      {...props}
    />
  )
)
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabProps>(
  ({ className, ...props }, ref) => (
    <Tab
      ref={ref}
      sx={{
        textTransform: 'none',
        minHeight: 48,
        ...(className && { className })
      }}
      {...props}
    />
  )
)
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <Box
    ref={ref}
    role="tabpanel"
    sx={{
      padding: 2,
      ...(className && { className })
    }}
    {...props}
  />
))
TabsContent.displayName = "TabsContent"

export { TabsList, TabsTrigger, TabsContent } 