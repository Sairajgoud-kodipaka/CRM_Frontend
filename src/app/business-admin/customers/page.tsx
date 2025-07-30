'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { customersAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
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
  useTheme,
  useMediaQuery,
  Fade,
  Zoom,
  ThemeProvider
} from '@mui/material';
import { businessAdminTheme } from '@/lib/theme';
import RefreshIcon from '@mui/icons-material/Refresh';
import UploadIcon from '@mui/icons-material/Upload';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CodeIcon from '@mui/icons-material/Code';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';

export default function BusinessAdminCustomers() {
  const { user, loading } = useAuth();
  const [customers, setCustomers] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (user) {
      fetchCustomers();
    }
  }, [user]);

  const fetchCustomers = async () => {
    setDataLoading(true);
    try {
      const customersData = await customersAPI.getCustomers();
      setCustomers(Array.isArray(customersData) ? customersData : (customersData && Array.isArray(customersData.results) ? customersData.results : []));
    } catch (err) {
      console.error('Error fetching customers:', err);
      setCustomers([]);
      toast.error('Failed to fetch customers');
    } finally {
      setDataLoading(false);
    }
  };

  const handleQuickExportCSV = async () => {
    try {
      const blob = await customersAPI.exportCustomersCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customers_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('CSV export completed successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export CSV file');
    }
  };

  const handleQuickExportJSON = async () => {
    try {
      const blob = await customersAPI.exportCustomersJSON();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customers_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('JSON export completed successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export JSON file');
    }
  };

  // Filter customers based on search term and status
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone?.includes(searchTerm);
    
    const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'customer':
        return 'success';
      case 'prospect':
        return 'warning';
      case 'lead':
        return 'info';
      default:
        return 'default';
    }
  };

  const StatCard = ({ title, value, color }: { title: string; value: number; color: string }) => (
    <Zoom in={true} style={{ transitionDelay: '100ms' }}>
      <Card elevation={2} sx={{ height: '100%' }}>
        <CardContent sx={{ textAlign: 'center', p: 3 }}>
          <Typography variant="h4" component="div" sx={{ color, fontWeight: 700, mb: 1 }}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </CardContent>
      </Card>
    </Zoom>
  );

  // Wait for AuthContext to finish loading
  if (loading) {
    return (
      <ThemeProvider theme={businessAdminTheme}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          sx={{ bgcolor: 'background.default' }}
        >
          <Stack spacing={2} alignItems="center">
            <CircularProgress size={64} />
            <Typography variant="h6" color="text.secondary">
              Loading...
            </Typography>
          </Stack>
        </Box>
      </ThemeProvider>
    );
  }

  if (!user || !['business_admin', 'manager'].includes(user.role)) {
    return (
      <ThemeProvider theme={businessAdminTheme}>
        <Container maxWidth="lg" sx={{ mt: 3 }}>
          <Alert severity="error">
            Access denied. Only business admins and managers can view this page.
          </Alert>
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={businessAdminTheme}>
      <Box sx={{ 
        minHeight: '100vh', 
        bgcolor: 'background.default',
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
                  variant="h4" 
                  component="h1" 
                  gutterBottom
                  sx={{ fontWeight: 700, color: 'text.primary' }}
                >
                  Customer Database
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Manage and view all customers in your system
                </Typography>
              </Box>
              <Stack direction="row" spacing={2} sx={{ flexShrink: 0 }}>
                <Tooltip title="Refresh data">
                  <IconButton onClick={fetchCustomers} color="primary">
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                <Button
                  variant="contained"
                  startIcon={<UploadIcon />}
                  component={Link}
                  href="/business-admin/customers/import-export"
                  sx={{ 
                    display: { xs: 'none', sm: 'flex' },
                    minWidth: 'fit-content'
                  }}
                >
                  Import/Export
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PersonAddIcon />}
                  component={Link}
                  href="/business-admin/customers/add"
                  sx={{ 
                    display: { xs: 'none', sm: 'flex' },
                    minWidth: 'fit-content'
                  }}
                >
                  Add Customer
                </Button>
              </Stack>
            </Box>
            
            {/* Mobile Action Buttons */}
            <Box sx={{ display: { xs: 'flex', sm: 'none' }, gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="small"
                startIcon={<UploadIcon />}
                component={Link}
                href="/business-admin/customers/import-export"
              >
                Import/Export
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<PersonAddIcon />}
                component={Link}
                href="/business-admin/customers/add"
              >
                Add Customer
              </Button>
            </Box>
          </Box>

          {/* Quick Stats */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <StatCard
                title="Total Customers"
                value={customers.length}
                color="primary.main"
              />
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <StatCard
                title="Leads"
                value={customers.filter(c => c.status === 'lead').length}
                color="info.main"
              />
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <StatCard
                title="Prospects"
                value={customers.filter(c => c.status === 'prospect').length}
                color="warning.main"
              />
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <StatCard
                title="Active Customers"
                value={customers.filter(c => c.status === 'customer').length}
                color="success.main"
              />
            </Box>
          </Box>

          {/* Main Content Card */}
          <Card elevation={2}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              {/* Header with actions */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: 'space-between',
                gap: 2,
                mb: 3
              }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Customers
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total: {customers.length} customers
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<FileDownloadIcon />}
                    onClick={handleQuickExportCSV}
                  >
                    Export CSV
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<CodeIcon />}
                    onClick={handleQuickExportJSON}
                  >
                    Export JSON
                  </Button>
                </Stack>
              </Box>

              {/* Search and Filter */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                mb: 3
              }}>
                <TextField
                  fullWidth
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  sx={{ minWidth: { sm: 300 } }}
                />
                <FormControl sx={{ minWidth: { xs: '100%', sm: 200 } }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    label="Status"
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="lead">Lead</MenuItem>
                    <MenuItem value="prospect">Prospect</MenuItem>
                    <MenuItem value="customer">Customer</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Customers Table */}
              {dataLoading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Loading customers...
                  </Typography>
                </Box>
              ) : filteredCustomers.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <PeopleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    {searchTerm || filterStatus !== 'all' 
                      ? 'No customers match your search criteria' 
                      : 'No customers found'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {searchTerm || filterStatus !== 'all' 
                      ? 'Try adjusting your search or filter criteria' 
                      : 'Add your first customer to get started'}
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredCustomers.map((customer) => (
                        <Fade in={true} key={customer.id}>
                          <TableRow hover>
                            <TableCell>
                              <Box>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                  {customer.name || `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'N/A'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {customer.customer_type || 'Individual'}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box>
                                <Typography variant="body2">
                                  {customer.email}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {customer.phone || 'No phone'}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={customer.status || 'lead'}
                                color={getStatusColor(customer.status) as any}
                                size="small"
                                sx={{ fontWeight: 500 }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {customer.city ? `${customer.city}, ${customer.state || ''}`.trim() : 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {customer.created_at ? new Date(customer.created_at).toLocaleDateString() : 'N/A'}
                              </Typography>
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
        </Container>
      </Box>
    </ThemeProvider>
  );
} 