'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { customersAPI, purchasesAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Stack,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Collapse,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Fade,
  Zoom
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Diamond as DiamondIcon,
  TrendingUp as TrendingUpIcon,
  History as HistoryIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  LocalOffer as TagIcon,
  ShoppingBag as ShoppingBagIcon,
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

const SectionCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(1.5),
  border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
}));

const InfoRow = ({ label, value, chip = false, chipColor = 'primary' }: {
  label: string;
  value: string | null | undefined;
  chip?: boolean;
  chipColor?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
}) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
      {label}
    </Typography>
    {chip ? (
      <Box sx={{ mt: 0.5 }}>
        <Chip label={value || 'Not specified'} color={chipColor} variant="outlined" size="small" />
      </Box>
    ) : (
      <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
        {value || 'Not specified'}
      </Typography>
    )}
  </Box>
);

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

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  customer_type: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  date_of_birth: string;
  anniversary_date: string;
  notes: string;
  preferred_metal: string;
  preferred_stone: string;
  ring_size: string;
  budget_range: string;
  community: string;
  lead_source: string;
  reason_for_visit: string;
  age_of_end_user: string;
  next_follow_up: string;
  summary_notes: string;
  customer_interests: any[];
  created_at: string;
  updated_at: string;
  tags: any[];
}

interface Purchase {
  id: number;
  product_name: string;
  amount: number;
  purchase_date: string;
  notes: string;
}

interface AuditLog {
  id: number;
  action: string;
  user: string;
  timestamp: string;
  before: any;
  after: any;
}

export default function CustomerDetailPage() {
  const theme = useTheme();
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(true);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingAuditLogs, setLoadingAuditLogs] = useState(true);
  const [expandedInterest, setExpandedInterest] = useState<number | null>(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const data = await customersAPI.getCustomer(parseInt(customerId));
        setCustomer(data);
      } catch (err: any) {
        console.error('Error fetching customer:', err);
        setError(err.message || 'Failed to fetch customer');
        toast.error('Failed to load customer details');
      } finally {
        setLoading(false);
      }
    };

    const fetchPurchases = async () => {
      try {
        const data = await purchasesAPI.getPurchases({ client: customerId });
        setPurchases(Array.isArray(data) ? data : (data && Array.isArray(data.results) ? data.results : []));
      } catch (err: any) {
        setPurchases([]);
      } finally {
        setLoadingPurchases(false);
      }
    };

    const fetchAuditLogs = async () => {
      try {
        const data = await customersAPI.getAuditLogsForCustomer(Number(customerId));
        setAuditLogs(data.results || data || []);
      } catch (err: any) {
        setAuditLogs([]);
      } finally {
        setLoadingAuditLogs(false);
      }
    };

    // Only fetch if customerId is a valid number
    if (customerId && !isNaN(Number(customerId)) && Number.isFinite(Number(customerId))) {
      fetchCustomer();
      fetchPurchases();
      fetchAuditLogs();
    } else {
      setError('Invalid customer ID');
      setLoading(false);
      setLoadingPurchases(false);
    }
  }, [customerId]);

  const handleDelete = async () => {
    if (!customer) return;
    
    if (!confirm(`Are you sure you want to delete customer "${customer.name}"?`)) {
      return;
    }

    try {
      await customersAPI.deleteCustomer(customer.id);
      toast.success(`Customer "${customer.name}" deleted successfully`);
      router.push('/inhouse-sales/customers');
    } catch (err: any) {
      console.error('Error deleting customer:', err);
      toast.error('Failed to delete customer');
    }
  };

  const getCustomerTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'premium': return 'primary';
      case 'vip': return 'success';
      case 'regular': return 'secondary';
      default: return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <StyledCard sx={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CardContent>
            <Stack spacing={2} alignItems="center">
              <CircularProgress size={64} />
              <Typography variant="h6" color="primary.main">
                Loading customer details...
              </Typography>
            </Stack>
          </CardContent>
        </StyledCard>
      </Container>
    );
  }

  if (error || !customer) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <StyledCard sx={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CardContent>
            <Stack spacing={3} alignItems="center">
              <Alert severity="error" sx={{ width: '100%' }}>
                <Typography variant="h6">
            {error || 'Customer not found'}
                </Typography>
              </Alert>
              <Link href="/inhouse-sales/customers" passHref>
                <Button 
                  variant="contained" 
                  startIcon={<ArrowBackIcon />}
                  size="large"
                >
              Back to Customers
                </Button>
          </Link>
            </Stack>
          </CardContent>
        </StyledCard>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section */}
      <Fade in={true} timeout={800}>
        <Box sx={{ mb: 4 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={3}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 800, color: 'primary.dark' }}>
                Customer Details
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                View and manage customer information
              </Typography>
              
              {/* Tags */}
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {customer.tags && customer.tags.length > 0 ? (
              customer.tags.map((tag: any) => (
                    <Chip
                      key={tag.slug}
                      label={tag.name}
                      color="success"
                      variant="outlined"
                      size="small"
                      icon={<TagIcon />}
                    />
              ))
            ) : (
                  <Typography variant="caption" color="text.disabled">
                    No tags assigned
                  </Typography>
                )}
              </Box>
            </Box>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
              <Link href={`/inhouse-sales/customers/${customer.id}/edit`} passHref>
                <Button 
                  variant="contained" 
                  color="success"
                  startIcon={<EditIcon />}
                  sx={{ justifyContent: 'flex-start' }}
                >
              Edit Customer
                </Button>
          </Link>
              <Button 
            onClick={handleDelete}
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                sx={{ justifyContent: 'flex-start' }}
          >
            Delete Customer
              </Button>
              <Link href="/inhouse-sales/customers" passHref>
                <Button 
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  sx={{ justifyContent: 'flex-start' }}
                >
              Back to Customers
                </Button>
          </Link>
            </Stack>
          </Stack>
        </Box>
      </Fade>

      <StyledCard>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          {/* Main Information Grid */}
          <Grid container spacing={4}>
            {/* Basic Information */}
            <Grid item xs={12} md={6}>
              <SectionCard>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                    <PersonIcon color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Basic Information
                    </Typography>
                  </Stack>
                  <InfoRow label="Full Name" value={customer.name} />
                  <InfoRow label="Email" value={customer.email} />
                  <InfoRow label="Phone" value={customer.phone} />
                  <InfoRow 
                    label="Customer Type" 
                    value={customer.customer_type} 
                    chip 
                    chipColor={getCustomerTypeColor(customer.customer_type) as any}
                  />
                </CardContent>
              </SectionCard>
            </Grid>

            {/* Address Information */}
            <Grid item xs={12} md={6}>
              <SectionCard>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                    <HomeIcon color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Address
                    </Typography>
                  </Stack>
                  <InfoRow label="Address" value={customer.address} />
                  <InfoRow label="City" value={customer.city} />
                  <InfoRow label="State" value={customer.state} />
                  <InfoRow label="Country" value={customer.country} />
                </CardContent>
              </SectionCard>
            </Grid>

            {/* Jewelry Preferences */}
            <Grid item xs={12} md={6}>
              <SectionCard>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                    <DiamondIcon color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Jewelry Preferences
                    </Typography>
                  </Stack>
                  <InfoRow label="Preferred Metal" value={customer.preferred_metal} />
                  <InfoRow label="Preferred Stone" value={customer.preferred_stone} />
                  <InfoRow label="Ring Size" value={customer.ring_size} />
                  <InfoRow label="Budget Range" value={customer.budget_range} />
                </CardContent>
              </SectionCard>
            </Grid>

            {/* Demographics & Visit */}
            <Grid item xs={12} md={6}>
              <SectionCard>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                    <TrendingUpIcon color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Demographics & Visit
                    </Typography>
                  </Stack>
                  <InfoRow label="Community" value={customer.community} />
                  <InfoRow label="Lead Source" value={customer.lead_source} />
                  <InfoRow label="Reason for Visit" value={customer.reason_for_visit} />
                  <InfoRow label="Age of End User" value={customer.age_of_end_user} />
                </CardContent>
              </SectionCard>
            </Grid>
          </Grid>

          {/* Notes and Follow-up */}
          <Box sx={{ mt: 4 }}>
            <SectionCard>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Notes & Follow-up
                </Typography>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <InfoRow label="Notes" value={customer.notes} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <InfoRow label="Next Follow-up" value={customer.next_follow_up} />
                  </Grid>
                </Grid>
              </CardContent>
            </SectionCard>
          </Box>

          {/* Customer Interests */}
          {customer.customer_interests && customer.customer_interests.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <SectionCard>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Customer Interests
                  </Typography>
                  <Stack spacing={2}>
                {customer.customer_interests.map((interest, index) => (
                      <Card key={index} variant="outlined" sx={{ border: 1, borderColor: 'divider' }}>
                        <CardContent>
                          <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              Interest #{index + 1}
                            </Typography>
                            <IconButton
                              onClick={() => setExpandedInterest(expandedInterest === index ? null : index)}
                              size="small"
                            >
                              {expandedInterest === index ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                          </Stack>
                          
                          <Collapse in={expandedInterest === index}>
                            <Box sx={{ mt: 2 }}>
                              <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                  <InfoRow label="Main Category" value={interest.mainCategory} />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                                      Preferences
                                    </Typography>
                                    <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                                      {interest.preferences?.designSelected && (
                                        <Chip label="Design Selected" size="small" color="success" variant="outlined" />
                                      )}
                                      {interest.preferences?.wantsDiscount && (
                                        <Chip label="Wants More Discount" size="small" color="warning" variant="outlined" />
                                      )}
                                      {interest.preferences?.checkingOthers && (
                                        <Chip label="Checking Other Jewellers" size="small" color="info" variant="outlined" />
                                      )}
                                      {interest.preferences?.lessVariety && (
                                        <Chip label="Felt Less Variety" size="small" color="error" variant="outlined" />
                                      )}
                                    </Stack>
                                  </Box>
                                </Grid>
                              </Grid>
                              
                    {interest.products && interest.products.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                                    Products
                                  </Typography>
                                  <List dense sx={{ mt: 0.5 }}>
                          {interest.products.map((prod: any, pidx: number) => (
                                      <ListItem key={pidx} sx={{ px: 0 }}>
                                        <ListItemText
                                          primary={prod.product}
                                          secondary={prod.revenue ? `Revenue: ${formatCurrency(prod.revenue)}` : undefined}
                                        />
                                      </ListItem>
                                    ))}
                                  </List>
                                </Box>
                              )}
                              
                    {interest.other && (
                                <Box sx={{ mt: 2 }}>
                                  <InfoRow label="Other Preferences" value={interest.other} />
                                </Box>
                              )}
                            </Box>
                          </Collapse>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                </CardContent>
              </SectionCard>
            </Box>
          )}

          {/* Purchase History */}
          <Box sx={{ mt: 4 }}>
            <SectionCard>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                  <ShoppingBagIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Purchase History
                  </Typography>
                </Stack>
                
              {loadingPurchases ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
              ) : purchases.length === 0 ? (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No purchases found for this customer.
                  </Typography>
                ) : (
                  <StyledTable component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Product</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Notes</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                    {purchases.map((purchase) => (
                          <TableRow key={purchase.id}>
                            <TableCell>{purchase.product_name}</TableCell>
                            <TableCell>{formatCurrency(purchase.amount)}</TableCell>
                            <TableCell>{new Date(purchase.purchase_date).toLocaleDateString()}</TableCell>
                            <TableCell>{purchase.notes || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </StyledTable>
                )}
              </CardContent>
            </SectionCard>
          </Box>

          {/* Audit Log */}
          <Box sx={{ mt: 4 }}>
            <Divider sx={{ mb: 3 }} />
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
              <HistoryIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Audit Log
              </Typography>
            </Stack>
            
            {loadingAuditLogs ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : auditLogs.length === 0 ? (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No audit logs found for this customer.
              </Typography>
            ) : (
              <StyledTable component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Action</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Changes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                  {auditLogs.map((log) => {
                    const before = log.before || {};
                    const after = log.after || {};
                    const allKeys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)]));
                      const changedKeys = allKeys.filter(key => before[key] !== after[key]);
                      
                    return (
                        <TableRow key={log.id}>
                          <TableCell>
                            <Chip label={log.action} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell>{log.user}</TableCell>
                          <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                          <TableCell>
                          {changedKeys.length === 0 ? (
                              <Typography variant="body2" color="text.disabled">-</Typography>
                            ) : (
                              <Box sx={{ maxWidth: 400 }}>
                                {changedKeys.slice(0, 3).map((key) => (
                                  <Box key={key} sx={{ mb: 0.5 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                      {key.replace(/_/g, ' ')}:
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                      {String(before[key] || '-')} → {String(after[key] || '-')}
                                    </Typography>
                                  </Box>
                                ))}
                                {changedKeys.length > 3 && (
                                  <Typography variant="caption" color="text.disabled">
                                    +{changedKeys.length - 3} more changes
                                  </Typography>
                                )}
                              </Box>
                            )}
                          </TableCell>
                        </TableRow>
                    );
                  })}
                  </TableBody>
                </Table>
              </StyledTable>
            )}
          </Box>

          {/* Timestamps */}
          <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <InfoRow 
                  label="Created" 
                  value={new Date(customer.created_at).toLocaleString()} 
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <InfoRow 
                  label="Last Updated" 
                  value={new Date(customer.updated_at).toLocaleString()} 
                />
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </StyledCard>
    </Container>
  );
} 