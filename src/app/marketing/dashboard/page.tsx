'use client';
import { useState, useEffect } from 'react';
import { 
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Button,
  Tabs,
  Tab,
  Chip,
  Skeleton,
  useTheme,
  alpha
} from '@mui/material';
import { 
  TrendingUp, 
  Users, 
  Target, 
  BarChart3,
  Calendar,
  DollarSign,
  Activity,
  Eye
} from 'lucide-react';
import { FlexGrid } from '@/components/ui/FlexGrid';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface CampaignMetrics {
  totalCampaigns: number;
  activeCampaigns: number;
  totalReach: number;
  totalConversions: number;
  conversionRate: number;
  totalRevenue: number;
  roi: number;
}

interface SegmentData {
  segment_name: string;
  customer_count: number;
  growth: number;
  conversion_rate: number;
  revenue: number;
}

interface RealTimeData {
  activeUsers: number;
  recentConversions: number;
  campaignPerformance: Array<{
    name: string;
    impressions: number;
    clicks: number;
    conversions: number;
  }>;
}

const DashboardSkeleton = () => (
    <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
            <Box>
                <Skeleton variant="text" width={400} height={60} />
                <Skeleton variant="text" width={300} height={20} />
            </Box>
            <Skeleton variant="rectangular" width={200} height={40} />
        </Box>
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 3, 
          mb: 4,
          '& > *': { 
            flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' }
          }
        }}>
            {[...Array(4)].map((_, index) => (
                <Skeleton key={index} variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
            ))}
        </Box>
        <Skeleton variant="rectangular" height={40} sx={{ mb: 2, width: 300 }} />
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
    </Container>
);

export default function MarketingDashboard() {
  const [campaignMetrics, setCampaignMetrics] = useState<CampaignMetrics | null>(null);
  const [segmentData, setSegmentData] = useState<SegmentData[]>([]);
  const [realTimeData, setRealTimeData] = useState<RealTimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState('overview');
  const theme = useTheme();

  useEffect(() => {
    const fetchDashboardData = async () => {
        setLoading(true);
        const loadingToast = toast.loading('Fetching marketing data...');
        try {
            const dashboardResponse = await api.get('/marketing/dashboard/');
            setCampaignMetrics(dashboardResponse.data.metrics);
            setSegmentData(dashboardResponse.data.segments);
            setRealTimeData(dashboardResponse.data.realTime);
            toast.success('Dashboard loaded!', { id: loadingToast });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load marketing data.', { id: loadingToast });
        } finally {
            setLoading(false);
        }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>Marketing Dashboard</Typography>
          <Typography color="text.secondary">Monitor your marketing campaigns and performance</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<Calendar />}>
            Last 30 Days
          </Button>
          <Button variant="contained" startIcon={<Activity />}>
            Export Report
          </Button>
        </Box>
      </Box>

      {/* Key Metrics */}
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 3, 
        mb: 4,
        '& > *': { 
          flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' }
        }
      }}>
          <Card>
            <CardHeader
              sx={{
                display: 'flex',
              alignItems: 'center',
                justifyContent: 'space-between',
              p: 2
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>Active Campaigns</Typography>
            <Target style={{ height: 24, width: 24, color: '#757575' }} />
            </CardHeader>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{campaignMetrics?.activeCampaigns || 0}</Typography>
            <Typography variant="body2" color="text.secondary">Running this month</Typography>
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              sx={{
                display: 'flex',
              alignItems: 'center',
                justifyContent: 'space-between',
              p: 2
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>Total Reach</Typography>
            <Eye style={{ height: 24, width: 24, color: '#757575' }} />
            </CardHeader>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{campaignMetrics?.totalReach?.toLocaleString() || '0'}</Typography>
            <Typography variant="body2" color="text.secondary">People reached</Typography>
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              sx={{
                display: 'flex',
              alignItems: 'center',
                justifyContent: 'space-between',
              p: 2
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>Conversions</Typography>
            <TrendingUp style={{ height: 24, width: 24, color: '#757575' }} />
            </CardHeader>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{campaignMetrics?.totalConversions || 0}</Typography>
            <Typography variant="body2" color="text.secondary">{((campaignMetrics?.conversionRate || 0) * 100).toFixed(1)}% rate</Typography>
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              sx={{
                display: 'flex',
              alignItems: 'center',
                justifyContent: 'space-between',
              p: 2
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>Revenue</Typography>
            <DollarSign style={{ height: 24, width: 24, color: '#757575' }} />
            </CardHeader>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>₹{((campaignMetrics?.totalRevenue || 0) / 100000).toFixed(1)}L</Typography>
            <Typography variant="body2" color="text.secondary">ROI: {((campaignMetrics?.roi || 0) * 100).toFixed(0)}%</Typography>
          </CardContent>
        </Card>
      </Box>

        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 3,
          '& > *': { 
            flex: { xs: '1 1 100%', lg: '1 1 calc(50% - 12px)' }
          }
        }}>
            {/* Campaign Performance Chart */}
            <Card>
              <CardHeader>
                <Typography variant="h6" component="h2">Campaign Performance</Typography>
              </CardHeader>
              <CardContent>
                {realTimeData?.campaignPerformance && realTimeData.campaignPerformance.length > 0 ? (
                  <Box sx={{ height: 300 }}>
                    {realTimeData.campaignPerformance.map((campaign, index) => (
                      <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'medium', mb: 1 }}>{campaign.name}</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                          <Typography variant="body2">Impressions: {campaign.impressions?.toLocaleString() || 0}</Typography>
                          <Typography variant="body2">Clicks: {campaign.clicks?.toLocaleString() || 0}</Typography>
                          <Typography variant="body2">Conversions: {campaign.conversions || 0}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">No campaign data available</Typography>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <Typography variant="h6" component="h2">Recent Activity</Typography>
              </CardHeader>
              <CardContent>
                <Typography variant="body1" sx={{ mb: 2, fontWeight: 'medium' }}>Customer Segments Overview</Typography>
                <Box sx={{ height: 300, overflowY: 'auto' }}>
                  {segmentData && segmentData.length > 0 ? (
                    segmentData.map((segment, index) => (
                      <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>{segment?.segment_name || `Segment ${index + 1}`}</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{segment?.customer_count?.toLocaleString() || 0}</Typography>
                        </Box>
                        <Box sx={{ 
                          display: 'flex', 
                          gap: 2,
                          fontSize: '0.875rem',
                          '& > *': { flex: '1 1 33.333%' }
                        }}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Growth</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'success.main' }}>+{segment?.growth || 0}%</Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Conversion</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{segment?.conversion_rate || 0}%</Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Revenue</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>₹{((segment?.revenue || 0) / 1000).toFixed(0)}K</Typography>
                          </Box>
                        </Box>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">No segment data available</Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
        </Box>

      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab label="Overview" value="overview" />
        <Tab label="Segments" value="segments" />
        <Tab label="Real-time" value="realtime" />
        <Tab label="Campaigns" value="campaigns" />
      </Tabs>
      
      {tabValue === 'overview' && (
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 3,
          '& > *': { 
            flex: { xs: '1 1 100%', lg: '1 1 calc(50% - 12px)' }
          }
        }}>
            {/* Campaign Performance Chart */}
            <Card>
              <CardHeader>
                <Typography variant="h6" component="h2">Campaign Performance</Typography>
              </CardHeader>
              <CardContent>
                {realTimeData?.campaignPerformance && realTimeData.campaignPerformance.length > 0 ? (
                  <Box sx={{ height: 300 }}>
                    {realTimeData.campaignPerformance.map((campaign, index) => (
                      <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'medium', mb: 1 }}>{campaign.name}</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                          <Typography variant="body2">Impressions: {campaign.impressions?.toLocaleString() || 0}</Typography>
                          <Typography variant="body2">Clicks: {campaign.clicks?.toLocaleString() || 0}</Typography>
                          <Typography variant="body2">Conversions: {campaign.conversions || 0}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">No campaign data available</Typography>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <Typography variant="h6" component="h2">Recent Activity</Typography>
              </CardHeader>
              <CardContent>
                <Typography variant="body1" sx={{ mb: 2, fontWeight: 'medium' }}>Customer Segments Overview</Typography>
                <Box sx={{ height: 300, overflowY: 'auto' }}>
                  {segmentData && segmentData.length > 0 ? (
                    segmentData.map((segment, index) => (
                      <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>{segment?.segment_name || `Segment ${index + 1}`}</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{segment?.customer_count?.toLocaleString() || 0}</Typography>
                        </Box>
                        <Box sx={{ 
                          display: 'flex', 
                          gap: 2,
                          fontSize: '0.875rem',
                          '& > *': { flex: '1 1 33.333%' }
                        }}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Growth</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'success.main' }}>+{segment?.growth || 0}%</Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Conversion</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{segment?.conversion_rate || 0}%</Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Revenue</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>₹{((segment?.revenue || 0) / 1000).toFixed(0)}K</Typography>
                          </Box>
                        </Box>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">No segment data available</Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
        </Box>
      )}

      {tabValue === 'segments' && (
          <Card>
              <CardHeader>
                  <Typography variant="h6" component="h2">Customer Segments Performance</Typography>
              </CardHeader>
              <CardContent>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {(segmentData || []).map((segment, index) => (
                          <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.2)}` }}>
                              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                      <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>{segment?.segment_name || 'Unknown'}</Typography>
                                      <Chip label={`${segment?.customer_count || 0} customers`} variant="outlined" size="small" />
                                  </Box>
                                  <Box sx={{ 
                                    display: 'flex', 
                                    gap: 2,
                                    fontSize: '0.875rem',
                                    '& > *': { flex: '1 1 33.333%' }
                                  }}>
                                      <Box>
                                          <Typography variant="body2" color="text.secondary">Growth</Typography>
                                          <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'success.main' }}>+{segment?.growth || 0}%</Typography>
                                      </Box>
                                      <Box>
                                          <Typography variant="body2" color="text.secondary">Conversion</Typography>
                                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{segment?.conversion_rate || 0}%</Typography>
                                      </Box>
                                      <Box>
                                          <Typography variant="body2" color="text.secondary">Revenue</Typography>
                                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>₹{((segment?.revenue || 0) / 1000).toFixed(0)}K</Typography>
                                      </Box>
                                  </Box>
                              </Box>
                          </Box>
                      ))}
                  </Box>
              </CardContent>
          </Card>
      )}

      {tabValue === 'realtime' && (
        <FlexGrid container spacing={3}>
          <FlexGrid xs={12} md={6}>
            <Card>
              <CardHeader>
                <Typography variant="h6" component="h2">Real-time Activity</Typography>
              </CardHeader>
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Active Users</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'info.main' }}>{realTimeData?.activeUsers || 0}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Recent Conversions</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'success.main' }}>{realTimeData?.recentConversions || 0}</Typography>
                  </Box>
                  <Skeleton variant="rectangular" width="100%" height={10} sx={{ borderRadius: 1 }} />
                  <Typography variant="body2" color="text.secondary">System performance</Typography>
                </Box>
              </CardContent>
            </Card>
          </FlexGrid>

          <FlexGrid xs={12} md={6}>
            <Card>
              <CardHeader>
                <Typography variant="h6" component="h2">Live Campaign Status</Typography>
              </CardHeader>
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Diwali Collection</Typography>
                    <Chip label="Active" variant="outlined" size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Wedding Season</Typography>
                    <Chip label="Paused" variant="outlined" size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Birthday Offers</Typography>
                    <Chip label="Active" variant="outlined" size="small" />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </FlexGrid>
        </FlexGrid>
      )}

      {tabValue === 'campaigns' && (
        <FlexGrid container spacing={3}>
          <FlexGrid xs={12} md={4}>
            <Card>
              <CardHeader>
                <Typography variant="h6" component="h2">Campaign Overview</Typography>
              </CardHeader>
              <CardContent>
                <FlexGrid container spacing={2}>
                  <FlexGrid xs={12} sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'info.main' }}>{campaignMetrics?.activeCampaigns || 0}</Typography>
                    <Typography variant="body2" color="text.secondary">Active Campaigns</Typography>
                  </FlexGrid>
                  <FlexGrid xs={12} sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'success.main' }}>{campaignMetrics?.conversionRate || 0}%</Typography>
                    <Typography variant="body2" color="text.secondary">Avg Conversion Rate</Typography>
                  </FlexGrid>
                  <FlexGrid xs={12} sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>{campaignMetrics?.roi || 0}x</Typography>
                    <Typography variant="body2" color="text.secondary">Average ROI</Typography>
                  </FlexGrid>
                </FlexGrid>
              </CardContent>
            </Card>
          </FlexGrid>
        </FlexGrid>
      )}
    </Container>
  );
} 