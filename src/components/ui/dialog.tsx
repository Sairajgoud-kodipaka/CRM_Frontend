import * as React from "react"
import { Dialog as MuiDialog, DialogProps } from "@mui/material"
import { DialogTitle as MuiDialogTitle, DialogTitleProps } from "@mui/material"
import { DialogContent as MuiDialogContent, DialogContentProps } from "@mui/material"
import { DialogActions, DialogActionsProps } from "@mui/material"
import { IconButton } from "@mui/material"
import { Close as CloseIcon } from "@mui/icons-material"

const DialogRoot = React.forwardRef<
  HTMLDivElement,
  DialogProps
>(({ className, ...props }, ref) => (
  <MuiDialog
    ref={ref}
    maxWidth="sm"
    fullWidth
    sx={{
      ...(className && { className })
    }}
    {...props}
  />
))
DialogRoot.displayName = "Dialog"

const DialogTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    style={{
      ...(className && { className })
    }}
    {...props}
  />
))
DialogTrigger.displayName = "DialogTrigger"

const DialogPortal = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    style={{
      ...(className && { className })
    }}
    {...props}
  />
))
DialogPortal.displayName = "DialogPortal"

const DialogOverlay = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    style={{
      ...(className && { className })
    }}
    {...props}
  />
))
DialogOverlay.displayName = "DialogOverlay"

const DialogContent = React.forwardRef<
  HTMLDivElement,
  DialogContentProps
>(({ className, ...props }, ref) => (
  <MuiDialogContent
    ref={ref}
    sx={{
      padding: 3,
      ...(className && { className })
    }}
    {...props}
  />
))
DialogContent.displayName = "DialogContent"

const DialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      padding: '24px',
      ...(className && { className })
    }}
    {...props}
  />
))
DialogHeader.displayName = "DialogHeader"

const DialogFooter = React.forwardRef<
  HTMLDivElement,
  DialogActionsProps
>(({ className, ...props }, ref) => (
  <DialogActions
    ref={ref}
    sx={{
      padding: 3,
      paddingTop: 0,
      ...(className && { className })
    }}
    {...props}
  />
))
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  DialogTitleProps
>(({ className, ...props }, ref) => (
  <MuiDialogTitle
    ref={ref}
    sx={{
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
      ...(className && { className })
    }}
    {...props}
  />
))
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    style={{
      fontSize: '0.875rem',
      color: 'rgba(0, 0, 0, 0.6)',
      ...(className && { className })
    }}
    {...props}
  />
))
DialogDescription.displayName = "DialogDescription"

const DialogClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <IconButton
    ref={ref}
    aria-label="close"
    sx={{
      position: 'absolute',
      right: 8,
      top: 8,
      color: 'grey.500',
      ...(className && { className })
    }}
    {...props}
  >
    <CloseIcon />
  </IconButton>
))
DialogClose.displayName = "DialogClose"

export {
  DialogRoot as Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} 