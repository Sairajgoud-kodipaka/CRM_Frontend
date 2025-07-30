'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  AlertTitle,
  CircularProgress,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Container,
  useTheme,
  useMediaQuery,
  Stack,
  IconButton,
  Tooltip,
  Fade,
  Zoom,
  ThemeProvider
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Group as GroupIcon,
  Visibility as VisibilityIcon,
  ShoppingCart as ShoppingCartIcon,
  ArrowForward as ArrowForwardIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { businessAdminTheme } from '@/lib/theme';

interface DashboardData {
  metrics: {
    total_sales: number;
    sales_count: number;
    active_customers: number;
    total_products: number;
    team_members: number;
    sales_growth: number;
  };
  pipeline: {
    leads: number;
    qualified: number;
    proposals: number;
    negotiations: number;
    closed: number;
  };
  recent_sales: Array<{
    id: number;
    client_name: string;
    amount: number;
    status: string;
    date: string;
    items_count: number;
  }>;
  recent_activities: Array<{
    type: string;
    title: string;
    description: string;
    date: string;
    amount: number | null;
  }>;
  period: {
    start_date: string;
    end_date: string;
  };
}

export default function BusinessAdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (user.role !== 'business_admin') {
        router.replace('/business-admin/dashboard');
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || user.role !== 'business_admin') return;
      
      try {
        setLoadingData(true);
        setError(null);
        
        const response = await api.get('/business-admin/dashboard/');
        setDashboardData(response.data);
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.detail || 'Failed to load dashboard data');
      } finally {
        setLoadingData(false);
      }
    };

    if (user && user.role === 'business_admin') {
      fetchDashboardData();
    }
  }, [user]);

  const handleRefresh = () => {
    if (user && user.role === 'business_admin') {
      setLoadingData(true);
      api.get('/business-admin/dashboard/')
        .then(response => setDashboardData(response.data))
        .catch(err => setError(err.response?.data?.detail || 'Failed to refresh data'))
        .finally(() => setLoadingData(false));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'sale':
        return 'success.main';
      case 'pipeline':
        return 'primary.main';
      default:
        return 'grey.400';
    }
  };

  const MetricCard = ({ 
    title, 
    value, 
    subtitle, 
    icon, 
    color = 'primary',
    growth 
  }: {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ReactNode;
    color?: string;
    growth?: number;
  }) => (
    <Zoom in={true} style={{ transitionDelay: '100ms' }}>
      <Card 
        elevation={2}
        sx={{ 
          height: '100%',
          transition: 'all 0.3s ease',
          '&:hover': {
            elevation: 4,
            transform: 'translateY(-2px)',
          }
        }}
      >
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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
            {growth && growth > 0 && (
              <Chip 
                label={`+${growth}%`} 
                color="success" 
                size="small" 
                sx={{ fontWeight: 600 }}
              />
            )}
          </Box>
        </CardContent>
      </Card>
    </Zoom>
  );

  const PipelineCard = ({ 
    title, 
    value, 
    subtitle, 
    color 
  }: {
    title: string;
    value: string;
    subtitle: string;
    color: string;
  }) => (
    <Fade in={true} timeout={800}>
      <Card 
        elevation={1}
        sx={{ 
          height: '100%',
          textAlign: 'center',
          transition: 'all 0.3s ease',
          '&:hover': {
            elevation: 3,
            transform: 'scale(1.02)',
          }
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ color, fontWeight: 600 }} gutterBottom>
            {title}
          </Typography>
          <Typography variant="h3" component="div" gutterBottom sx={{ fontWeight: 700 }}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        </CardContent>
      </Card>
    </Fade>
  );

  const DashboardContent = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    return (
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
                  variant={isMobile ? "h5" : "h4"} 
                  component="h1" 
                  gutterBottom
                  sx={{ fontWeight: 700, color: 'text.primary' }}
                >
                  Business Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Overview of your jewelry business performance and operations
                  {dashboardData && dashboardData.period && (
                    <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      ({dashboardData.period.start_date} to {dashboardData.period.end_date})
                    </Typography>
                  )}
                </Typography>
              </Box>
              <Stack direction="row" spacing={2} sx={{ flexShrink: 0 }}>
                <Tooltip title="Refresh data">
                  <IconButton onClick={handleRefresh} color="primary">
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                <Button
                  variant="contained"
                  startIcon={<VisibilityIcon />}
                  onClick={() => router.push('/business-admin/pipeline')}
                  sx={{ 
                    display: { xs: 'none', sm: 'flex' },
                    minWidth: 'fit-content'
                  }}
                >
                  View Pipeline
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ShoppingCartIcon />}
                  onClick={() => router.push('/business-admin/catalogue')}
                  sx={{ 
                    display: { xs: 'none', sm: 'flex' },
                    minWidth: 'fit-content'
                  }}
                >
                  Manage Products
                </Button>
              </Stack>
            </Box>
            
            {/* Mobile Action Buttons */}
            <Box sx={{ display: { xs: 'flex', sm: 'none' }, gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="small"
                startIcon={<VisibilityIcon />}
                onClick={() => router.push('/business-admin/pipeline')}
              >
                Pipeline
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ShoppingCartIcon />}
                onClick={() => router.push('/business-admin/catalogue')}
              >
                Products
              </Button>
            </Box>
          </Box>

          {/* Key Metrics */}
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { 
              xs: '1fr',
              sm: 'repeat(2, 1fr)', 
              lg: 'repeat(4, 1fr)'
            },
            gap: 3,
            mb: 4 
          }}>
            <MetricCard
              title="Total Sales"
              value={dashboardData && dashboardData.metrics ? formatCurrency(dashboardData.metrics.total_sales) : '₹0'}
              subtitle={`${dashboardData && dashboardData.metrics ? dashboardData.metrics.sales_count : 0} sales`}
              icon={<TrendingUpIcon />}
              color="success"
              growth={dashboardData?.metrics?.sales_growth}
            />
            
            <MetricCard
              title="Active Customers"
              value={dashboardData && dashboardData.metrics ? formatNumber(dashboardData.metrics.active_customers) : '0'}
              subtitle="Customers with recent activity"
              icon={<PeopleIcon />}
              color="info"
            />
            
            <MetricCard
              title="Products"
              value={dashboardData && dashboardData.metrics ? formatNumber(dashboardData.metrics.total_products) : '0'}
              subtitle="Total products in catalog"
              icon={<InventoryIcon />}
              color="warning"
            />
            
            <MetricCard
              title="Team Members"
              value={dashboardData && dashboardData.metrics ? formatNumber(dashboardData.metrics.team_members) : '0'}
              subtitle="Active team members"
              icon={<GroupIcon />}
              color="primary"
            />
          </Box>

          {/* Sales Pipeline */}
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { 
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(4, 1fr)', 
              md: 'repeat(5, 1fr)'
            },
            gap: 2,
            mb: 4 
          }}>
            <PipelineCard
              title="Leads"
              value={dashboardData && dashboardData.pipeline ? formatNumber(dashboardData.pipeline.leads) : '0'}
              subtitle={dashboardData && dashboardData.pipeline && dashboardData.pipeline.leads > 0 ? 'Active leads' : 'No leads'}
              color="primary.main"
            />
            
            <PipelineCard
              title="Qualified"
              value={dashboardData && dashboardData.pipeline ? formatNumber(dashboardData.pipeline.qualified) : '0'}
              subtitle={dashboardData && dashboardData.pipeline && dashboardData.pipeline.qualified > 0 ? 'Qualified leads' : 'No qualified leads'}
              color="warning.main"
            />
            
            <PipelineCard
              title="Proposals"
              value={dashboardData && dashboardData.pipeline ? formatNumber(dashboardData.pipeline.proposals) : '0'}
              subtitle={dashboardData && dashboardData.pipeline && dashboardData.pipeline.proposals > 0 ? 'Active proposals' : 'No proposals'}
              color="orange.main"
            />
            
            <PipelineCard
              title="Negotiations"
              value={dashboardData && dashboardData.pipeline ? formatNumber(dashboardData.pipeline.negotiations) : '0'}
              subtitle={dashboardData && dashboardData.pipeline && dashboardData.pipeline.negotiations > 0 ? 'In negotiations' : 'No negotiations'}
              color="purple.main"
            />
            
            <Box sx={{ gridColumn: { xs: 'span 2', sm: 'span 4', md: 'span 1' } }}>
              <PipelineCard
                title="Closed"
                value={dashboardData && dashboardData.pipeline ? formatNumber(dashboardData.pipeline.closed) : '0'}
                subtitle={dashboardData && dashboardData.pipeline && dashboardData.pipeline.closed > 0 ? 'Closed deals' : 'No closed deals'}
                color="success.main"
              />
            </Box>
          </Box>

          {/* Recent Activity */}
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' },
            gap: 3 
          }}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Recent Sales
                  </Typography>
                  <Button
                    size="small"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => router.push('/business-admin/pipeline')}
                  >
                    View All
                  </Button>
                </Box>
                <Divider sx={{ mb: 2 }} />
                {dashboardData && dashboardData.recent_sales && dashboardData.recent_sales.length > 0 ? (
                  <List sx={{ p: 0 }}>
                    {dashboardData.recent_sales.map((sale, index) => (
                      <ListItem 
                        key={sale.id} 
                        divider={index < dashboardData.recent_sales.length - 1}
                        sx={{ px: 0 }}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {sale.client_name}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary">
                              {sale.items_count} item{sale.items_count !== 1 ? 's' : ''} • {sale.date}
                            </Typography>
                          }
                        />
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.main' }}>
                            ₹{sale.amount.toLocaleString()}
                          </Typography>
                          <Chip 
                            label={sale.status} 
                            size="small"
                            color={getStatusColor(sale.status)}
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      No recent sales
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
            
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Recent Activity
                  </Typography>
                  <Button
                    size="small"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => router.push('/business-admin/analytics')}
                  >
                    View All
                  </Button>
                </Box>
                <Divider sx={{ mb: 2 }} />
                {dashboardData && dashboardData.recent_activities && dashboardData.recent_activities.length > 0 ? (
                  <List sx={{ p: 0 }}>
                    {dashboardData.recent_activities.map((activity, index) => (
                      <ListItem 
                        key={index} 
                        divider={index < dashboardData.recent_activities.length - 1}
                        sx={{ px: 0 }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: getActivityColor(activity.type),
                              mt: 1,
                              mr: 2,
                              flexShrink: 0
                            }}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {activity.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {activity.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {activity.date}
                            </Typography>
                          </Box>
                          {activity.amount && (
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {formatCurrency(activity.amount)}
                            </Typography>
                          )}
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No recent activity
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Activity will appear here once the system is in use
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </Container>
      </Box>
    );
  };

  if (loading || loadingData) {
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
              Loading dashboard...
            </Typography>
          </Stack>
        </Box>
      </ThemeProvider>
    );
  }

  if (!user || user.role !== 'business_admin') {
    return null;
  }

  if (error) {
    return (
      <ThemeProvider theme={businessAdminTheme}>
        <Container maxWidth="lg" sx={{ mt: 3 }}>
          <Alert 
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={handleRefresh}>
                Retry
              </Button>
            }
          >
            <AlertTitle>Error loading dashboard</AlertTitle>
            {error}
          </Alert>
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={businessAdminTheme}>
      <DashboardContent />
    </ThemeProvider>
  );
} 