'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { escalationAPI } from '@/lib/api';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Container,
  ThemeProvider,
  createTheme,
  LinearProgress,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  PriorityHigh as PriorityHighIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { FlexGrid } from '@/components/ui/FlexGrid';
import api from '@/lib/api';

// Create a theme for manager escalations
const escalationTheme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    success: {
      main: '#2e7d32',
    },
    warning: {
      main: '#ed6c02',
    },
    error: {
      main: '#d32f2f',
    },
  },
  typography: {
    h4: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      },
    },
  },
});

interface Escalation {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  client_name: string;
  created_by: {
    first_name: string;
    last_name: string;
  };
  assigned_to: {
    first_name: string;
    last_name: string;
  } | null;
  created_at: string;
  due_date: string;
  is_overdue: boolean;
  time_to_resolution: number | null;
  sla_compliance: boolean;
}

interface EscalationStats {
  total_escalations: number;
  open_escalations: number;
  overdue_escalations: number;
  resolved_today: number;
  avg_resolution_time: number;
  sla_compliance_rate: number;
  escalations_by_priority: Record<string, number>;
  escalations_by_category: Record<string, number>;
  escalations_by_status: Record<string, number>;
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'pending_customer', label: 'Pending Customer' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const PRIORITY_OPTIONS = [
  { value: '', label: 'All Priority' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'open': return 'primary';
    case 'in_progress': return 'warning';
    case 'pending_customer': return 'warning';
    case 'resolved': return 'success';
    case 'closed': return 'default';
    default: return 'default';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'low': return 'success';
    case 'medium': return 'warning';
    case 'high': return 'warning';
    case 'urgent': return 'error';
    default: return 'default';
  }
};

export default function ManagerEscalationsPage() {
  const router = useRouter();
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [stats, setStats] = useState<EscalationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchEscalations = async () => {
    try {
      const response = await escalationAPI.getEscalations();
      setEscalations(Array.isArray(response) ? response : (response && Array.isArray(response.results) ? response.results : []));
    } catch (error) {
      console.error('Error fetching escalations:', error);
      setEscalations([]);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await escalationAPI.getEscalationStats();
      setStats(response);
    } catch (error) {
      console.error('Error fetching escalation stats:', error);
      setStats(null);
    }
  };

  useEffect(() => {
    fetchEscalations();
    fetchStats();
    setLoading(false);
  }, []);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPriorityFilter('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (minutes: number | null) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const filteredEscalations = escalations.filter(escalation => {
    const matchesSearch = escalation.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                         escalation.client_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                         escalation.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
    const matchesStatus = !statusFilter || escalation.status === statusFilter;
    const matchesPriority = !priorityFilter || escalation.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={escalationTheme}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ mb: 2, fontWeight: 700, color: 'primary.main' }}>
            Escalations Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor and manage customer escalations and support tickets
          </Typography>
        </Box>

        {/* Stats Cards */}
        {stats && (
          <FlexGrid container spacing={3} sx={{ mb: 4 }}>
            <FlexGrid xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ p: 1, bgcolor: 'primary.100', borderRadius: 1, mr: 2 }}>
                      <WarningIcon color="primary" />
                    </Box>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {stats.total_escalations}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Escalations
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </FlexGrid>
            <FlexGrid xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ p: 1, bgcolor: 'warning.100', borderRadius: 1, mr: 2 }}>
                      <ScheduleIcon color="warning" />
                    </Box>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {stats.open_escalations}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Open Escalations
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </FlexGrid>
            <FlexGrid xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ p: 1, bgcolor: 'error.100', borderRadius: 1, mr: 2 }}>
                      <PriorityHighIcon color="error" />
                    </Box>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {stats.overdue_escalations}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Overdue Escalations
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </FlexGrid>
            <FlexGrid xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ p: 1, bgcolor: 'success.100', borderRadius: 1, mr: 2 }}>
                      <CheckCircleIcon color="success" />
                    </Box>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {stats.resolved_today}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Resolved Today
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </FlexGrid>
          </FlexGrid>
        )}

        {/* Filters */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Filters
            </Typography>
            <FlexGrid container spacing={2} alignItems="center">
              <FlexGrid xs={12} sm={4}>
                <TextField
                  fullWidth
                  placeholder="Search escalations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </FlexGrid>
              <FlexGrid xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Status"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </FlexGrid>
              <FlexGrid xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    label="Priority"
                  >
                    {PRIORITY_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </FlexGrid>
              <FlexGrid xs={12} sm={2}>
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={clearFilters}
                  fullWidth
                >
                  Clear
                </Button>
              </FlexGrid>
            </FlexGrid>
          </CardContent>
        </Card>

        {/* Escalations Table */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Escalations ({filteredEscalations.length})
              </Typography>
            </Box>
            
            {filteredEscalations.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">No escalations found</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Client</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Assigned To</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredEscalations.map((escalation) => (
                      <TableRow key={escalation.id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {escalation.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {escalation.description.substring(0, 50)}...
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {escalation.client_name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={escalation.status.replace('_', ' ')}
                            color={getStatusColor(escalation.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={escalation.priority}
                            color={getPriorityColor(escalation.priority)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {escalation.assigned_to 
                              ? `${escalation.assigned_to.first_name} ${escalation.assigned_to.last_name}`
                              : 'Unassigned'
                            }
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">
                              {formatDate(escalation.due_date)}
                            </Typography>
                            {escalation.is_overdue && (
                              <Chip
                                label="Overdue"
                                color="error"
                                size="small"
                                sx={{ mt: 0.5 }}
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => router.push(`/escalation/${escalation.id}`)}
                              color="primary"
                            >
                              <ViewIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => router.push(`/escalation/${escalation.id}/edit`)}
                              color="secondary"
                            >
                              <EditIcon />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Container>
    </ThemeProvider>
  );
} 