import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Button,
  Grid,
  Divider,
  Paper,
  Stack
} from '@mui/material';

export default function WhatsAppIntegration() {
  const StatCard = ({ title, value, subtitle }: { title: string; value: string; subtitle: string }) => (
    <Card elevation={1}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="h3" component="div" sx={{ fontWeight: 700, mb: 1 }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );

  const ActionButton = ({ title, description, onClick }: { title: string; description: string; onClick?: () => void }) => (
    <Paper 
      variant="outlined" 
      sx={{ 
        p: 2,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          bgcolor: 'grey.50',
          borderColor: 'primary.main'
        }
      }}
      onClick={onClick}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Paper>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
            WhatsApp Integration
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your WhatsApp Business integration and messaging
          </Typography>
        </Box>

        {/* WhatsApp Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Messages Sent"
              value="0"
              subtitle="No messages sent"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Messages Received"
              value="0"
              subtitle="No messages received"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Response Rate"
              value="0%"
              subtitle="No response data"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Active Chats"
              value="0"
              subtitle="No active chats"
            />
          </Grid>
        </Grid>

        {/* Connection Status */}
        <Card elevation={1}>
          <CardHeader title="Connection Status" />
          <Divider />
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                WhatsApp not connected
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Connect your WhatsApp Business account to get started
              </Typography>
              <Button 
                variant="contained" 
                color="success"
                sx={{ mt: 2 }}
              >
                Connect WhatsApp
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card elevation={1}>
          <CardHeader title="Recent Messages" />
          <Divider />
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                No recent messages
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Messages will appear here once WhatsApp is connected
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card elevation={1}>
          <CardHeader title="Quick Actions" />
          <Divider />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <ActionButton
                  title="Send Broadcast"
                  description="Send message to multiple contacts"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <ActionButton
                  title="View Templates"
                  description="Manage message templates"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <ActionButton
                  title="Settings"
                  description="Configure WhatsApp settings"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
} 