'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { customersAPI, analyticsAPI, salesAPI } from '@/lib/api';
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
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Skeleton,
  useTheme,
  alpha,
  Zoom,
  Avatar,
  Chip,
  LinearProgress,
  Paper,
  Alert,
  IconButton,
  Tooltip,
  Badge
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
  Announcement as AnnouncementIcon,
  Visibility as VisibilityIcon,
  PersonAdd as PersonAddIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon,
  TrendingDown as TrendingDownIcon,
  InsertChart as InsertChartIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';

const StyledCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(3),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
    borderColor: alpha(theme.palette.primary.main, 0.2),
  }
}));

const MetricCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
  backdropFilter: 'blur(15px)',
  borderRadius: theme.spacing(2),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
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

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  is_active?: boolean;
  created_at?: string;
  last_interaction?: string;
}

interface DashboardStats {
  total_sales: number;
  active_customers: number;
  total_orders: number;
  total_announcements: number;
  recent_sales: any[];
  sales_trend: any[];
  conversion_rate?: number;
  avg_order_value?: number;
}

export default function InhouseSalesDashboard() {
  const theme = useTheme();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_sales: 0,
    active_customers: 0,
    total_orders: 0,
    total_announcements: 0,
    recent_sales: [],
    sales_trend: [],
    conversion_rate: 0,
    avg_order_value: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (user.role !== 'inhouse_sales') {
        router.replace('/inhouse-sales/dashboard');
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setStatsLoading(true);
      setCustomersLoading(true);
      setDebugInfo('Starting data fetch...');

      try {
        console.log('🔄 Fetching dashboard data...');
        console.log('🔑 Auth token present:', !!localStorage.getItem('access_token'));
        console.log('👤 Current user:', user);
        console.log('🌐 API Base URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api');
        
        // Test individual API calls with detailed logging
        console.log('📊 Calling analyticsAPI.getSimpleDashboardStats()...');
        const statsRes = await analyticsAPI.getSimpleDashboardStats();
        console.log('📊 Stats Response:', JSON.stringify(statsRes, null, 2));
        
        console.log('👥 Calling customersAPI.getCustomers()...');
        const customersRes = await customersAPI.getCustomers({ limit: 5, is_active: true });
        console.log('👥 Customers Response:', JSON.stringify(customersRes, null, 2));
        console.log('👥 Customers Results Array:', customersRes.results);
        console.log('👥 Customers Results Length:', customersRes.results?.length || 0);
        
        setStats(statsRes);
        setCustomers(customersRes.results || []);
        setDebugInfo(`✅ Fetched: ${statsRes.active_customers || 0} customers, ₹${statsRes.total_sales || 0} sales, ${customersRes.results?.length || 0} customer records`);
      } catch (error: any) {
        console.error("❌ Failed to fetch dashboard data", error);
        console.error("❌ Error details:", {
          message: error?.message,
          status: error?.response?.status,
          statusText: error?.response?.statusText,
          data: error?.response?.data,
          url: error?.config?.url,
          method: error?.config?.method
        });
        
        let errorMessage = 'Unknown error';
        if (error?.response?.status === 401) {
          errorMessage = 'Authentication failed - please login again';
        } else if (error?.response?.status === 403) {
          errorMessage = 'Access denied - insufficient permissions';
        } else if (error?.response?.status === 404) {
          errorMessage = 'API endpoint not found';
        } else if (error?.response?.status >= 500) {
          errorMessage = 'Server error - please try again later';
        } else if (error?.message) {
          errorMessage = error.message;
        }
        
        setDebugInfo(`❌ Error: ${errorMessage} (Status: ${error?.response?.status || 'N/A'})`);
        // Ensure customers is always an array even on error
        setCustomers([]);
      } finally {
        setStatsLoading(false);
        setCustomersLoading(false);
      }
    };
    if (user && user.role === 'inhouse_sales') {
      fetchData();
    }
  }, [user]);

  const MetricCardComponent = ({ 
    title, 
    value, 
    subtitle, 
    icon, 
    loading, 
    delay = 0,
    color = 'primary',
    trend,
    progress
  }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ReactNode;
    loading: boolean;
    delay?: number;
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
    trend?: 'up' | 'down' | 'neutral';
    progress?: number;
  }) => (
    <Zoom in={true} style={{ transitionDelay: `${delay}ms` }}>
      <MetricCard>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
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
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {trend === 'up' ? (
                  <TrendingUpIcon color="success" fontSize="small" />
                ) : trend === 'down' ? (
                  <TrendingDownIcon color="error" fontSize="small" />
                ) : (
                  <TimelineIcon color="info" fontSize="small" />
                )}
              </Box>
            )}
          </Stack>
          {loading ? (
            <Box>
              <Skeleton variant="text" width="60%" height={48} />
              <Skeleton variant="text" width="40%" height={24} />
              {progress !== undefined && <Skeleton variant="rectangular" height={8} sx={{ mt: 2, borderRadius: 1 }} />}
            </Box>
          ) : (
            <Box>
              <Typography variant="h3" component="div" sx={{ fontWeight: 800, color: `${color}.dark`, mb: 1 }}>
                {typeof value === 'number' && title === 'Total Sales' 
                  ? `₹${value.toLocaleString()}` 
                  : value}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: progress !== undefined ? 2 : 0 }}>
                {subtitle}
              </Typography>
              {progress !== undefined && (
                <Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={progress} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 1,
                      bgcolor: alpha(theme.palette[color].main, 0.1),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 1,
                        bgcolor: theme.palette[color].main
                      }
                    }} 
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    {progress}% of monthly target
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </MetricCard>
    </Zoom>
  );

  const EmptyStateCard = ({ 
    title, 
    description, 
    actionText, 
    actionHref, 
    icon 
  }: {
    title: string;
    description: string;
    actionText: string;
    actionHref: string;
    icon: React.ReactNode;
  }) => (
    <Paper sx={{ p: 4, textAlign: 'center', bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
      <Box sx={{ 
        p: 2, 
        borderRadius: '50%', 
        bgcolor: alpha(theme.palette.primary.main, 0.1), 
        width: 80, 
        height: 80, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        mx: 'auto',
        mb: 2
      }}>
        {icon}
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'primary.dark' }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {description}
      </Typography>
      <Link href={actionHref} passHref>
        <Button variant="contained" startIcon={<PersonAddIcon />}>
          {actionText}
        </Button>
      </Link>
    </Paper>
  );

  const refreshData = async () => {
    if (!user) return;
    setStatsLoading(true);
    setCustomersLoading(true);
    
    try {
      console.log('🔄 Refreshing dashboard data...');
      const statsRes = await analyticsAPI.getSimpleDashboardStats();
      console.log('📊 Refresh Stats Response:', JSON.stringify(statsRes, null, 2));
      
      const customersRes = await customersAPI.getCustomers({ limit: 5, is_active: true });
      console.log('👥 Refresh Customers Response:', JSON.stringify(customersRes, null, 2));
      
      setStats(statsRes);
      setCustomers(customersRes.results || []);
      setDebugInfo(`🔄 Refreshed: ${statsRes.active_customers || 0} customers, ₹${statsRes.total_sales || 0} sales, ${customersRes.results?.length || 0} records`);
    } catch (error) {
      console.error("Failed to refresh data", error);
      setDebugInfo(`Refresh error: ${String(error)}`);
    } finally {
      setStatsLoading(false);
      setCustomersLoading(false);
    }
  };

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
            Loading dashboard...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (!user || user.role !== 'inhouse_sales') {
    return null;
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
          <Box sx={{ mb: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
            <Box>
            <Typography 
              variant="h3" 
              component="h2" 
              gutterBottom 
              sx={{ 
                fontWeight: 800, 
                color: 'primary.dark',
                textShadow: `0 2px 4px ${alpha(theme.palette.primary.main, 0.1)}`,
                mb: 1
              }}
            >
              In-house Sales Dashboard
            </Typography>
            <Typography 
              variant="h6" 
              color="primary.main" 
                sx={{ fontWeight: 500, mb: 1, opacity: 0.8 }}
            >
              Overview of your in-house sales performance and activity
            </Typography>
              {debugInfo && (
                <Typography variant="caption" color="text.secondary">
                  Debug: {debugInfo}
                </Typography>
              )}
            </Box>
            <Tooltip title="Refresh Data">
              <IconButton onClick={refreshData} disabled={statsLoading || customersLoading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>
          
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Link href="/inhouse-sales/pipeline" passHref>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<VisibilityIcon />}
                  sx={{
                    px: 3,
                    py: 1.5,
                    borderRadius: 2,
                    boxShadow: theme.shadows[4],
                    '&:hover': {
                      boxShadow: theme.shadows[8],
                      transform: 'translateY(-1px)',
                    }
                  }}
                >
              View Pipeline
                </Button>
          </Link>
              <Link href="/inhouse-sales/customers" passHref>
                <Button
                  variant="contained"
                  color="success"
                  size="large"
                  startIcon={<PeopleIcon />}
                  sx={{
                    px: 3,
                    py: 1.5,
                    borderRadius: 2,
                    boxShadow: theme.shadows[4],
                    '&:hover': {
                      boxShadow: theme.shadows[8],
                      transform: 'translateY(-1px)',
                    }
                  }}
                >
              Manage Customers
                </Button>
          </Link>
            <Link href="/inhouse-sales/add-customer" passHref>
              <Button
                variant="outlined"
                size="large"
                startIcon={<PersonAddIcon />}
                sx={{
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  '&:hover': {
                    transform: 'translateY(-1px)',
                  }
                }}
              >
                Add Customer
              </Button>
            </Link>
            </Stack>
          </Box>

      {/* Key Metrics */}
        <FlexGrid container spacing={3} sx={{ mb: 4 }}>
          <FlexGrid xs={12} sm={6} lg={3}>
            <MetricCardComponent
              title="Total Sales"
              value={stats.total_sales}
              subtitle={stats.total_sales > 0 ? 'Total revenue generated' : 'No sales data yet'}
              icon={<AccountBalanceIcon />}
              loading={statsLoading}
              delay={100}
              color="success"
              trend={stats.total_sales > 0 ? 'up' : 'neutral'}
              progress={stats.total_sales > 0 ? Math.min((stats.total_sales / 100000) * 100, 100) : 0}
            />
          </FlexGrid>
          <FlexGrid xs={12} sm={6} lg={3}>
            <MetricCardComponent
              title="Active Customers"
              value={stats.active_customers || (customers?.length || 0)}
              subtitle={(customers?.length || 0) === 0 ? 'Start adding customers' : 'Engaged customers'}
              icon={<PeopleIcon />}
              loading={customersLoading}
              delay={200}
              color="primary"
              trend={(customers?.length || 0) > 0 ? 'up' : 'neutral'}
            />
          </FlexGrid>
          <FlexGrid xs={12} sm={6} lg={3}>
            <MetricCardComponent
              title="Orders"
              value={stats.total_orders}
              subtitle={stats.total_orders > 0 ? 'Orders processed' : 'No orders yet'}
              icon={<ShoppingCartIcon />}
              loading={statsLoading}
              delay={300}
              color="warning"
              trend={stats.total_orders > 0 ? 'up' : 'neutral'}
            />
          </FlexGrid>
          <FlexGrid xs={12} sm={6} lg={3}>
            <MetricCardComponent
              title="Announcements"
              value={stats.total_announcements}
              subtitle={stats.total_announcements > 0 ? 'Active announcements' : 'No announcements'}
              icon={<AnnouncementIcon />}
              loading={statsLoading}
              delay={400}
              color="secondary"
            />
          </FlexGrid>
        </FlexGrid>

                 {/* Quick Actions for Empty States */}
         {!statsLoading && stats.total_sales === 0 && (customers?.length || 0) === 0 && (
           <FlexGrid container spacing={3} sx={{ mb: 4 }}>
             <FlexGrid xs={12} md={6}>
               <EmptyStateCard
                 title="Get Started with Your First Customer"
                 description="Add your first customer to start tracking sales and building your customer base"
                 actionText="Add Customer"
                 actionHref="/inhouse-sales/add-customer"
                 icon={<PersonAddIcon sx={{ fontSize: 40, color: 'primary.main' }} />}
               />
             </FlexGrid>
             <FlexGrid xs={12} md={6}>
               <EmptyStateCard
                 title="Track Your Sales Pipeline"
                 description="Monitor leads and opportunities to boost your sales performance"
                 actionText="View Pipeline"
                 actionHref="/inhouse-sales/pipeline"
                 icon={<AssessmentIcon sx={{ fontSize: 40, color: 'primary.main' }} />}
               />
             </FlexGrid>
           </FlexGrid>
         )}

      {/* Recent Customers */}
          <StyledCard>
            <CardHeader
              title={
                <Stack direction="row" alignItems="center" spacing={2}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.dark' }}>
                  Recent Customers
                </Typography>
                  <Badge badgeContent={customers?.length || 0} color="primary">
                    <PeopleIcon />
                  </Badge>
                </Stack>
              }
              action={
                <Link href="/inhouse-sales/customers" passHref>
                  <Button color="primary" sx={{ fontWeight: 600 }}>
                    View All
                  </Button>
                </Link>
              }
              sx={{ pb: 1 }}
            />
            <CardContent>
        {customersLoading ? (
                <Stack spacing={2}>
            {[1, 2, 3].map((i) => (
                    <Box key={i}>
                      <Skeleton variant="circular" width={40} height={40} sx={{ float: 'left', mr: 2 }} />
                      <Skeleton variant="text" width="60%" height={24} />
                      <Skeleton variant="text" width="40%" height={20} />
                      <Skeleton variant="text" width="25%" height={20} />
                      {i < 3 && <Divider sx={{ my: 2 }} />}
                    </Box>
                  ))}
                </Stack>
              ) : (customers?.length || 0) === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: '50%', 
                    bgcolor: alpha(theme.palette.primary.main, 0.1), 
                    width: 80, 
                    height: 80, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}>
                    <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'primary.dark' }}>
                    No customers yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Start building your customer base by adding your first customer
                  </Typography>
                  <Link href="/inhouse-sales/add-customer" passHref>
                    <Button variant="contained" startIcon={<PersonAddIcon />}>
                      Add Your First Customer
                    </Button>
                  </Link>
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {(customers || []).slice(0, 5).map((customer, index) => (
                    <Box key={customer.id}>
                      <ListItem
                        sx={{
                          px: 0,
                          py: 2,
                          flexDirection: { xs: 'column', md: 'row' },
                          alignItems: { xs: 'flex-start', md: 'center' },
                        }}
                      >
                        <Stack direction="row" spacing={2} sx={{ flex: 1, width: '100%' }}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {customer.name?.charAt(0)?.toUpperCase() || 'C'}
                          </Avatar>
                        <ListItemText
                          primary={
                            <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.dark' }}>
                              {customer.name}
                            </Typography>
                          }
                          secondary={
                            <Stack spacing={0.5}>
                              <Typography variant="body2" color="primary.main">
                                {customer.email}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {customer.phone}
                              </Typography>
                                {customer.is_active && (
                                  <Chip 
                                    label="Active" 
                                    size="small" 
                                    color="success" 
                                    variant="outlined"
                                    sx={{ alignSelf: 'flex-start' }}
                                  />
                                )}
                            </Stack>
                          }
                        />
                        </Stack>
                        <Box sx={{ mt: { xs: 1, md: 0 } }}>
                          <Link href={`/inhouse-sales/customers/${customer.id}`} passHref>
                            <Button size="small" variant="outlined" color="primary" sx={{ fontWeight: 600 }}>
                              View Profile
                            </Button>
                          </Link>
                        </Box>
                      </ListItem>
                      {index < customers.slice(0, 5).length - 1 && (
                        <Divider sx={{ borderColor: alpha(theme.palette.primary.main, 0.1) }} />
                      )}
                    </Box>
                  ))}
                </List>
              )}
            </CardContent>
          </StyledCard>
      </Container>
    </Box>
  );
} 