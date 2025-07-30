'use client';

import { useEffect, useState } from 'react';
import { teamMembersAPI } from '@/lib/api';
import AddMemberModal from '@/components/AddMemberModal';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Container,
  ThemeProvider,
  createTheme,
  IconButton,
  Tooltip,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Store as StoreIcon,
  Work as WorkIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

// Create a theme for team management page
const teamManagementTheme = createTheme({
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
    info: {
      main: '#0288d1',
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
    MuiTable: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 600,
            backgroundColor: '#f8fafc',
          },
        },
      },
    },
  },
});

interface TeamMember {
  id: number;
  employee_id: string;
  user_name: string;
  user_email: string;
  user_role: string;
  user_username: string;
  department: string;
  position: string;
  status: string;
  performance_rating: string;
  sales_target: number;
  current_sales: number;
  sales_percentage: number;
  performance_color: string;
  hire_date: string;
  store_name?: string;
}

export default function ManagersTeamManagement() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTeamMembers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await teamMembersAPI.getTeamMembers();
      setTeamMembers(response.results || response || []);
    } catch (err: any) {
      console.error('Error fetching team members:', err);
      setError('Failed to load team members. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'manager':
        return 'primary';
      case 'in-house sales':
      case 'inhouse_sales':
        return 'success';
      case 'tele-calling':
      case 'tele_calling':
        return 'warning';
      case 'marketing':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <ThemeProvider theme={teamManagementTheme}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 700, color: 'primary.main' }}>
              Team Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your team members, roles, and performance
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsModalOpen(true)}
            sx={{
              px: 3,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Add Member
          </Button>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {isLoading ? (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            py: 8,
            flexDirection: 'column'
          }}>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography color="text.secondary" variant="h6">
              Loading team members...
            </Typography>
          </Box>
        ) : (
          /* Team Members Table */
          <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon sx={{ mr: 1, fontSize: 20 }} />
                        Name
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon sx={{ mr: 1, fontSize: 20 }} />
                        Username
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EmailIcon sx={{ mr: 1, fontSize: 20 }} />
                        Email
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <WorkIcon sx={{ mr: 1, fontSize: 20 }} />
                        Role
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <StoreIcon sx={{ mr: 1, fontSize: 20 }} />
                        Store
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <WorkIcon sx={{ mr: 1, fontSize: 20 }} />
                        Position
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      Status
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {teamMembers.map((member) => (
                    <TableRow 
                      key={member.id}
                      sx={{ 
                        '&:hover': { 
                          backgroundColor: 'action.hover',
                          transition: 'background-color 0.2s ease'
                        }
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            sx={{ 
                              mr: 2, 
                              bgcolor: 'primary.main',
                              width: 32,
                              height: 32,
                              fontSize: '0.875rem'
                            }}
                          >
                            {member.user_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {member.user_name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {member.user_username}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {member.user_email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={member.user_role.replace('_', ' ')}
                          color={getRoleColor(member.user_role) as any}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {member.store_name || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {member.position}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={member.status || 'Active'}
                          color={getStatusColor(member.status || 'active') as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton size="small" color="primary">
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Member">
                            <IconButton size="small" color="info">
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Member">
                            <IconButton size="small" color="error">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  {teamMembers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8}>
                        <Box sx={{ 
                          textAlign: 'center', 
                          py: 8,
                          color: 'text.secondary'
                        }}>
                          <PersonIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                          <Typography variant="h6" sx={{ mb: 1 }}>
                            No team members yet
                          </Typography>
                          <Typography variant="body2">
                            Start building your team by adding the first member
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* Add Member Modal */}
        <AddMemberModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchTeamMembers}
        />
      </Container>
    </ThemeProvider>
  );
} 