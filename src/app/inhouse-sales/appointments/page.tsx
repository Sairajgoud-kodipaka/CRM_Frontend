'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { appointmentsAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Button,
  Grid,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Tooltip,
  Divider,
  Alert,
  useTheme,
  alpha,
  Fade,
  Zoom
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Add as AddIcon,
  CalendarMonth as CalendarIcon,
  List as ListIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Notifications as NotificationsIcon,
  Today as TodayIcon,
  Warning as WarningIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[3],
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[6],
    transform: 'translateY(-2px)',
  }
}));

const StyledTable = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
  '& .MuiTableHead-root': {
    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
  },
  '& .MuiTableCell-head': {
    fontWeight: 600,
    textTransform: 'uppercase',
    fontSize: '0.75rem',
    letterSpacing: '0.05em',
  },
  '& .MuiTableRow-root:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.02),
  }
}));

const StatusChip = styled(Chip)<{ status: string }>(({ theme, status }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'scheduled':
        return { color: theme.palette.info.main, bg: alpha(theme.palette.info.main, 0.1) };
      case 'confirmed':
        return { color: theme.palette.success.main, bg: alpha(theme.palette.success.main, 0.1) };
      case 'completed':
        return { color: theme.palette.grey[600], bg: alpha(theme.palette.grey[600], 0.1) };
      case 'cancelled':
        return { color: theme.palette.error.main, bg: alpha(theme.palette.error.main, 0.1) };
      case 'rescheduled':
        return { color: theme.palette.warning.main, bg: alpha(theme.palette.warning.main, 0.1) };
      case 'no_show':
        return { color: theme.palette.warning.dark, bg: alpha(theme.palette.warning.dark, 0.1) };
      default:
        return { color: theme.palette.grey[600], bg: alpha(theme.palette.grey[600], 0.1) };
    }
  };

  const config = getStatusConfig(status);
  
  return {
    backgroundColor: config.bg,
    color: config.color,
    fontWeight: 600,
    border: `1px solid ${alpha(config.color, 0.3)}`,
  };
});

const ActionButton = styled(Button)(({ theme }) => ({
  minWidth: 'auto',
  padding: theme.spacing(0.5, 1),
  fontSize: '0.75rem',
  borderRadius: theme.spacing(0.75),
  textTransform: 'none',
  fontWeight: 600,
}));

export default function AppointmentsPage() {
  const theme = useTheme();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter]);

  async function fetchAppointments() {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter) {
        params.status = statusFilter;
      }
      
      const response = await appointmentsAPI.getAppointments(params);
      const data = response.data;
      
      if (Array.isArray(data)) {
        setAppointments(data);
      } else if (data && Array.isArray(data.results)) {
        setAppointments(data.results);
      } else {
        setAppointments([]);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setAppointments([]);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }

  const handleStatusAction = async (appointmentId: number, action: string, data?: any) => {
    try {
      switch (action) {
        case 'confirm':
          await appointmentsAPI.confirmAppointment(appointmentId);
          toast.success('Appointment confirmed!');
          break;
        case 'complete':
          await appointmentsAPI.completeAppointment(appointmentId, data?.outcomeNotes);
          toast.success('Appointment completed!');
          break;
        case 'cancel':
          await appointmentsAPI.cancelAppointment(appointmentId, data?.reason);
          toast.success('Appointment cancelled!');
          break;
        case 'send_reminder':
          await appointmentsAPI.sendReminder(appointmentId);
          toast.success('Reminder sent!');
          break;
      }
      fetchAppointments(); // Refresh the list
    } catch (err: any) {
      console.error('Error performing action:', err);
      toast.error(err.response?.data?.detail || 'Action failed');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'info';
      case 'confirmed': return 'success';
      case 'completed': return 'default';
      case 'cancelled': return 'error';
      case 'rescheduled': return 'warning';
      case 'no_show': return 'warning';
      default: return 'default';
    }
  };

  const formatDateTime = (date: string, time?: string) => {
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    return { date: formattedDate, time: time || '' };
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <Stack spacing={2} alignItems="center">
            <CircularProgress size={64} />
            <Typography variant="h6" color="text.secondary">
              Loading appointments...
            </Typography>
          </Stack>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Fade in={true} timeout={800}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 800, color: 'primary.dark' }}>
            Appointments
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your customer appointments and meetings
          </Typography>
        </Box>
      </Fade>

      <StyledCard sx={{ minHeight: 400 }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          {appointments.length === 0 && !loading ? (
            <Fade in={true} timeout={1000}>
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <EventIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 3 }} />
                <Typography variant="h5" color="text.secondary" gutterBottom>
                  No appointments found
                </Typography>
                <Typography variant="body2" color="text.disabled" sx={{ mb: 4 }}>
                  Get started by scheduling your first appointment
                </Typography>
                <Link href="/inhouse-sales/appointments/new" passHref>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddIcon />}
                    sx={{ px: 4, py: 1.5 }}
                  >
                    Schedule New Appointment
                  </Button>
                </Link>
              </Box>
            </Fade>
          ) : (
            <Fade in={true} timeout={1000}>
              <Box>
                {/* Controls Header */}
                <Stack 
                  direction={{ xs: 'column', md: 'row' }} 
                  justifyContent="space-between" 
                  alignItems={{ xs: 'stretch', md: 'center' }}
                  spacing={3}
                  sx={{ mb: 4 }}
                >
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.dark' }}>
                      Appointments ({appointments.length})
                    </Typography>
                    
                    <ToggleButtonGroup
                      value={view}
                      exclusive
                      onChange={(e, newView) => newView && setView(newView)}
                      size="small"
                    >
                      <ToggleButton value="list">
                        <ListIcon sx={{ mr: 1 }} />
                    List View
                      </ToggleButton>
                      <ToggleButton value="calendar">
                        <CalendarIcon sx={{ mr: 1 }} />
                    Calendar View
                      </ToggleButton>
                    </ToggleButtonGroup>

                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>Status Filter</InputLabel>
                      <Select
                  value={statusFilter}
                        label="Status Filter"
                  onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <MenuItem value="">All Status</MenuItem>
                        <MenuItem value="scheduled">Scheduled</MenuItem>
                        <MenuItem value="confirmed">Confirmed</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                        <MenuItem value="rescheduled">Rescheduled</MenuItem>
                        <MenuItem value="no_show">No Show</MenuItem>
                      </Select>
                    </FormControl>
                  </Stack>

                  <Link href="/inhouse-sales/appointments/new" passHref>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      sx={{ minWidth: 200 }}
                    >
                      Schedule New Appointment
                    </Button>
              </Link>
                </Stack>
            
            {view === 'list' ? (
                  <Zoom in={true} timeout={800} style={{ transitionDelay: '200ms' }}>
                    <Paper>
                      <StyledTable>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <PersonIcon sx={{ fontSize: 16 }} />
                                  <span>Customer</span>
                                </Stack>
                              </TableCell>
                              <TableCell>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <ScheduleIcon sx={{ fontSize: 16 }} />
                                  <span>Date & Time</span>
                                </Stack>
                              </TableCell>
                              <TableCell>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <AssignmentIcon sx={{ fontSize: 16 }} />
                                  <span>Purpose</span>
                                </Stack>
                              </TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <LocationIcon sx={{ fontSize: 16 }} />
                                  <span>Location</span>
                                </Stack>
                              </TableCell>
                              <TableCell>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {appointments.map((appt: any, index) => {
                              const { date, time } = formatDateTime(appt.date, appt.time);
                              return (
                                <TableRow key={appt.id}>
                                  <TableCell>
                                    <Box>
                                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {appt.client_name || appt.client?.name || appt.client || '-'}
                                      </Typography>
                            {appt.assigned_to_name && (
                                        <Typography variant="caption" color="text.secondary">
                                          Assigned to: {appt.assigned_to_name}
                                        </Typography>
                                      )}
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    <Box>
                                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {date}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {time}
                                      </Typography>
                            {appt.duration && (
                                        <Typography variant="caption" color="text.disabled" sx={{ display: 'block' }}>
                                          {appt.duration} min
                                        </Typography>
                                      )}
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    <Box>
                                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {appt.purpose}
                                      </Typography>
                            {appt.notes && (
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                          {appt.notes}
                                        </Typography>
                                      )}
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    <Stack spacing={0.5}>
                                      <StatusChip
                                        label={appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                                        size="small"
                                        status={appt.status}
                                      />
                            {appt.is_today && (
                                        <Chip
                                          label="Today"
                                          size="small"
                                          color="warning"
                                          variant="outlined"
                                          icon={<TodayIcon />}
                                        />
                            )}
                            {appt.is_overdue && (
                                        <Chip
                                          label="Overdue"
                                          size="small"
                                          color="error"
                                          variant="outlined"
                                          icon={<WarningIcon />}
                                        />
                                      )}
                                    </Stack>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2">
                            {appt.location || '-'}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                              {appt.status === 'scheduled' && (
                                <>
                                          <Tooltip title="Confirm Appointment">
                                            <ActionButton
                                              variant="contained"
                                              color="success"
                                              size="small"
                                    onClick={() => handleStatusAction(appt.id, 'confirm')}
                                              startIcon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                                  >
                                    Confirm
                                          </ActionButton>
                                          </Tooltip>
                                          <Tooltip title="Send Reminder">
                                            <ActionButton
                                              variant="contained"
                                              color="info"
                                              size="small"
                                    onClick={() => handleStatusAction(appt.id, 'send_reminder')}
                                              startIcon={<NotificationsIcon sx={{ fontSize: 14 }} />}
                                  >
                                    Remind
                                          </ActionButton>
                                          </Tooltip>
                                </>
                              )}
                              {appt.status === 'confirmed' && (
                                        <Tooltip title="Mark as Complete">
                                          <ActionButton
                                            variant="contained"
                                            color="success"
                                            size="small"
                                  onClick={() => handleStatusAction(appt.id, 'complete')}
                                          startIcon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                                >
                                  Complete
                                        </ActionButton>
                                      </Tooltip>
                              )}
                              {['scheduled', 'confirmed'].includes(appt.status) && (
                                        <Tooltip title="Cancel Appointment">
                                          <ActionButton
                                            variant="contained"
                                            color="error"
                                            size="small"
                                  onClick={() => handleStatusAction(appt.id, 'cancel')}
                                          startIcon={<CancelIcon sx={{ fontSize: 14 }} />}
                                >
                                  Cancel
                                        </ActionButton>
                                      </Tooltip>
                                    )}
                                  </Stack>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </StyledTable>
                  </Paper>
                  </Zoom>
                ) : (
                  <Fade in={true} timeout={800}>
                    <Box sx={{ 
                      bgcolor: alpha(theme.palette.primary.main, 0.02), 
                      p: 8, 
                      borderRadius: 2, 
                      textAlign: 'center' 
                    }}>
                      <CalendarIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        Calendar view coming soon...
                      </Typography>
                      <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
                        We're working on an interactive calendar view for better appointment management
                      </Typography>
                      <Button
                        variant="contained"
                  onClick={() => setView('list')}
                        startIcon={<ListIcon />}
                >
                  Switch to List View
                      </Button>
                    </Box>
                  </Fade>
            )}
              </Box>
            </Fade>
        )}
        </CardContent>
      </StyledCard>
    </Container>
  );
} 