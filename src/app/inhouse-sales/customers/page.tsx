'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { customersAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  Box,
  Container,
  Typography,
  Button,
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
  Stack,
  Card,
  CardContent,
  useTheme,
  alpha,
  Fade,
  IconButton,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  RestoreFromTrash as TrashIcon,
  LocalOffer as TagIcon
} from '@mui/icons-material';

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[4],
  overflow: 'hidden',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
  '& .MuiTableCell-head': {
    fontWeight: 600,
    textTransform: 'uppercase',
    fontSize: '0.75rem',
    letterSpacing: '0.05em',
    color: alpha(theme.palette.text.primary, 0.7),
  }
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.02),
    transform: 'translateY(-1px)',
    boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.1)}`,
  }
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.1)',
  }
}));

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  customer_type: string;
  city: string;
  total_purchases: number;
  last_purchase_date: string;
  is_active: boolean;
  created_at: string;
  tags: { name: string; slug: string }[];
}

export default function CustomersPage() {
  const theme = useTheme();
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        console.log('=== FETCHING CUSTOMERS ===');
        const data = await customersAPI.getCustomers();
        console.log('Customers data:', data);
        setCustomers(data.results || data || []);
      } catch (err: any) {
        console.error('Error fetching customers:', err);
        setError(err.message || 'Failed to fetch customers');
        toast.error('Failed to load customers');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleViewCustomer = (customerId: number) => {
    console.log('Viewing customer:', customerId);
    // Redirect to customer detail page
    window.location.href = `/inhouse-sales/customers/${customerId}`;
  };

  const handleEditCustomer = (customerId: number) => {
    console.log('Editing customer:', customerId);
    // Redirect to edit page (you'll need to create this page)
    window.location.href = `/inhouse-sales/customers/${customerId}/edit`;
  };

  const handleDeleteCustomer = async (customerId: number, customerName: string) => {
    if (!confirm(`Are you sure you want to delete customer "${customerName}"?`)) {
      return;
    }

    setDeleteLoading(customerId);
    try {
      await customersAPI.deleteCustomer(customerId);
      toast.success(`Customer "${customerName}" deleted successfully`);
      // Refresh the customers list
      const updatedCustomers = customers.filter(c => c.id !== customerId);
      setCustomers(updatedCustomers);
    } catch (err: any) {
      console.error('Error deleting customer:', err);
      toast.error('Failed to delete customer');
    } finally {
      setDeleteLoading(null);
    }
  };

  const getCustomerTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'premium':
        return 'primary';
      case 'regular':
        return 'secondary';
      case 'vip':
        return 'success';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 800, color: 'primary.dark' }}>
            Customers
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your customer relationships and sales pipeline
          </Typography>
        </Box>
        <Card sx={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CardContent>
            <Stack spacing={2} alignItems="center">
              <CircularProgress size={64} />
              <Typography variant="h6" color="primary.main">
                Loading customers...
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 800, color: 'primary.dark' }}>
            Customers
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your customer relationships and sales pipeline
          </Typography>
        </Box>
        <Card sx={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CardContent>
            <Stack spacing={3} alignItems="center">
              <Alert severity="error" sx={{ width: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Error: {error}
                </Typography>
              </Alert>
              <Link href="/inhouse-sales/add-customer" passHref>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  size="large"
                >
                  Add New Customer
                </Button>
              </Link>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Fade in={true} timeout={800}>
        <Box sx={{ mb: 4 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={3}>
            <Box>
              <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 800, color: 'primary.dark' }}>
                Customers
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage your customer relationships and sales pipeline
              </Typography>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
              <Link href="/inhouse-sales/customer-visits" passHref>
                <Button 
                  variant="outlined" 
                  startIcon={<AssignmentIcon />}
                  size="small"
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Customer Visits
                </Button>
              </Link>
              <Link href="/inhouse-sales/customer-profiles" passHref>
                <Button 
                  variant="outlined" 
                  color="secondary"
                  startIcon={<PersonIcon />}
                  size="small"
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Customer Profiles
                </Button>
              </Link>
              <Link href="/inhouse-sales/customers/trash" passHref>
                <Button 
                  variant="outlined" 
                  color="error"
                  startIcon={<TrashIcon />}
                  size="small"
                  sx={{ justifyContent: 'flex-start' }}
                >
                  View Trash
                </Button>
              </Link>
              <Link href="/inhouse-sales/add-customer" passHref>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  size="small"
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Add New Customer
                </Button>
              </Link>
            </Stack>
          </Stack>
        </Box>
      </Fade>

      {customers.length === 0 ? (
        <Fade in={true} timeout={1000}>
          <Card sx={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CardContent>
              <Stack spacing={3} alignItems="center">
                <Typography variant="h6" color="primary.main">
                  No customers found
                </Typography>
                <Link href="/inhouse-sales/add-customer" passHref>
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    size="large"
                  >
                    Add New Customer
                  </Button>
                </Link>
              </Stack>
            </CardContent>
          </Card>
        </Fade>
      ) : (
        <Fade in={true} timeout={1000} style={{ transitionDelay: '200ms' }}>
          <StyledTableContainer component={Paper}>
            <Table>
              <StyledTableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>City</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Tags</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </StyledTableHead>
              <TableBody>
                {customers.map((customer) => (
                  <StyledTableRow key={customer.id}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {customer.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {customer.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {customer.phone}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={customer.customer_type}
                        color={getCustomerTypeColor(customer.customer_type) as any}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {customer.city}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(customer.created_at).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {customer.tags && customer.tags.length > 0 ? (
                          customer.tags.map((tag: any) => (
                            <Chip
                              key={tag.slug}
                              label={tag.name}
                              size="small"
                              color="success"
                              variant="outlined"
                              icon={<TagIcon />}
                            />
                          ))
                        ) : (
                          <Typography variant="caption" color="text.disabled">
                            No tags
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <Tooltip title="View Customer">
                          <ActionButton 
                            onClick={() => handleViewCustomer(customer.id)}
                            color="primary"
                            size="small"
                          >
                            <VisibilityIcon fontSize="small" />
                          </ActionButton>
                        </Tooltip>
                        <Tooltip title="Edit Customer">
                          <ActionButton 
                            onClick={() => handleEditCustomer(customer.id)}
                            color="success"
                            size="small"
                          >
                            <EditIcon fontSize="small" />
                          </ActionButton>
                        </Tooltip>
                        <Tooltip title="Move to Trash">
                          <ActionButton 
                            onClick={() => handleDeleteCustomer(customer.id, customer.name)}
                            disabled={deleteLoading === customer.id}
                            color="error"
                            size="small"
                          >
                            {deleteLoading === customer.id ? (
                              <CircularProgress size={16} />
                            ) : (
                              <DeleteIcon fontSize="small" />
                            )}
                          </ActionButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </StyledTableContainer>
        </Fade>
      )}
    </Container>
  );
} 