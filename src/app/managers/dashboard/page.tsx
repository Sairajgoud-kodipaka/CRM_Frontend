"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Avatar,
  ThemeProvider,
  createTheme,
  LinearProgress,
  Paper,
  IconButton,
  Tooltip,
  Badge,
  Stack,
  Button
} from '@mui/material';
import {
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Assignment as TaskIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Notifications as NotificationsIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  EmojiEvents as TrophyIcon,
  TrendingDown as TrendingDownIcon,
  PersonAdd as PersonAddIcon,
  ShoppingCart as ShoppingCartIcon,
  Assessment as AssessmentIcon,
  Category as CategoryIcon,
  CalendarToday as CalendarIcon,
  Assignment as AssignmentIcon,
  Feedback as FeedbackIcon
} from '@mui/icons-material';
import { FlexGrid } from '@/components/ui/FlexGrid';

// Create a theme for manager dashboard
const managerTheme = createTheme({
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
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          height: 8,
        },
      },
    },
  },
});

interface DashboardMetrics {
  teamMembers: number;
  leads: number;
  sales: number;
  tasks: number;
  total_team_members: number;
  active_members: number;
  total_team_sales: number;
  performance_summary: {
    excellent: number;
    good: number;
    average: number;
    below_average: number;
    poor: number;
  };
  recent_activities: Array<{
    id: number;
    member_name: string;
    activity_type: string;
    description: string;
    created_at: string;
  }>;
}

interface DashboardStats {
  todayGoal: number;
  nextMeeting: string;
  teamRating: number;
  salesTarget: number;
  leadConversionTarget: number;
  taskCompletionTarget: number;
}

export default function ManagerDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (user.role !== 'manager') {
        router.replace('/managers/dashboard');
      }
    }
  }, [user, loading, router]);

  const fetchDashboardData = async () => {
    setLoadingMetrics(true);
    setError(null);
    try {
      const res = await api.get('/auth/managers/dashboard/');
      setMetrics(res.data);
      setLastUpdated(new Date());
      
      // Calculate derived stats based on real data
      const calculatedStats: DashboardStats = {
        todayGoal: calculateTodayGoal(res.data),
        nextMeeting: getNextMeetingTime(),
        teamRating: calculateTeamRating(res.data),
        salesTarget: 1000000, // 1M target
        leadConversionTarget: res.data.leads + 50, // Example target
        taskCompletionTarget: res.data.tasks + 10, // Example target
      };
      setStats(calculatedStats);
    } catch (err: any) {
      console.error('Dashboard fetch error:', err);
      
      if (err.response?.status === 401) {
        setError('Authentication required. Please log in again.');
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to load dashboard metrics. Please try again later.');
      }
    } finally {
      setLoadingMetrics(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'manager') {
      fetchDashboardData();
      
      // Set up auto-refresh every 5 minutes
      const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const calculateTodayGoal = (data: DashboardMetrics): number => {
    if (!data) return 0;
    const totalPossible = data.leads + data.tasks + (data.sales > 0 ? 1 : 0);
    const completed = Math.min(data.leads * 0.3 + data.tasks * 0.7, totalPossible);
    return totalPossible > 0 ? Math.round((completed / totalPossible) * 100) : 0;
  };

  const calculateTeamRating = (data: DashboardMetrics): number => {
    if (!data || !data.performance_summary) return 0;
    const { excellent, good, average, below_average, poor } = data.performance_summary;
    const total = excellent + good + average + below_average + poor;
    if (total === 0) return 0;
    
    const weightedScore = (excellent * 5 + good * 4 + average * 3 + below_average * 2 + poor * 1);
    return Math.round((weightedScore / total) * 10) / 10; // Round to 1 decimal
  };

  const getNextMeetingTime = (): string => {
    const now = new Date();
    const nextHour = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
    return nextHour.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const getPerformanceColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'success';
      case 'good': return 'info';
      case 'average': return 'warning';
      case 'below_average': return 'warning';
      case 'poor': return 'error';
      default: return 'default';
    }
  };

  const calculateTrend = (current: number, previous: number): { trend: 'up' | 'down' | 'neutral', percentage: number } => {
    if (previous === 0) return { trend: 'neutral', percentage: 0 };
    const change = ((current - previous) / previous) * 100;
    return {
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
      percentage: Math.abs(Math.round(change))
    };
  };

  const MetricCard = ({ 
    title, 
    value, 
    icon, 
    color = 'primary',
    subtitle,
    trend,
    percentage
  }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color?: 'primary' | 'success' | 'warning' | 'info';
    subtitle?: string;
    trend?: 'up' | 'down' | 'neutral';
    percentage?: number;
  }) => (
    <Card sx={{ 
      background: `linear-gradient(135deg, ${color === 'primary' ? '#1976d2' : color === 'success' ? '#2e7d32' : color === 'warning' ? '#ed6c02' : '#0288d1'}15, ${color === 'primary' ? '#1976d2' : color === 'success' ? '#2e7d32' : color === 'warning' ? '#ed6c02' : '#0288d1'}05)`,
      border: `1px solid ${color === 'primary' ? '#1976d2' : color === 'success' ? '#2e7d32' : color === 'warning' ? '#ed6c02' : '#0288d1'}20`
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                bgcolor: `${color}.main`,
                color: 'white',
                mr: 2,
                width: 56,
                height: 56,
                boxShadow: `0 4px 12px ${color === 'primary' ? '#1976d2' : color === 'success' ? '#2e7d32' : color === 'warning' ? '#ed6c02' : '#0288d1'}40`
              }}
            >
              {icon}
            </Avatar>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
                {title}
              </Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 0.5 }}>
                {value}
              </Typography>
              {subtitle && (
                <Typography variant="caption" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {trend === 'up' ? (
                <TrendingUpIcon sx={{ color: 'success.main', fontSize: 20 }} />
              ) : trend === 'down' ? (
                <TrendingDownIcon sx={{ color: 'error.main', fontSize: 20 }} />
              ) : null}
              {percentage && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: trend === 'up' ? 'success.main' : trend === 'down' ? 'error.main' : 'text.secondary',
                    fontWeight: 600,
                    ml: 0.5
                  }}
                >
                  {percentage}%
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  const PerformanceCard = ({ title, value, total, color, icon }: {
    title: string;
    value: number;
    total: number;
    color: 'primary' | 'success' | 'warning' | 'info';
    icon: React.ReactNode;
  }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    
    return (
      <Card sx={{ 
        background: `linear-gradient(135deg, ${color === 'primary' ? '#1976d2' : color === 'success' ? '#2e7d32' : color === 'warning' ? '#ed6c02' : '#0288d1'}10, ${color === 'primary' ? '#1976d2' : color === 'success' ? '#2e7d32' : color === 'warning' ? '#ed6c02' : '#0288d1'}05)`
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              sx={{
                bgcolor: `${color}.main`,
                color: 'white',
                mr: 2,
                width: 40,
                height: 40
              }}
            >
              {icon}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {title}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {value} / {total}
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: `${color}.main` }}>
              {percentage.toFixed(1)}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={percentage} 
            color={color}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        flexDirection: 'column'
      }}>
        <CircularProgress size={64} sx={{ mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Loading your dashboard...
        </Typography>
      </Box>
    );
  }
  
  if (!user || user.role !== 'manager') {
    return null;
  }

  return (
    <ThemeProvider theme={managerTheme}>
      <Box sx={{ py: 3, px: 2 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 700, background: 'linear-gradient(135deg, #1976d2, #42a5f5)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Welcome back, {user?.first_name || user?.username || "Manager"}! 👋
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Here's your comprehensive team and store performance overview
              </Typography>
              {lastUpdated && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Refresh Dashboard">
                <IconButton 
                  onClick={fetchDashboardData}
                  disabled={loadingMetrics}
                  sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' }
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Badge badgeContent={3} color="error">
                <Tooltip title="Notifications">
                  <IconButton sx={{ 
                    bgcolor: 'warning.main', 
                    color: 'white',
                    '&:hover': { bgcolor: 'warning.dark' }
                  }}>
                    <NotificationsIcon />
                  </IconButton>
                </Tooltip>
              </Badge>
            </Box>
          </Box>
          
          {/* Quick Stats Bar */}
          {stats && (
            <Paper sx={{ 
              p: 2, 
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
              borderRadius: 3
            }}>
              <FlexGrid container spacing={2}>
                <FlexGrid>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrophyIcon sx={{ color: 'warning.main', mr: 1 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Today's Goal: {stats.todayGoal}% Complete
                    </Typography>
                  </Box>
                </FlexGrid>
                <FlexGrid>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ScheduleIcon sx={{ color: 'info.main', mr: 1 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Next Meeting: {stats.nextMeeting}
                    </Typography>
                  </Box>
                </FlexGrid>
                <FlexGrid>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <StarIcon sx={{ color: 'success.main', mr: 1 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Team Rating: {stats.teamRating}/5
                    </Typography>
                  </Box>
                </FlexGrid>
              </FlexGrid>
            </Paper>
          )}
        </Box>

        {/* Loading State */}
        {loadingMetrics && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            py: 8,
            flexDirection: 'column'
          }}>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography color="text.secondary" variant="h6">
              Loading your dashboard metrics...
            </Typography>
            <LinearProgress sx={{ width: '50%', mt: 2 }} />
          </Box>
        )}

        {/* Error State */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={fetchDashboardData}>
                Retry
              </Button>
            }
          >
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              Dashboard Error
            </Typography>
            {error}
          </Alert>
        )}

        {/* Dashboard Metrics */}
        {!loadingMetrics && !error && metrics && (
          <>
            {/* Key Metrics Cards */}
            <FlexGrid container spacing={3} sx={{ mb: 4 }}>
              <FlexGrid>
                <MetricCard
                  title="Team Members"
                  value={metrics.teamMembers}
                  icon={<PeopleIcon />}
                  color="primary"
                  subtitle="Active members"
                  trend="up"
                  percentage={12}
                />
              </FlexGrid>
              <FlexGrid>
                <MetricCard
                  title="Total Leads"
                  value={metrics.leads}
                  icon={<TrendingUpIcon />}
                  color="success"
                  subtitle="This month"
                  trend="up"
                  percentage={8}
                />
              </FlexGrid>
              <FlexGrid>
                <MetricCard
                  title="Sales Revenue"
                  value={formatCurrency(typeof metrics.sales === 'number' ? metrics.sales : 0)}
                  icon={<MoneyIcon />}
                  color="warning"
                  subtitle="Monthly target"
                  trend="up"
                  percentage={15}
                />
              </FlexGrid>
              <FlexGrid>
                <MetricCard
                  title="Active Tasks"
                  value={metrics.tasks}
                  icon={<TaskIcon />}
                  color="info"
                  subtitle="Pending completion"
                  trend="down"
                  percentage={5}
                />
              </FlexGrid>
            </FlexGrid>

            {/* Performance Overview */}
            <FlexGrid container spacing={3} sx={{ mb: 4 }}>
              <FlexGrid>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <AssessmentIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Team Performance Overview
                      </Typography>
                    </Box>
                    <FlexGrid container spacing={2}>
                      <FlexGrid>
                        <PerformanceCard
                          title="Active Members"
                          value={metrics.active_members}
                          total={metrics.total_team_members}
                          color="success"
                          icon={<PeopleIcon />}
                        />
                      </FlexGrid>
                      <FlexGrid>
                        <PerformanceCard
                          title="Sales Target"
                          value={typeof metrics.total_team_sales === 'number' ? metrics.total_team_sales : 0}
                          total={stats?.salesTarget || 1000000}
                          color="warning"
                          icon={<MoneyIcon />}
                        />
                      </FlexGrid>
                      <FlexGrid>
                        <PerformanceCard
                          title="Lead Conversion"
                          value={metrics.leads}
                          total={stats?.leadConversionTarget || (metrics.leads + 50)}
                          color="info"
                          icon={<TrendingUpIcon />}
                        />
                      </FlexGrid>
                      <FlexGrid>
                        <PerformanceCard
                          title="Task Completion"
                          value={metrics.tasks}
                          total={stats?.taskCompletionTarget || (metrics.tasks + 20)}
                          color="success"
                          icon={<TaskIcon />}
                        />
                      </FlexGrid>
                    </FlexGrid>
                  </CardContent>
                </Card>
              </FlexGrid>

              {/* Performance Summary */}
              <FlexGrid>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <CategoryIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Performance Summary
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {metrics.performance_summary && Object.entries(metrics.performance_summary).map(([level, count]) => (
                        <Box key={level} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box 
                              sx={{ 
                                width: 8, 
                                height: 8, 
                                borderRadius: '50%', 
                                bgcolor: getPerformanceColor(level)
                              }} 
                            />
                            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                              {level.replace('_', ' ')}
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {count}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </FlexGrid>
            </FlexGrid>

            {/* Recent Activities & Quick Actions */}
            <FlexGrid container spacing={3}>
              {/* Recent Activities */}
              <FlexGrid>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarIcon sx={{ mr: 2, color: 'primary.main' }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Recent Team Activities
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'N/A'}
                      </Typography>
                    </Box>
                    
                    {metrics.recent_activities && metrics.recent_activities.length > 0 ? (
                      <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                        {metrics.recent_activities.slice(0, 8).map((activity, index) => (
                          <Box key={activity.id || index} sx={{ 
                            display: 'flex', 
                            alignItems: 'flex-start', 
                            gap: 2, 
                            py: 1.5,
                            borderBottom: index < Math.min(metrics.recent_activities.length, 8) - 1 ? 1 : 0,
                            borderColor: 'divider'
                          }}>
                            <Box sx={{ 
                              width: 8, 
                              height: 8, 
                              borderRadius: '50%', 
                              bgcolor: 'primary.main',
                              mt: 0.5,
                              flexShrink: 0
                            }} />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                                {activity.member_name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ 
                                fontSize: '0.875rem',
                                lineHeight: 1.4
                              }}>
                                {activity.description}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(activity.created_at).toLocaleDateString()} at{' '}
                                {new Date(activity.created_at).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <CalendarIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="body2" color="text.secondary">
                          No recent activities
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </FlexGrid>

              {/* Quick Actions */}
              <FlexGrid>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                      Quick Actions
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<PeopleIcon />}
                        fullWidth
                        sx={{ 
                          justifyContent: 'flex-start',
                          bgcolor: 'primary.main',
                          '&:hover': { bgcolor: 'primary.dark' }
                        }}
                        href="/managers/team-management"
                      >
                        Manage Team
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<AssignmentIcon />}
                        fullWidth
                        sx={{ justifyContent: 'flex-start' }}
                        href="/managers/assignments"
                      >
                        View Assignments
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<BarChartIcon />}
                        fullWidth
                        sx={{ justifyContent: 'flex-start' }}
                        href="/managers/escalations"
                      >
                        Check Escalations
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<FeedbackIcon />}
                        fullWidth
                        sx={{ justifyContent: 'flex-start' }}
                        href="/managers/feedback-monitoring"
                      >
                        Monitor Feedback
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </FlexGrid>
            </FlexGrid>
          </>
        )}
      </Box>
    </ThemeProvider>
  );
} 