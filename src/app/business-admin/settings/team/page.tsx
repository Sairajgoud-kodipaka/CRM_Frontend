'use client';

import { useState, useEffect } from 'react';
import { teamMembersAPI, storesAPI } from '@/lib/api';
import AddMemberModal from '@/components/AddMemberModal';
import EditMemberModal from '@/components/EditMemberModal';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import toast from 'react-hot-toast';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ThemeProvider,
  createTheme,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Assessment as AssessmentIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Store as StoreIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Color scheme
const colors = {
  softWhite: '#F9FAFB',
  white: '#FFFFFF',
  softNavy: '#23395D',
  darkNavy: '#1B263B',
  softGrey: '#D0D6DD',
  gold: '#FFD700',
};

// Create theme for team settings page
const teamSettingsTheme = createTheme({
  palette: {
    primary: {
      main: colors.softNavy,
      light: colors.softGrey,
      dark: colors.darkNavy,
    },
    secondary: {
      main: colors.gold,
    },
    background: {
      default: colors.softWhite,
      paper: colors.white,
    },
    text: {
      primary: colors.darkNavy,
      secondary: colors.softNavy,
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
          borderRadius: 16,
          boxShadow: `0 8px 32px rgba(35, 57, 93, 0.1)`,
          border: `1px solid ${colors.softGrey}`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
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

export default function SettingsTeam() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stores, setStores] = useState<any[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>('');

  // Calculate stats
  const totalMembers = teamMembers.length;
  const activeMembers = teamMembers.filter(member => member.status === 'active').length;
  const totalSales = teamMembers.reduce((sum, member) => sum + member.current_sales, 0);
  const avgPerformance = totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0;

  const fetchTeamMembers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await teamMembersAPI.getTeamMembers();
      setTeamMembers(response.results || response || []);
    } catch (err: any) {
      console.error('Error fetching team members:', err);
      setError('Failed to load team members');
      // For demo purposes, show some mock data
      setTeamMembers([
        {
          id: 1,
          employee_id: '1001',
          user_name: 'John Doe',
          user_email: 'john.doe@example.com',
          user_role: 'Manager',
          user_username: 'john.doe',
          department: 'Sales',
          position: 'Sales Manager',
          status: 'active',
          performance_rating: 'excellent',
          sales_target: 50000,
          current_sales: 45000,
          sales_percentage: 90,
          performance_color: 'text-green-600',
          hire_date: '2024-01-15',
          store_name: 'Store A'
        },
        {
          id: 2,
          employee_id: '1002',
          user_name: 'Jane Smith',
          user_email: 'jane.smith@example.com',
          user_role: 'In-house Sales',
          user_username: 'jane.smith',
          department: 'Sales',
          position: 'Sales Representative',
          status: 'active',
          performance_rating: 'good',
          sales_target: 30000,
          current_sales: 28000,
          sales_percentage: 93,
          performance_color: 'text-blue-600',
          hire_date: '2024-01-16',
          store_name: 'Store B'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
    // Fetch stores for filter dropdown
    const fetchStores = async () => {
      try {
        const data = await storesAPI.getStores();
        setStores(Array.isArray(data) ? data : (data && Array.isArray(data.results) ? data.results : []));
      } catch {}
    };
    fetchStores();
  }, []);

  const handleAddMember = () => {
    setIsModalOpen(true);
  };

  const handleMemberAdded = async () => {
    await fetchTeamMembers();
    toast.success('Team member list refreshed!');
  };

  const handleEditMember = (member: TeamMember) => {
    setSelectedMember(member);
    setIsEditModalOpen(true);
  };

  const handleMemberEdited = () => {
    fetchTeamMembers();
    setSelectedMember(null);
  };

  const handleRemoveMember = (member: TeamMember) => {
    setMemberToDelete(member);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!memberToDelete) return;
    
    try {
      setIsDeleting(true);
      await teamMembersAPI.deleteTeamMember(memberToDelete.id);
      await fetchTeamMembers();
      setIsDeleteModalOpen(false);
      setMemberToDelete(null);
    } catch (error: any) {
      console.error('Error deleting team member:', error);
      alert(error.response?.data?.message || 'Failed to delete team member');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setMemberToDelete(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'suspended': return 'warning';
      case 'on_leave': return 'default';
      default: return 'default';
    }
  };

  const getStatusDisplayName = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'active': 'Active',
      'inactive': 'Inactive',
      'suspended': 'Suspended',
      'on_leave': 'On Leave'
    };
    return statusMap[status] || status;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Filter team members by selected store
  const filteredMembers = selectedStore
    ? teamMembers.filter(m => m.store_name === selectedStore)
    : teamMembers;

  return (
    <ThemeProvider theme={teamSettingsTheme}>
      <Box sx={{ backgroundColor: colors.softWhite, minHeight: '100vh', p: 0 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              color: colors.darkNavy,
              fontWeight: 700,
              mb: 1
            }}
          >
            Team Management
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ color: colors.softNavy }}
          >
            Add and manage managers, sales, marketing, and tele-caller teams. Assign members to stores and define roles.
          </Typography>
        </Box>

        {/* Team Stats */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
          <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: 'primary.main', 
                    mr: 2,
                    width: 56,
                    height: 56
                  }}
                >
                  <PeopleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: colors.darkNavy }}>
                    {totalMembers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Team Members
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.softNavy }}>
                    {totalMembers === 0 ? 'No team members' : `${totalMembers} member${totalMembers !== 1 ? 's' : ''}`}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: 'success.main', 
                    mr: 2,
                    width: 56,
                    height: 56
                  }}
                >
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: colors.darkNavy }}>
                    {activeMembers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Members
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.softNavy }}>
                    {activeMembers === 0 ? 'No active members' : `${activeMembers} active`}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: 'warning.main', 
                    mr: 2,
                    width: 56,
                    height: 56
                  }}
                >
                  <MoneyIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: colors.darkNavy }}>
                    $NaN
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Sales
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.softNavy }}>
                    This month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: 'info.main', 
                    mr: 2,
                    width: 56,
                    height: 56
                  }}
                >
                  <AssessmentIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: colors.darkNavy }}>
                    {avgPerformance}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Performance
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.softNavy }}>
                    Team average
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Store Filter and Add Button */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Store Filter</InputLabel>
            <Select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              label="Store Filter"
              startAdornment={<StoreIcon sx={{ mr: 1, color: colors.softNavy }} />}
            >
              <MenuItem value="">All Stores</MenuItem>
              {stores.map(store => (
                <MenuItem key={store.id} value={store.name}>{store.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddMember}
            sx={{
              background: `linear-gradient(135deg, ${colors.softNavy} 0%, ${colors.darkNavy} 100%)`,
              color: colors.white,
              '&:hover': {
                background: `linear-gradient(135deg, ${colors.darkNavy} 0%, ${colors.softNavy} 100%)`,
              },
            }}
          >
            Add Member
          </Button>
        </Box>

        {/* Team Members Table */}
        <Card sx={{ mb: 4 }}>
          <Box sx={{ p: 3, borderBottom: `1px solid ${colors.softGrey}` }}>
            <Typography variant="h6" sx={{ color: colors.darkNavy, fontWeight: 600 }}>
              Team Members
            </Typography>
          </Box>
          
          <Box sx={{ p: 3 }}>
            {isLoading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Loading team members...
                </Typography>
              </Box>
            ) : error ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
                <Button 
                  onClick={fetchTeamMembers}
                  startIcon={<RefreshIcon />}
                  sx={{ color: colors.softNavy }}
                >
                  Try again
                </Button>
              </Box>
            ) : filteredMembers.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  No team members found for this store.
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Add your first team member to get started
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, color: colors.darkNavy }}>Member</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: colors.darkNavy }}>Role</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: colors.darkNavy }}>Department</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: colors.darkNavy }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: colors.darkNavy }}>Store</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: colors.darkNavy }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredMembers.map((member) => (
                      <TableRow key={member.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar 
                              sx={{ 
                                mr: 2, 
                                bgcolor: colors.softNavy,
                                width: 40,
                                height: 40
                              }}
                            >
                              {member.user_name ? member.user_name.split(' ').map(n => n[0]).join('') : 'NA'}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: colors.darkNavy }}>
                                {member.user_name || 'No Name'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {member.user_email}
                              </Typography>
                              <Typography variant="caption" display="block" color="text.secondary">
                                ID: {member.employee_id}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: colors.darkNavy }}>
                            {member.user_role}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {member.position}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: colors.darkNavy }}>
                            {member.department || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusDisplayName(member.status)}
                            color={getStatusColor(member.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: colors.darkNavy }}>
                            {member.store_name || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Edit Member">
                              <IconButton 
                                onClick={() => handleEditMember(member)}
                                size="small"
                                sx={{ color: colors.softNavy }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Remove Member">
                              <IconButton 
                                onClick={() => handleRemoveMember(member)}
                                size="small"
                                sx={{ color: 'error.main' }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Card>

        {/* Performance Overview */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
          <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
            <Card>
              <Box sx={{ p: 3, borderBottom: `1px solid ${colors.softGrey}` }}>
                <Typography variant="h6" sx={{ color: colors.darkNavy, fontWeight: 600 }}>
                  Performance Overview
                </Typography>
              </Box>
              <CardContent>
                {teamMembers.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      No performance data
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Performance metrics will appear here once team members are added
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    <Box sx={{ flex: '1 1 100px', minWidth: '100px', textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                        {activeMembers}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Active Members
                      </Typography>
                    </Box>
                    <Box sx={{ flex: '1 1 100px', minWidth: '100px', textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                        {avgPerformance}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Team Performance
                      </Typography>
                    </Box>
                    <Box sx={{ flex: '1 1 100px', minWidth: '100px', textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                        {formatCurrency(totalSales)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Total Sales
                      </Typography>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* Recent Activities */}
          <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
            <Card>
              <Box sx={{ p: 3, borderBottom: `1px solid ${colors.softGrey}` }}>
                <Typography variant="h6" sx={{ color: colors.darkNavy, fontWeight: 600 }}>
                  Recent Activities
                </Typography>
              </Box>
              <CardContent>
                {teamMembers.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      No recent activities
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Activities will appear here once the team is active
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {teamMembers.slice(0, 3).map((member) => (
                      <Box key={member.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: colors.softNavy,
                            width: 32,
                            height: 32
                          }}
                        >
                          {member.user_name ? member.user_name.split(' ').map(n => n[0]).join('') : 'NA'}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ color: colors.darkNavy }}>
                            <strong>{member.user_name || 'Unknown User'}</strong> joined the team
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(member.hire_date)}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Modals */}
        <AddMemberModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleMemberAdded}
        />
        
        {selectedMember && (
          <EditMemberModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedMember(null);
            }}
            onSuccess={handleMemberEdited}
            member={selectedMember}
          />
        )}

        {memberToDelete && (
          <DeleteConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={handleDeleteCancel}
            onConfirm={handleDeleteConfirm}
            memberName={memberToDelete.user_name || 'Unknown User'}
            isLoading={isDeleting}
          />
        )}
      </Box>
    </ThemeProvider>
  );
} 