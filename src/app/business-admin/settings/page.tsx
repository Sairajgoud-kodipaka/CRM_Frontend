'use client';

import { 
  Box, 
  Typography, 
  Paper, 
  Alert,
  AlertTitle,
  Container
} from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';

export default function SettingsHome() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 700 }}>
          Business Admin Settings
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 'md' }}>
          Welcome to the centralized settings panel for your jewelry business. Here you can manage stores, teams, tags, notifications, branding, legal policies, and more—all in one place. Use the sidebar to navigate between different settings sections.
        </Typography>
        
        <Paper sx={{ p: 3, bgcolor: 'info.50', border: 1, borderColor: 'info.200' }}>
          <Alert severity="info" icon={<InfoIcon />}>
            <AlertTitle>Tip</AlertTitle>
            Only business-admins can access and edit these settings. Changes here affect your entire business CRM experience.
          </Alert>
        </Paper>
      </Box>
    </Container>
  );
} 