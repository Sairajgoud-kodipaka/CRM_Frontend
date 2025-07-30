import * as React from "react"
import { Card as MuiCard, CardProps as MuiCardProps } from "@mui/material"
import { CardContent as MuiCardContent, CardContentProps as MuiCardContentProps } from "@mui/material"
import { CardHeader as MuiCardHeader, CardHeaderProps as MuiCardHeaderProps } from "@mui/material"
import { Typography, Box } from "@mui/material"
import { styled } from "@mui/material/styles"

const Card = React.forwardRef<
  HTMLDivElement,
  MuiCardProps
>(({ className, ...props }, ref) => (
  <MuiCard
    ref={ref}
    sx={{
      borderRadius: 2,
      boxShadow: 1,
      ...(className && { className })
    }}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  MuiCardHeaderProps
>(({ className, ...props }, ref) => (
  <MuiCardHeader
    ref={ref}
    sx={{
      padding: 3,
      ...(className && { className })
    }}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <Typography
    ref={ref}
    variant="h5"
    component="h3"
    sx={{
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
      ...(className && { className })
    }}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <Typography
    ref={ref}
    variant="body2"
    color="text.secondary"
    sx={{
      ...(className && { className })
    }}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  MuiCardContentProps
>(({ className, ...props }, ref) => (
  <MuiCardContent
    ref={ref}
    sx={{
      padding: 3,
      paddingTop: 0,
      ...(className && { className })
    }}
    {...props}
  />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <Box
    ref={ref}
    sx={{
      display: 'flex',
      alignItems: 'center',
      padding: 3,
      paddingTop: 0,
      ...(className && { className })
    }}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } 