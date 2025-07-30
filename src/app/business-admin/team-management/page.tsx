'use client';

import { useState, useEffect } from 'react';
import { teamMembersAPI, storesAPI } from '@/lib/api';
import AddMemberModal from '@/components/AddMemberModal';
import EditMemberModal from '@/components/EditMemberModal';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import toast from 'react-hot-toast';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Grid,
  Stack,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery,
  Fade,
  Zoom
} from '@mui/material';
import {
  Group as GroupIcon,
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';

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

export default function TeamManagement() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
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
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'suspended':
        return 'warning';
      case 'on_leave':
        return 'default';
      default:
        return 'default';
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

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('') : 'NA';
  };

  // Filter team members by selected store
  const filteredMembers = selectedStore
    ? teamMembers.filter(m => m.store_name === selectedStore)
    : teamMembers;

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon, 
    color = 'primary' 
  }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ReactNode;
    color?: string;
  }) => (
    <Zoom in={true} style={{ transitionDelay: '100ms' }}>
      <Card elevation={2} sx={{ height: '100%' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box 
              sx={{ 
                p: 1, 
                borderRadius: 2, 
                bgcolor: `${color}.light`, 
                color: `${color}.main`,
                mr: 2
              }}
            >
              {icon}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              {title}
            </Typography>
          </Box>
          <Typography variant="h4" component="div" gutterBottom sx={{ fontWeight: 700 }}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        </CardContent>
      </Card>
    </Zoom>
  );

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'grey.50',
      py: { xs: 2, md: 3 },
      px: { xs: 2, md: 3 }
    }}>
      <Container maxWidth="xl" disableGutters>
        {/* Header Section */}
        <Box sx={{ mb: { xs: 3, md: 4 } }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            mb: 3
          }}>
            <Box>
              <Typography 
                variant={isMobile ? "h5" : "h4"} 
                component="h1" 
                gutterBottom
                sx={{ fontWeight: 700, color: 'text.primary' }}
              >
                Team Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage your sales team and their performance
              </Typography>
            </Box>
            <Stack direction="row" spacing={2} sx={{ flexShrink: 0 }}>
              <Tooltip title="Refresh data">
                <IconButton onClick={fetchTeamMembers} color="primary">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={handleAddMember}
                sx={{ 
                  display: { xs: 'none', sm: 'flex' },
                  minWidth: 'fit-content'
                }}
              >
                Add Member
              </Button>
            </Stack>
          </Box>
          
          {/* Mobile Action Buttons */}
          <Box sx={{ display: { xs: 'flex', sm: 'none' }, gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<PersonAddIcon />}
              onClick={handleAddMember}
            >
              Add Member
            </Button>
          </Box>
        </Box>

        {/* Team Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={3}>
            <StatCard
              title="Total Team Members"
              value={totalMembers}
              subtitle={totalMembers === 0 ? 'No team members' : `${totalMembers} member${totalMembers !== 1 ? 's' : ''}`}
              icon={<GroupIcon />}
              color="primary"
            />
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <StatCard
              title="Active Members"
              value={activeMembers}
              subtitle={activeMembers === 0 ? 'No active members' : `${activeMembers} active`}
              icon={<TrendingUpIcon />}
              color="success"
            />
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <StatCard
              title="Total Sales"
              value={formatCurrency(totalSales)}
              subtitle={totalSales === 0 ? 'No sales data' : 'This month'}
              icon={<MoneyIcon />}
              color="info"
            />
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <StatCard
              title="Avg Performance"
              value={`${avgPerformance}%`}
              subtitle={avgPerformance === 0 ? 'No performance data' : 'Team average'}
              icon={<AssessmentIcon />}
              color="warning"
            />
          </Grid>
        </Grid>

        {/* Store Filter */}
        <Card elevation={2} sx={{ mb: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Store:
              </Typography>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Select Store</InputLabel>
                <Select
                  value={selectedStore}
                  label="Select Store"
                  onChange={(e) => setSelectedStore(e.target.value)}
                >
                  <MenuItem value="">All Stores</MenuItem>
                  {stores.map(store => (
                    <MenuItem key={store.id} value={store.name}>{store.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>

        {/* Team Members Table */}
        <Card elevation={2} sx={{ mb: 4 }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              gap: 2,
              mb: 3
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Team Members
              </Typography>
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={handleAddMember}
                sx={{ 
                  display: { xs: 'none', sm: 'flex' },
                  minWidth: 'fit-content'
                }}
              >
                Add Member
              </Button>
            </Box>

            {isLoading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Loading team members...
                </Typography>
              </Box>
            ) : error ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
                <Button onClick={fetchTeamMembers} variant="outlined">
                  Try again
                </Button>
              </Box>
            ) : filteredMembers.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <GroupIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  No team members found for this store.
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Add your first team member to get started
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Member</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Store</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredMembers.map((member) => (
                      <Fade in={true} key={member.id}>
                        <TableRow hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                                {getInitials(member.user_name)}
                              </Avatar>
                              <Box>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                  {member.user_name || 'No Name'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {member.user_email}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  ID: {member.employee_id}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {member.user_role}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {member.position}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {member.department || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusDisplayName(member.status)}
                              color={getStatusColor(member.status) as any}
                              size="small"
                              sx={{ fontWeight: 500 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {member.store_name || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Tooltip title="Edit member">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleEditMember(member)}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Remove member">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleRemoveMember(member)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      </Fade>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Performance Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Performance Overview
                </Typography>
                {teamMembers.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No performance data
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Performance metrics will appear here once team members are added
                    </Typography>
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ color: 'info.main', fontWeight: 700 }}>
                          {activeMembers}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Active Members
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ color: 'success.main', fontWeight: 700 }}>
                          {avgPerformance}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Team Performance
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ color: 'warning.main', fontWeight: 700 }}>
                          {formatCurrency(totalSales)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Sales
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Recent Activities
                </Typography>
                {teamMembers.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No recent activities
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Activities will appear here once the team is active
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={2}>
                    {teamMembers.slice(0, 3).map((member) => (
                      <Box key={member.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                          {getInitials(member.user_name)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2">
                            <Typography component="span" sx={{ fontWeight: 500 }}>
                              {member.user_name || 'Unknown User'}
                            </Typography> joined the team
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(member.hire_date)}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

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
      </Container>
    </Box>
  );
} 