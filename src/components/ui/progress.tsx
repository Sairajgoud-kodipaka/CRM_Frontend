import * as React from "react"
import { LinearProgress, LinearProgressProps } from "@mui/material"
import { Box, Typography } from "@mui/material"

export interface ProgressProps extends LinearProgressProps {
  value?: number
  max?: number
  showValue?: boolean
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, showValue = false, variant = 'determinate', ...props }, ref) => {
    const progressValue = (value / max) * 100

    return (
      <Box
        ref={ref}
        sx={{
          width: '100%',
          ...(className && { className })
        }}
      >
        <LinearProgress
          variant={variant}
          value={progressValue}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: 'grey.200',
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
            }
          }}
          {...props}
        />
        {showValue && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ marginTop: 1, textAlign: 'center' }}
          >
            {Math.round(progressValue)}%
          </Typography>
        )}
      </Box>
    )
  }
)
Progress.displayName = "Progress"

export { Progress } 