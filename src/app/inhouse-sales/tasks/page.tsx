'use client';

import React, { useState, useEffect } from 'react';
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
  LinearProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Slider,
  Divider,
  InputAdornment,
  Fade,
  Zoom,
  useTheme,
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Calendar as CalendarIcon,
  Schedule as ClockIcon,
  Person as UserIcon,
  TrackChanges as TargetIcon,
  CheckCircle as CheckCircleIcon,
  Warning as AlertCircleIcon,
  Add as PlusIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Flag as GoalIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Done as DoneIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Timer as TimerIcon
} from '@mui/icons-material';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

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

const StatCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
  borderRadius: theme.spacing(2),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  }
}));

const TaskCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(1.5),
  border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    boxShadow: theme.shadows[4],
  }
}));

const PriorityChip = styled(Chip)<{ priority: string }>(({ theme, priority }) => {
  const colors = {
    urgent: { bg: theme.palette.error.main, color: theme.palette.error.contrastText },
    high: { bg: theme.palette.warning.main, color: theme.palette.warning.contrastText },
    medium: { bg: theme.palette.info.main, color: theme.palette.info.contrastText },
    low: { bg: theme.palette.success.main, color: theme.palette.success.contrastText },
  };
  const colorConfig = colors[priority as keyof typeof colors] || colors.medium;
  
  return {
    backgroundColor: colorConfig.bg,
    color: colorConfig.color,
    fontWeight: 600,
    '& .MuiChip-label': {
      paddingLeft: theme.spacing(1.5),
      paddingRight: theme.spacing(1.5),
    }
  };
});

const StatusChip = styled(Chip)<{ status: string }>(({ theme, status }) => {
  const colors = {
    completed: 'success',
    in_progress: 'primary',
    pending: 'warning',
    cancelled: 'error',
    on_hold: 'default',
  };
  return {
    fontWeight: 600,
  };
});

interface Task {
  id: number;
  title: string;
  description: string;
  task_type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  assigned_to: {
    id: number;
    full_name: string;
    email: string;
  };
  assigned_by: {
    id: number;
    full_name: string;
    email: string;
  };
  due_date: string;
  start_date: string | null;
  completed_date: string | null;
  progress_percentage: number;
  customer: {
    id: number;
    full_name: string;
    email: string;
  } | null;
  goal: {
    id: number;
    title: string;
  } | null;
  store: {
    id: number;
    name: string;
  } | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  notes: string | null;
  is_overdue: boolean;
  days_remaining: number;
  is_high_priority: boolean;
  created_at: string;
  updated_at: string;
}

interface TaskStatistics {
  total_tasks: number;
  pending_tasks: number;
  in_progress_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  high_priority_tasks: number;
  urgent_tasks: number;
  average_progress: number;
  completion_rate: number;
}

const TaskManagementPage = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statistics, setStatistics] = useState<TaskStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showOverdue, setShowOverdue] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [goals, setGoals] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    task_type: 'custom',
    priority: 'medium',
    due_date: '',
    estimated_hours: '',
    notes: '',
    assigned_to: 'none',
    customer: 'none',
    goal: 'none'
  });

  // Keep all the existing useEffect hooks and API functions unchanged
  useEffect(() => {
    if (user) {
    fetchTasks();
    fetchStatistics();
    fetchUsers();
    fetchCustomers();
    fetchGoals();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks/tasks/');
      setTasks(response.data.results || response.data || []);
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      setError('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await api.get('/tasks/statistics/');
      setStatistics(response.data);
    } catch (error: any) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users/');
      setUsers(response.data.results || response.data || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/clients/clients/');
      setCustomers(response.data.results || response.data || []);
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
    }
  };

  const fetchGoals = async () => {
    try {
      const response = await api.get('/goals/goals/');
      setGoals(response.data.results || response.data || []);
    } catch (error: any) {
      console.error('Error fetching goals:', error);
      setGoals([]);
    }
  };

  const createTask = async () => {
    try {
      if (!newTask.title.trim()) {
        alert('Please enter a task title');
        return;
      }
      if (!newTask.description.trim()) {
        alert('Please enter a task description');
        return;
      }
      if (!newTask.due_date) {
        alert('Please select a due date');
        return;
      }
      if (newTask.assigned_to === 'none') {
        alert('Please assign the task to someone');
        return;
      }

      const taskData = {
        title: newTask.title.trim(),
        description: newTask.description.trim(),
        task_type: newTask.task_type,
        priority: newTask.priority,
        due_date: newTask.due_date,
        estimated_hours: newTask.estimated_hours ? parseFloat(newTask.estimated_hours) : null,
        notes: newTask.notes.trim() || null,
        assigned_to: parseInt(newTask.assigned_to.toString()),
        customer: newTask.customer && newTask.customer !== 'none' ? parseInt(newTask.customer.toString()) : null,
        goal: newTask.goal && newTask.goal !== 'none' ? parseInt(newTask.goal.toString()) : null
      };

      await api.post('/tasks/tasks/', taskData);
      
      setIsCreateDialogOpen(false);
      setNewTask({
        title: '',
        description: '',
        task_type: 'custom',
        priority: 'medium',
        due_date: '',
        estimated_hours: '',
        notes: '',
        assigned_to: 'none',
        customer: 'none',
        goal: 'none'
      });
      fetchTasks();
      fetchStatistics();
      alert('Task created successfully!');
    } catch (error: any) {
      console.error('Error creating task:', error);
      if (error.response?.data) {
        const errorMessage = typeof error.response.data === 'object' 
          ? JSON.stringify(error.response.data, null, 2)
          : error.response.data;
        alert(`Error creating task: ${errorMessage}`);
      } else {
        alert('Error creating task. Please try again.');
      }
    }
  };

  const updateTaskStatus = async (taskId: number, status: string) => {
    try {
      await api.patch(`/tasks/tasks/${taskId}/`, { status });
      fetchTasks();
      fetchStatistics();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const updateTaskProgress = async (taskId: number, progress: number) => {
    try {
      await api.patch(`/tasks/tasks/${taskId}/`, { progress_percentage: progress });
      fetchTasks();
      fetchStatistics();
    } catch (error) {
      console.error('Error updating task progress:', error);
    }
  };

  const confirmDeleteTask = (taskId: number) => {
    setDeleteTaskId(taskId);
    setIsDeleteDialogOpen(true);
  };

  const deleteTask = async () => {
    if (!deleteTaskId) return;

    try {
      await api.delete(`/tasks/tasks/${deleteTaskId}/`);
      fetchTasks();
      fetchStatistics();
      alert('Task deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting task:', error);
      alert('Error deleting task. Please try again.');
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteTaskId(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'primary';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      case 'on_hold': return 'default';
      default: return 'default';
    }
  };

  const getTaskTypeLabel = (type: string) => {
    switch (type) {
      case 'sales': return 'Sales Task';
      case 'follow_up': return 'Follow-up Task';
      case 'customer_service': return 'Customer Service';
      case 'administrative': return 'Administrative';
      case 'training': return 'Training';
      case 'custom': return 'Custom Task';
      default: return type;
    }
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Authentication Required
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Please log in to access the task management system.
            </Typography>
          </Alert>
          <Button
            variant="contained"
            onClick={() => window.location.href = '/login'}
            size="large"
          >
            Go to Login
          </Button>
        </Box>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <Stack spacing={2} alignItems="center">
            <CircularProgress size={64} />
            <Typography variant="h6" color="text.secondary">
              Loading tasks...
            </Typography>
          </Stack>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">
          <Typography variant="h6" gutterBottom>
            Error
          </Typography>
          <Typography>{error}</Typography>
        </Alert>
      </Container>
    );
  }

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesSearch = searchTerm === '' || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assigned_to.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOverdue = !showOverdue || task.is_overdue;
    
    return matchesStatus && matchesPriority && matchesSearch && matchesOverdue;
  });

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Fade in={true} timeout={800}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 800, color: 'primary.dark' }}>
            Task Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage tasks, track progress, and boost team productivity
          </Typography>
        </Box>
      </Fade>

      {/* Statistics Cards */}
      {statistics && (
        <Fade in={true} timeout={1000} style={{ transitionDelay: '200ms' }}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                      <AssignmentIcon color="primary" />
                    </Box>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.dark' }}>
                        {statistics.total_tasks}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Tasks
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </StatCard>
            </Grid>
            
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
                      <TimerIcon color="warning" />
                    </Box>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.dark' }}>
                        {statistics.pending_tasks}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pending Tasks
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </StatCard>
            </Grid>
            
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.1) }}>
                      <CheckCircleIcon color="success" />
                    </Box>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.dark' }}>
                        {statistics.completed_tasks}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Completed
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </StatCard>
            </Grid>
            
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.1) }}>
                      <TrendingUpIcon color="info" />
                    </Box>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.dark' }}>
                        {statistics.completion_rate.toFixed(1)}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Completion Rate
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </StatCard>
            </Grid>
          </Grid>
        </Fade>
      )}

      {/* Filters and Actions */}
      <Fade in={true} timeout={1000} style={{ transitionDelay: '400ms' }}>
        <StyledCard sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    label="Status"
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                    <MenuItem value="on_hold">On Hold</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={filterPriority}
                    label="Priority"
                    onChange={(e) => setFilterPriority(e.target.value)}
                  >
                    <MenuItem value="all">All Priority</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showOverdue}
                      onChange={(e) => setShowOverdue(e.target.checked)}
                      color="error"
                    />
                  }
                  label="Overdue Only"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    startIcon={<PlusIcon />}
                    onClick={() => setIsCreateDialogOpen(true)}
                    fullWidth
                  >
                Create Task
              </Button>
                  <Button
                    variant="outlined"
                    startIcon={<GoalIcon />}
                    onClick={() => window.location.href = '/inhouse-sales/goals'}
                  >
                    Goals
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </StyledCard>
      </Fade>

      {/* Task List */}
      <Fade in={true} timeout={1000} style={{ transitionDelay: '600ms' }}>
        <StyledCard>
          <CardHeader
            title={
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Tasks ({filteredTasks.length})
              </Typography>
            }
          />
          <CardContent>
            {filteredTasks.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <AssignmentIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No tasks found
                </Typography>
                <Typography variant="body2" color="text.disabled">
                  {tasks.length === 0 ? 'Create your first task to get started' : 'Try adjusting your filters'}
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {filteredTasks.map((task, index) => (
                  <Zoom
                    key={task.id}
                    in={true}
                    timeout={300}
                    style={{ transitionDelay: `${index * 50}ms` }}
                  >
                    <TaskCard>
                      <CardContent>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} md={6}>
                            <Stack spacing={1}>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                  {task.title}
                                </Typography>
                                <PriorityChip
                                  label={task.priority.toUpperCase()}
                                  size="small"
                                  priority={task.priority}
                                />
                                {task.is_overdue && (
                                  <Chip
                                    label="OVERDUE"
                                    size="small"
                                    color="error"
                                    variant="outlined"
                                  />
                                )}
                              </Stack>
                              <Typography variant="body2" color="text.secondary" noWrap>
                                {task.description}
                              </Typography>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Chip
                                  label={getTaskTypeLabel(task.task_type)}
                                  size="small"
                                  variant="outlined"
                                />
                                <StatusChip
                                  label={task.status.replace('_', ' ').toUpperCase()}
                                  size="small"
                                  color={getStatusColor(task.status) as any}
                                />
                              </Stack>
                            </Stack>
                          </Grid>
                          
                          <Grid item xs={12} md={3}>
                            <Stack spacing={1}>
                              <Typography variant="caption" color="text.secondary">
                                Progress: {task.progress_percentage}%
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={task.progress_percentage}
                                sx={{ height: 8, borderRadius: 4 }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                Assigned to: {task.assigned_to.full_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Due: {new Date(task.due_date).toLocaleDateString()}
                              </Typography>
                            </Stack>
                          </Grid>
                          
                          <Grid item xs={12} md={3}>
                            <Stack direction="row" spacing={1} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                              {task.status === 'pending' && (
                                <Tooltip title="Start Task">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => updateTaskStatus(task.id, 'in_progress')}
                                  >
                                    <PlayIcon />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {task.status === 'in_progress' && (
                                <>
                                  <Tooltip title="Complete Task">
                                    <IconButton
                                      size="small"
                                      color="success"
                                      onClick={() => updateTaskStatus(task.id, 'completed')}
                                    >
                                      <DoneIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Pause Task">
                                    <IconButton
                                      size="small"
                                      color="warning"
                                      onClick={() => updateTaskStatus(task.id, 'on_hold')}
                                    >
                                      <PauseIcon />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                              {task.status === 'on_hold' && (
                                <Tooltip title="Resume Task">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => updateTaskStatus(task.id, 'in_progress')}
                                  >
                                    <PlayIcon />
                                  </IconButton>
                                </Tooltip>
                              )}
                              <Tooltip title="Delete Task">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => confirmDeleteTask(task.id)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </TaskCard>
                  </Zoom>
                ))}
              </Stack>
            )}
          </CardContent>
        </StyledCard>
      </Fade>

      {/* Create Task Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
                <DialogTitle>Create New Task</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Title *"
                  fullWidth
                      value={newTask.title}
                      onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter task title"
                    />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Assign To *</InputLabel>
                    <Select 
                      value={newTask.assigned_to} 
                    label="Assign To *"
                    onChange={(e) => setNewTask(prev => ({ ...prev, assigned_to: e.target.value }))}
                  >
                    <MenuItem value="none">Select team member</MenuItem>
                        {Array.isArray(users) && users.length > 0 ? (
                          users.map((user: any) => (
                        <MenuItem key={user.id} value={user.id.toString()}>
                              {user.full_name || `${user.first_name} ${user.last_name}`}
                        </MenuItem>
                          ))
                        ) : (
                      <MenuItem value="none" disabled>No team members available</MenuItem>
                        )}
                    </Select>
                </FormControl>
              </Grid>
            </Grid>

            <TextField
              label="Description *"
              fullWidth
              multiline
              rows={3}
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter task description"
            />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Task Type</InputLabel>
                  <Select
                    value={newTask.task_type}
                    label="Task Type"
                    onChange={(e) => setNewTask(prev => ({ ...prev, task_type: e.target.value }))}
                  >
                    <MenuItem value="sales">Sales Task</MenuItem>
                    <MenuItem value="follow_up">Follow-up Task</MenuItem>
                    <MenuItem value="customer_service">Customer Service</MenuItem>
                    <MenuItem value="administrative">Administrative</MenuItem>
                    <MenuItem value="training">Training</MenuItem>
                    <MenuItem value="custom">Custom Task</MenuItem>
                    </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={newTask.priority}
                    label="Priority"
                    onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                    </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Due Date *"
                      type="datetime-local"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                      value={newTask.due_date}
                      onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                    />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Estimated Hours"
                      type="number"
                  inputProps={{ step: 0.5 }}
                  fullWidth
                      value={newTask.estimated_hours}
                      onChange={(e) => setNewTask(prev => ({ ...prev, estimated_hours: e.target.value }))}
                      placeholder="Enter estimated hours"
                    />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Customer</InputLabel>
                  <Select
                    value={newTask.customer}
                    label="Customer"
                    onChange={(e) => setNewTask(prev => ({ ...prev, customer: e.target.value }))}
                  >
                    <MenuItem value="none">No customer</MenuItem>
                        {Array.isArray(customers) && customers.length > 0 ? (
                          customers.map((customer: any) => (
                        <MenuItem key={customer.id} value={customer.id.toString()}>
                              {customer.full_name || `${customer.first_name} ${customer.last_name}`}
                        </MenuItem>
                          ))
                        ) : (
                      <MenuItem value="none" disabled>No customers available</MenuItem>
                        )}
                    </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Goal</InputLabel>
                  <Select
                    value={newTask.goal}
                    label="Goal"
                    onChange={(e) => setNewTask(prev => ({ ...prev, goal: e.target.value }))}
                  >
                    <MenuItem value="none">No goal</MenuItem>
                        {Array.isArray(goals) && goals.length > 0 ? (
                          goals.map((goal: any) => (
                        <MenuItem key={goal.id} value={goal.id.toString()}>
                              {goal.title}
                        </MenuItem>
                          ))
                        ) : (
                      <MenuItem value="none" disabled>No goals available</MenuItem>
                        )}
                    </Select>
                </FormControl>
              </Grid>
            </Grid>

            <TextField
              label="Notes"
              fullWidth
              multiline
              rows={2}
                    value={newTask.notes}
                    onChange={(e) => setNewTask(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Enter additional notes"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
          <Button onClick={createTask} variant="contained">
                    Create Task
                  </Button>
        </DialogActions>
          </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
            <DialogTitle>Delete Task</DialogTitle>
        <DialogContent>
          <Typography>
              Are you sure you want to delete this task? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
          <Button onClick={deleteTask} variant="contained" color="error">
                      Delete
                    </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TaskManagementPage; 