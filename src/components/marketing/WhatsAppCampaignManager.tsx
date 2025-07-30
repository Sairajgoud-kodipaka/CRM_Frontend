'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Chip,
  TextField,
  MenuItem,
  Grid,
  CircularProgress,
  Stack,
  Divider,
  Container,
  Paper,
  IconButton,
  Fade,
  Zoom
} from '@mui/material';
import { 
  MessageSquare, 
  Send, 
  Users, 
  Eye, 
  Target, 
  Calendar,
  Plus,
  Settings,
  Download,
  BarChart3,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import api from '@/lib/api';

interface WhatsAppCampaign {
  id: string;
  name: string;
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'paused';
  template: string;
  content: string;
  targetAudience: number;
  sent: number;
  delivered: number;
  read: number;
  replied: number;
  conversions: number;
  revenue: number;
  scheduledAt?: string;
  createdAt: string;
  segments: string[];
}

interface WhatsAppTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
  status: 'approved' | 'pending' | 'rejected';
  variables: string[];
}

export default function WhatsAppCampaignManager() {
  const [campaigns, setCampaigns] = useState<WhatsAppCampaign[]>([]);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    template: '',
    content: '',
    scheduledAt: '',
    segments: [] as string[]
  });

  useEffect(() => {
    fetchWhatsAppData();
  }, []);

  const fetchWhatsAppData = async () => {
    try {
      const response = await api.get('/marketing/whatsapp-metrics/');
      setCampaigns(response.data.campaigns);
      setTemplates(response.data.templates);
    } catch (error) {
      console.error('Error fetching WhatsApp data:', error);
    }
  };

  const getStatusColor = (status: string): 'success' | 'info' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'info';
      case 'scheduled': return 'warning';
      case 'paused': return 'error';
      case 'draft': return 'default';
      default: return 'default';
    }
  };

  const getTemplateStatusColor = (status: string): 'success' | 'warning' | 'error' => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'warning';
    }
  };

  const handleCreateCampaign = async () => {
    try {
      const response = await api.post('/marketing/whatsapp/campaigns/', newCampaign);
      setCampaigns(prev => [...prev, response.data]);
      setShowCreateForm(false);
      setNewCampaign({ name: '', template: '', content: '', scheduledAt: '', segments: [] });
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          p: 8 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack spacing={3}>
      {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2
        }}>
          <Box>
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
              WhatsApp Campaign Manager
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create and manage WhatsApp campaigns
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" startIcon={<Settings size={20} />}>
            Settings
          </Button>
            <Button 
              variant="contained" 
              startIcon={<Plus size={20} />}
              onClick={() => setShowCreateForm(true)}
            >
            New Campaign
          </Button>
          </Stack>
        </Box>

      {/* Create Campaign Form */}
      {showCreateForm && (
          <Zoom in={showCreateForm}>
            <Card elevation={2}>
          <CardHeader>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                  Create New WhatsApp Campaign
                </Typography>
          </CardHeader>
              <CardContent>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Campaign Name"
                value={newCampaign.name}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter campaign name"
              />
                  
                  <TextField
                    fullWidth
                    select
                    label="Template"
                    value={newCampaign.template}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, template: e.target.value }))}
                  >
                  {templates.map((template) => (
                      <MenuItem key={template.id} value={template.id}>
                      {template.name}
                      </MenuItem>
                    ))}
                  </TextField>
                  
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Message Content"
                value={newCampaign.content}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter your message content"
                  />
                  
                  <TextField
                    fullWidth
                type="datetime-local"
                    label="Schedule (Optional)"
                value={newCampaign.scheduledAt}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, scheduledAt: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                  />
                  
                  <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
                    <Button variant="outlined" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
                    <Button 
                      variant="contained" 
                      startIcon={<Send size={20} />}
                      onClick={handleCreateCampaign} 
                      disabled={!newCampaign.name || !newCampaign.content}
                    >
                Create Campaign
              </Button>
                  </Stack>
                </Stack>
          </CardContent>
        </Card>
          </Zoom>
      )}

      {/* Campaigns List */}
        <Stack spacing={2}>
          {campaigns.map((campaign, index) => (
            <Fade in={true} timeout={300 + index * 100} key={campaign.id}>
              <Card elevation={1} sx={{ 
                transition: 'all 0.3s ease',
                '&:hover': {
                  elevation: 3,
                  transform: 'translateY(-2px)'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    {/* Campaign Icon & Info */}
                    <Grid item xs={12} md={8}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Typography variant="h4" sx={{ mt: 0.5 }}>💬</Typography>
                        <Box sx={{ flex: 1 }}>
                          <Stack direction="row" spacing={1} sx={{ mb: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                            <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                              {campaign.name}
                            </Typography>
                            <Chip 
                              label={campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                              color={getStatusColor(campaign.status)}
                              size="small"
                            />
                            <Chip 
                              label={campaign.template}
                              variant="outlined"
                              size="small"
                            />
                          </Stack>
                          
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {campaign.content}
                          </Typography>
                          
                          {/* Metrics Grid */}
                          <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid item xs={6} sm={4} md={2}>
                              <Box>
                                <Typography variant="caption" color="text.secondary">Target</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {campaign.targetAudience.toLocaleString()}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6} sm={4} md={2}>
                              <Box>
                                <Typography variant="caption" color="text.secondary">Sent</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {campaign.sent.toLocaleString()}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6} sm={4} md={2}>
                              <Box>
                                <Typography variant="caption" color="text.secondary">Delivered</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {campaign.delivered.toLocaleString()}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6} sm={4} md={2}>
                              <Box>
                                <Typography variant="caption" color="text.secondary">Read</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {campaign.read.toLocaleString()}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6} sm={4} md={2}>
                              <Box>
                                <Typography variant="caption" color="text.secondary">Replies</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {campaign.replied}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6} sm={4} md={2}>
                              <Box>
                                <Typography variant="caption" color="text.secondary">Revenue</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  ₹{(campaign.revenue / 1000).toFixed(0)}K
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>

                          {/* Segments */}
                          <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
                      {campaign.segments.map((segment) => (
                              <Chip 
                                key={segment} 
                                label={segment}
                                variant="outlined" 
                                size="small"
                              />
                            ))}
                          </Stack>

                          <Typography variant="caption" color="text.secondary">
                      Created: {new Date(campaign.createdAt).toLocaleDateString()}
                      {campaign.scheduledAt && (
                              <> • Scheduled: {new Date(campaign.scheduledAt).toLocaleDateString()}</>
                            )}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    {/* Action Buttons */}
                    <Grid item xs={12} md={4}>
                      <Stack 
                        direction={{ xs: 'row', md: 'column' }} 
                        spacing={1} 
                        sx={{ 
                          justifyContent: { xs: 'flex-end', md: 'flex-start' },
                          alignItems: { xs: 'center', md: 'flex-end' }
                        }}
                      >
                        <Button variant="outlined" size="small" startIcon={<Eye size={16} />}>
                    View
                  </Button>
                        <Button variant="outlined" size="small" startIcon={<BarChart3 size={16} />}>
                    Analytics
                  </Button>
                        <Button variant="outlined" size="small" startIcon={<Send size={16} />}>
                    Send
                  </Button>
                      </Stack>
                    </Grid>
                  </Grid>
            </CardContent>
          </Card>
            </Fade>
        ))}
        </Stack>

      {/* Templates Section */}
        <Card elevation={2}>
        <CardHeader>
            <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
              Message Templates
            </Typography>
        </CardHeader>
        <CardContent>
            <Grid container spacing={3}>
            {templates.map((template) => (
                <Grid item xs={12} md={6} key={template.id}>
                  <Paper variant="outlined" sx={{ p: 3 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      mb: 2 
                    }}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {template.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {template.category}
                        </Typography>
                      </Box>
                      <Chip 
                        label={template.status.charAt(0).toUpperCase() + template.status.slice(1)}
                        color={getTemplateStatusColor(template.status)}
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {template.content}
                    </Typography>
                    
                    <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
                  {template.variables.map((variable) => (
                        <Chip 
                          key={variable} 
                          label={variable}
                          color="secondary" 
                          size="small"
                        />
                      ))}
                    </Stack>
                    
                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                      <Button variant="outlined" size="small">
                    Use Template
                  </Button>
                      <Button variant="outlined" size="small">
                    Edit
                  </Button>
                    </Stack>
                  </Paper>
                </Grid>
            ))}
            </Grid>
        </CardContent>
      </Card>
      </Stack>
    </Container>
  );
} 