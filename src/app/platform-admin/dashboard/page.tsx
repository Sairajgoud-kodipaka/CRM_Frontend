'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { tenantsAPI } from '@/lib/api';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Skeleton, 
  Button, 
  Chip, 
  List, 
  ListItem, 
  ListItemText, 
  Divider 
} from '@mui/material';
import toast from 'react-hot-toast';

const DashboardSkeleton = () => (
    <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
            <Skeleton variant="text" width={400} height={50} />
            <Skeleton variant="text" width={300} height={20} />
        </Box>
        <Grid container spacing={3} sx={{ mb: 4 }}>
            {[...Array(4)].map((_, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                    <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
                </Grid>
            ))}
        </Grid>
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2, mb: 4 }} />
        <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
    </Container>
);

export default function PlatformAdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tenants, setTenants] = useState([]);
  const [loadingTenants, setLoadingTenants] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (user.role !== 'platform_admin') {
        router.replace('/platform-admin/dashboard');
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchTenants = async () => {
      setLoadingTenants(true);
      const loadingToast = toast.loading('Loading platform data...');
      try {
        const data = await tenantsAPI.getTenants();
        setTenants(data.results || data || []);
        toast.success('Platform data loaded!', { id: loadingToast });
      } catch (error: any) {
        toast.error('Failed to load platform data.', { id: loadingToast });
      } finally {
        setLoadingTenants(false);
      }
    };
    fetchTenants();
  }, []);

  if (loading || loadingTenants) {
    return <DashboardSkeleton />;
  }
  if (!user || user.role !== 'platform_admin') {
    return null;
  }

  const totalTenants = tenants.length;
  const activeTenants = tenants.filter((tenant: any) => tenant.subscription_status === 'active').length;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>Platform Dashboard</Typography>
        <Typography color="text.secondary">Overview of all CRM deployments and system health</Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 'medium', color: 'text.secondary' }}>Total CRMs Deployed</Typography>
              <Typography variant="h4" component="p" sx={{ fontWeight: 'bold', color: 'text.primary' }}>{loadingTenants ? '...' : totalTenants}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 'medium', color: 'text.secondary' }}>Active Subscriptions</Typography>
              <Typography variant="h4" component="p" sx={{ fontWeight: 'bold', color: 'text.primary' }}>{loadingTenants ? '...' : activeTenants}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 'medium', color: 'text.secondary' }}>System Uptime</Typography>
              <Typography variant="h4" component="p" sx={{ fontWeight: 'bold', color: 'text.primary' }}>99.9%</Typography>
              <Typography variant="body2" sx={{ color: 'text.success' }}>Last 30 days</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 'medium', color: 'text.secondary' }}>Support Tickets</Typography>
              <Typography variant="h4" component="p" sx={{ fontWeight: 'bold', color: 'text.primary' }}>0</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Tenants */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="h3" sx={{ fontWeight: 'medium', color: 'text.primary' }}>Recent Deployments</Typography>
            <Button
              variant="contained"
              color="primary"
              size="small"
              LinkComponent={Link}
              href="/platform-admin/deploy-crm"
            >
              Deploy New CRM
            </Button>
          </Box>
          {loadingTenants ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <Skeleton variant="rectangular" height={50} width={200} sx={{ borderRadius: 2 }} />
            </Box>
          ) : tenants.length > 0 ? (
            <List>
              {tenants.slice(0, 5).map((tenant: any) => (
                <ListItem key={tenant.id} sx={{ py: 1.5 }}>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" component="h4" sx={{ fontWeight: 'medium', color: 'text.primary' }}>
                        {tenant.name}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>{tenant.business_type || 'Jewelry Business'}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.hint' }}>Created {new Date(tenant.created_at).toLocaleDateString()}</Typography>
                      </>
                    }
                  />
                  <Chip
                    label={tenant.subscription_status}
                    size="small"
                    sx={{
                      backgroundColor: tenant.subscription_status === 'active' ? 'success.light' : 'warning.light',
                      color: tenant.subscription_status === 'active' ? 'success.dark' : 'warning.dark',
                    }}
                  />
                  <Button
                    size="small"
                    color="primary"
                    LinkComponent={Link}
                    href={`/platform-admin/tenants/${tenant.id}`}
                  >
                    View
                  </Button>
                </ListItem>
              ))}
              {tenants.length > 5 && (
                <ListItem sx={{ py: 1.5 }}>
                  <Button
                    variant="text"
                    color="primary"
                    LinkComponent={Link}
                    href="/platform-admin/tenants"
                  >
                    View all {totalTenants} tenants →
                  </Button>
                </ListItem>
              )}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="body2" sx={{ color: 'text.hint' }}>No tenants deployed yet</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>Deploy your first CRM to get started</Typography>
              <Button
                variant="contained"
                color="primary"
                size="small"
                LinkComponent={Link}
                href="/platform-admin/deploy-crm"
                sx={{ mt: 2 }}
              >
                Deploy First CRM
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent>
          <Typography variant="h6" component="h3" sx={{ fontWeight: 'medium', color: 'text.primary' }}>Quick Actions</Typography>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Card sx={{ height: '100%', textAlign: 'center' }}>
                <CardContent>
                  <Typography variant="h6" component="h4" sx={{ fontWeight: 'medium', color: 'text.primary' }}>Deploy New CRM</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Create a new CRM instance</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ height: '100%', textAlign: 'center' }}>
                <CardContent>
                  <Typography variant="h6" component="h4" sx={{ fontWeight: 'medium', color: 'text.primary' }}>View Analytics</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Platform usage statistics</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ height: '100%', textAlign: 'center' }}>
                <CardContent>
                  <Typography variant="h6" component="h4" sx={{ fontWeight: 'medium', color: 'text.primary' }}>Support</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Manage support tickets</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
} 