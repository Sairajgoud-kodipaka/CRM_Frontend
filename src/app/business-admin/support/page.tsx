'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { supportAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { FlexGrid } from '@/components/ui/FlexGrid';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Button,
  Stack,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Chip,
  Paper,
  IconButton,
  Tooltip,
  Badge,
  useTheme,
  alpha,
  Zoom,
  Fade
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Support as SupportIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Assessment as AssessmentIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  PriorityHigh as PriorityHighIcon,
  Message as MessageIcon,
  Phone as PhoneIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

// Type definitions
interface SupportTicket {
  id: number;
  ticket_id: string;
  title: string;
  summary?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'reopened';
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  is_urgent: boolean;
  created_at: string;
  created_by_name: string;
  tenant_name: string;
  assigned_to_name?: string;
  message_count: number;
}

interface SupportStats {
  total_tickets: number;
  open_tickets: number;
  resolved_today: number;
  avg_response_hours: number;
}

interface FormData {
  title: string;
  summary: string;
  category: string;
  priority: string;
  is_urgent: boolean;
  requires_callback: boolean;
  callback_phone: string;
  callback_preferred_time: string;
}

type PriorityType = 'critical' | 'high' | 'medium' | 'low';
type StatusType = 'open' | 'in_progress' | 'resolved' | 'closed' | 'reopened';

const StyledCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(2),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[8],
    borderColor: alpha(theme.palette.primary.main, 0.2),
  }
}));

const MetricCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
  backdropFilter: 'blur(15px)',
  borderRadius: theme.spacing(2),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[12],
    borderColor: alpha(theme.palette.primary.main, 0.3),
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  }
}));

export default function BusinessAdminSupport() {
  const theme = useTheme();
  const { user, loading } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [stats, setStats] = useState<SupportStats>({
    total_tickets: 0,
    open_tickets: 0,
    resolved_today: 0,
    avg_response_hours: 0
  });

  // Form state
  const [formData, setFormData] = useState<FormData>({
    title: '',
    summary: '',
    category: 'general',
    priority: 'medium',
    is_urgent: false,
    requires_callback: false,
    callback_phone: '',
    callback_preferred_time: ''
  });

  useEffect(() => {
    if (user) {
      fetchTickets();
      fetchStats();
    }
  }, [user]);

  const fetchTickets = async () => {
    setDataLoading(true);
    try {
      const data = await supportAPI.getTickets();
      setTickets(Array.isArray(data) ? data : (data?.results || []));
    } catch (err) {
      console.error('Error fetching tickets:', err);
      toast.error('Failed to fetch support tickets');
    } finally {
      setDataLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await supportAPI.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      await supportAPI.createTicket(formData);
      toast.success('Support ticket created successfully!');
      setShowCreateForm(false);
      setFormData({
        title: '',
        summary: '',
        category: 'general',
        priority: 'medium',
        is_urgent: false,
        requires_callback: false,
        callback_phone: '',
        callback_preferred_time: ''
      });
      fetchTickets();
      fetchStats();
    } catch (err) {
      console.error('Error creating ticket:', err);
      toast.error('Failed to create support ticket');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (name: string) => (event: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: event.target.value
    }));
  };

  const getPriorityColor = (priority: PriorityType): 'error' | 'warning' | 'info' | 'success' => {
    const colors: Record<PriorityType, 'error' | 'warning' | 'info' | 'success'> = {
      critical: 'error',
      high: 'warning',
      medium: 'info',
      low: 'success'
    };
    return colors[priority] || 'info';
  };

  const getStatusColor = (status: StatusType): 'primary' | 'warning' | 'success' | 'default' | 'error' => {
    const colors: Record<StatusType, 'primary' | 'warning' | 'success' | 'default' | 'error'> = {
      open: 'primary',
      in_progress: 'warning',
      resolved: 'success',
      closed: 'default',
      reopened: 'error'
    };
    return colors[status] || 'primary';
  };

  const MetricCardComponent = ({ 
    title, 
    value, 
    icon, 
    color = 'primary',
    delay = 0 
  }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
    delay?: number;
  }) => (
    <Zoom in={true} style={{ transitionDelay: `${delay}ms` }}>
      <MetricCard>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: alpha(theme.palette[color].main, 0.1),
                color: `${color}.main`,
              }}
            >
              {icon}
            </Box>
            <Typography variant="body2" color={`${color}.main`} sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
          </Stack>
          <Typography variant="h3" component="div" sx={{ fontWeight: 800, color: `${color}.dark` }}>
            {value}
          </Typography>
        </CardContent>
      </MetricCard>
    </Zoom>
  );

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh',
          bgcolor: 'background.default'
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={64} />
          <Typography variant="h6" color="text.secondary">
            Loading support center...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (!user || !['business_admin', 'manager'].includes(user.role)) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          Access denied. Only business admins and managers can view this page.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${theme.palette.background.default} 50%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        py: { xs: 3, md: 4 },
        px: { xs: 2, md: 4 }
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <SupportIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Box>
              <Typography 
                variant="h3" 
                component="h1" 
                sx={{ 
                  fontWeight: 800, 
                  color: 'primary.dark',
                  textShadow: `0 2px 4px ${alpha(theme.palette.primary.main, 0.1)}`
                }}
              >
                Support Center
              </Typography>
              <Typography variant="h6" color="primary.main" sx={{ opacity: 0.8 }}>
                Create and manage support tickets for technical assistance
              </Typography>
            </Box>
          </Stack>
        </Box>

      {/* Stats Grid */}
        <FlexGrid container spacing={3} sx={{ mb: 4 }}>
          <FlexGrid xs={12} sm={6} lg={3}>
            <MetricCardComponent
              title="Total Tickets"
              value={stats.total_tickets}
              icon={<AssessmentIcon />}
              color="primary"
              delay={100}
            />
          </FlexGrid>
          <FlexGrid xs={12} sm={6} lg={3}>
            <MetricCardComponent
              title="Open Tickets"
              value={stats.open_tickets}
              icon={<SupportIcon />}
              color="info"
              delay={200}
            />
          </FlexGrid>
          <FlexGrid xs={12} sm={6} lg={3}>
            <MetricCardComponent
              title="Resolved Today"
              value={stats.resolved_today}
              icon={<CheckCircleIcon />}
              color="success"
              delay={300}
            />
          </FlexGrid>
          <FlexGrid xs={12} sm={6} lg={3}>
            <MetricCardComponent
              title="Avg Response Time"
              value={`${stats.avg_response_hours}h`}
              icon={<ScheduleIcon />}
              color="warning"
              delay={400}
            />
          </FlexGrid>
        </FlexGrid>

        {/* Create Ticket Section */}
        <StyledCard sx={{ mb: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.dark', mb: 1 }}>
                  Support Tickets
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Create new tickets or view existing ones
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
            onClick={() => setShowCreateForm(true)}
                sx={{
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  boxShadow: theme.shadows[4],
                  '&:hover': {
                    boxShadow: theme.shadows[8],
                    transform: 'translateY(-1px)',
                  }
                }}
          >
            Create New Ticket
              </Button>
            </Stack>
          </CardContent>
        </StyledCard>

        {/* Create Ticket Dialog */}
        <Dialog
          open={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: theme.shadows[24]
            }
          }}
        >
          <DialogTitle sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.dark' }}>
                Create Support Ticket
              </Typography>
              <IconButton onClick={() => setShowCreateForm(false)}>
                <CloseIcon />
              </IconButton>
            </Stack>
          </DialogTitle>
          
          <form onSubmit={handleCreateTicket}>
            <DialogContent sx={{ p: 3 }}>
              <Stack spacing={3}>
                <FlexGrid container spacing={3}>
                  <FlexGrid xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Brief description of the issue"
                />
                  </FlexGrid>
                  
                  <FlexGrid xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Category</InputLabel>
                      <Select
                  name="category"
                  value={formData.category}
                        onChange={handleSelectChange('category')}
                        label="Category"
                      >
                        <MenuItem value="general">General Inquiry</MenuItem>
                        <MenuItem value="technical">Technical Issue</MenuItem>
                        <MenuItem value="billing">Billing & Subscription</MenuItem>
                        <MenuItem value="feature_request">Feature Request</MenuItem>
                        <MenuItem value="bug_report">Bug Report</MenuItem>
                        <MenuItem value="integration">Integration Issue</MenuItem>
                      </Select>
                    </FormControl>
                  </FlexGrid>
                </FlexGrid>

                <FlexGrid container spacing={3}>
                  <FlexGrid xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Priority</InputLabel>
                      <Select
                  name="priority"
                  value={formData.priority}
                        onChange={handleSelectChange('priority')}
                        label="Priority"
                      >
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                        <MenuItem value="critical">Critical</MenuItem>
                      </Select>
                    </FormControl>
                  </FlexGrid>
                  
                  <FlexGrid xs={12} md={6}>
                    <Stack spacing={2}>
                      <FormControlLabel
                        control={
                          <Checkbox
                    name="is_urgent"
                    checked={formData.is_urgent}
                    onChange={handleInputChange}
                          />
                        }
                        label="Mark as Urgent"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                    name="requires_callback"
                    checked={formData.requires_callback}
                    onChange={handleInputChange}
                          />
                        }
                        label="Request Callback"
                      />
                    </Stack>
                  </FlexGrid>
                </FlexGrid>

            {formData.requires_callback && (
                  <Fade in={formData.requires_callback}>
                    <FlexGrid container spacing={3}>
                      <FlexGrid xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Callback Phone"
                          name="callback_phone"
                    type="tel"
                    value={formData.callback_phone}
                    onChange={handleInputChange}
                    placeholder="Your phone number"
                          InputProps={{
                            startAdornment: <PhoneIcon sx={{ mr: 1, color: 'action.active' }} />
                          }}
                        />
                      </FlexGrid>
                      
                      <FlexGrid xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Preferred Time"
                    name="callback_preferred_time"
                    value={formData.callback_preferred_time}
                    onChange={handleInputChange}
                    placeholder="e.g., Weekdays 2-4 PM"
                  />
                      </FlexGrid>
                    </FlexGrid>
                  </Fade>
                )}

                <TextField
                  fullWidth
                  label="Detailed Description"
                name="summary"
                value={formData.summary}
                onChange={handleInputChange}
                required
                  multiline
                rows={6}
                placeholder="Please provide detailed information about your issue, including steps to reproduce, error messages, and any relevant context..."
              />
              </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 3, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
              <Button
                onClick={() => setShowCreateForm(false)}
                variant="outlined"
                sx={{ px: 3 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                sx={{ px: 3, fontWeight: 600 }}
              >
                Create Ticket
              </Button>
            </DialogActions>
          </form>
        </Dialog>

      {/* Tickets List */}
        <StyledCard>
          <CardHeader
            title={
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.dark' }}>
                Your Support Tickets
              </Typography>
            }
            sx={{ pb: 1 }}
          />
          <CardContent>
          {dataLoading ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <CircularProgress size={48} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Loading tickets...
                </Typography>
              </Box>
          ) : tickets.length > 0 ? (
              <Stack spacing={2}>
                {tickets.map((ticket, index) => (
                  <Zoom in={true} key={ticket.id} style={{ transitionDelay: `${index * 100}ms` }}>
                    <Paper 
                      sx={{ 
                        p: 3, 
                        borderRadius: 2,
                        border: 1,
                        borderColor: alpha(theme.palette.primary.main, 0.1),
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.02),
                          borderColor: alpha(theme.palette.primary.main, 0.2),
                        }
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box sx={{ flex: 1 }}>
                          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                            <Typography 
                              variant="h6" 
                              component={Link}
                              href={`/business-admin/support/${ticket.id}`}
                              sx={{ 
                                textDecoration: 'none',
                                color: 'primary.dark',
                                fontWeight: 600,
                                '&:hover': {
                                  color: 'primary.main',
                                  textDecoration: 'underline'
                                }
                              }}
                            >
                            {ticket.ticket_id} - {ticket.title}
                            </Typography>
                        {ticket.is_urgent && (
                              <Chip 
                                label="URGENT" 
                                color="error" 
                                size="small"
                                icon={<WarningIcon />}
                                variant="filled"
                              />
                            )}
                          </Stack>
                          
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {ticket.summary?.substring(0, 150)}...
                          </Typography>
                          
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="caption" color="text.secondary">
                              Created {new Date(ticket.created_at).toLocaleDateString()}
                            </Typography>
                            <Badge badgeContent={ticket.message_count} color="primary">
                              <MessageIcon fontSize="small" />
                            </Badge>
                        {ticket.assigned_to_name && (
                              <Typography variant="caption" color="text.secondary">
                                Assigned to {ticket.assigned_to_name}
                              </Typography>
                            )}
                          </Stack>
                        </Box>
                        
                        <Stack spacing={1} alignItems="flex-end">
                          <Chip 
                            label={ticket.priority} 
                            color={getPriorityColor(ticket.priority)}
                            size="small"
                            variant="outlined"
                          />
                          <Chip 
                            label={ticket.status.replace('_', ' ')} 
                            color={getStatusColor(ticket.status)}
                            size="small"
                            variant="filled"
                          />
                        </Stack>
                      </Stack>
                    </Paper>
                  </Zoom>
                ))}
              </Stack>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <SupportIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  No support tickets found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Create your first support ticket to get started
                </Typography>
              </Box>
            )}
          </CardContent>
        </StyledCard>
      </Container>
    </Box>
  );
} 