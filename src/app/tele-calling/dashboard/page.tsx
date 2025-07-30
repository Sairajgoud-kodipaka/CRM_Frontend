"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Button,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  useTheme,
  alpha,
  Fade,
  Zoom
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Phone as PhoneIcon,
  Assignment as AssignmentIcon,
  TrendingUp as ConversionIcon,
  Schedule as FollowUpIcon,
  PhoneInTalk as CallsIcon,
  CheckCircle as CompletedIcon,
  Pending as PendingIcon,
  Timer as TimerIcon,
  EmojiEvents as TrophyIcon,
  Notifications as NotificationIcon,
  Visibility as ViewIcon,
  PlaylistAddCheck as ManageIcon,
  Analytics as AnalyticsIcon,
  Today as TodayIcon
} from '@mui/icons-material';
import { telecallingAPI } from '@/lib/api';

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

const MetricCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
  borderRadius: theme.spacing(2),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  }
}));

const QuickActionCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(1.5),
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: theme.shadows[4],
  }
}));

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

const FollowUpCard = styled(Box)(({ theme }) => ({
  borderLeft: `4px solid ${theme.palette.warning.main}`,
  padding: theme.spacing(2),
  backgroundColor: alpha(theme.palette.warning.main, 0.05),
  borderRadius: `0 ${theme.spacing(1)}px ${theme.spacing(1)}px 0`,
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.warning.main, 0.1),
    transform: 'translateX(4px)',
  }
}));

interface LeaderboardEntry {
  telecaller: string;
  calls: number;
}

interface FollowUpTask {
  id: number;
  assignment: number;
  scheduled_time: string;
  notes: string;
  status: string;
}

interface TeleCallingStats {
  total_assignments: number;
  completed_assignments: number;
  pending_assignments: number;
  follow_up_assignments: number;
  total_calls: number;
  conversions: number;
  avg_call_duration: number;
}

export default function TeleCallingDashboard() {
  const theme = useTheme();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<TeleCallingStats>({
    total_assignments: 0,
    completed_assignments: 0,
    pending_assignments: 0,
    follow_up_assignments: 0,
    total_calls: 0,
    conversions: 0,
    avg_call_duration: 0
  });
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState("");
  const [followUps, setFollowUps] = useState<FollowUpTask[]>([]);
  const [fuLoading, setFuLoading] = useState(true);
  const [fuError, setFuError] = useState("");

  useEffect(() => {
    if (!loading) {
      console.log('User:', user); // Debug log
      console.log('User role:', user?.role); // Debug log
      if (!user) {
        router.replace('/login');
      } else if (user.role !== 'tele_calling' && user.role !== 'telecalling' && user.role !== 'marketing') {
        // Temporarily allow marketing users for testing
        console.log('Invalid role for tele-calling dashboard:', user.role);
        router.replace('/select-role');
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoadingStats(true);
    setError("");
    try {
      const token = localStorage.getItem("access_token");
      const headers = { Authorization: `Bearer ${token}` };
      
      // Fetch stats and leaderboard in parallel
      const [statsRes, leaderboardRes] = await Promise.all([
        telecallingAPI.getStats(),
        telecallingAPI.getLeaderboard()
      ]);
      
      setStats(statsRes.data);
      setLeaderboard(leaderboardRes.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to fetch dashboard data");
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    const fetchFollowUps = async () => {
      setFuLoading(true);
      setFuError("");
      try {
        const token = localStorage.getItem("access_token");
        // Fetch pending follow-ups for this telecaller (overdue and upcoming)
        const res = await telecallingAPI.getFollowUps({ status: 'pending' });
        setFollowUps(res.data.results || res.data);
      } catch (err: any) {
        setFuError(err.response?.data?.detail || "Failed to fetch follow-ups");
      } finally {
        setFuLoading(false);
      }
    };
    fetchFollowUps();
  }, []);

  const StatisticCard = ({ title, value, subtitle, icon, color, delay = 0 }: {
    title: string;
    value: number | string;
    subtitle: string;
    icon: React.ReactNode;
    color: string;
    delay?: number;
  }) => (
    <Zoom in={true} timeout={600} style={{ transitionDelay: `${delay}ms` }}>
      <MetricCard>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box sx={{ 
              p: 1.5, 
              borderRadius: 2, 
              bgcolor: alpha(theme.palette.primary.main, 0.1)
            }}>
              {React.cloneElement(icon as React.ReactElement, {
                sx: { color: `${color}.main`, fontSize: 28 }
              })}
            </Box>
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography variant="h3" sx={{ 
                fontWeight: 800, 
                color: `${color}.dark`,
                mb: 0.5
              }}>
                {value}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {subtitle}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </MetricCard>
    </Zoom>
  );

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <Stack spacing={2} alignItems="center">
            <CircularProgress size={64} />
            <Typography variant="h6" color="text.secondary">
              Loading...
            </Typography>
          </Stack>
        </Box>
      </Container>
    );
  }

  if (!user || (user.role !== 'tele_calling' && user.role !== 'telecalling' && user.role !== 'marketing')) {
    // For debugging - show the issue instead of returning null
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="warning">
          <Typography variant="h6" gutterBottom>
            Role Access Issue
          </Typography>
          <Typography>
            User role: {user?.role || 'No user'} | Expected: 'tele_calling', 'telecalling', or 'marketing'
          </Typography>
          <Typography>
            Please check your user permissions or contact an administrator.
          </Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Fade in={true} timeout={800}>
        <Box sx={{ mb: 4 }}>
          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            justifyContent="space-between" 
            alignItems={{ xs: 'flex-start', md: 'center' }}
            spacing={3}
          >
            <Box>
              <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 800, color: 'primary.dark' }}>
                Tele-calling Performance Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Track your call performance and manage assignments
              </Typography>
            </Box>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <Link href="/tele-calling/tele-calling" passHref>
                <Button
                  variant="contained"
                  startIcon={<ViewIcon />}
                  sx={{ justifyContent: 'flex-start' }}
          >
            View Assignments
                </Button>
          </Link>
              <Link href="/tele-calling/assignments" passHref>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<ManageIcon />}
                  sx={{ justifyContent: 'flex-start' }}
          >
            Manage Assignments
                </Button>
          </Link>
            </Stack>
          </Stack>
        </Box>
      </Fade>
      
      {loadingStats ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <Stack spacing={2} alignItems="center">
            <CircularProgress size={48} />
            <Typography variant="h6" color="text.secondary">
              Loading dashboard data...
            </Typography>
          </Stack>
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>Error</Typography>
          {error}
        </Alert>
      ) : (
        <>
          {/* Performance Stats */}
          <Fade in={true} timeout={1000} style={{ transitionDelay: '200ms' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 4 }}>
              <StatisticCard
                title="Total Calls"
                value={stats.total_calls}
                subtitle="Total Calls"
                icon={<CallsIcon />}
                color="primary"
                delay={0}
              />
              <StatisticCard
                title="Completed"
                value={stats.completed_assignments}
                subtitle="Completed"
                icon={<CompletedIcon />}
                color="success"
                delay={100}
              />
              <StatisticCard
                title="Conversions"
                value={stats.conversions}
                subtitle="Conversions"
                icon={<ConversionIcon />}
                color="secondary"
                delay={200}
              />
              <StatisticCard
                title="Follow-ups"
                value={stats.follow_up_assignments}
                subtitle="Follow-ups"
                icon={<FollowUpIcon />}
                color="warning"
                delay={300}
              />
            </Box>
          </Fade>

          {/* Additional Stats */}
          <Fade in={true} timeout={1000} style={{ transitionDelay: '400ms' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 4 }}>
              <StatisticCard
                title="Total Assignments"
                value={stats.total_assignments}
                subtitle="Total Assignments"
                icon={<AssignmentIcon />}
                color="info"
                delay={400}
              />
              <StatisticCard
                title="Pending"
                value={stats.pending_assignments}
                subtitle="Pending"
                icon={<PendingIcon />}
                color="error"
                delay={500}
              />
              <StatisticCard
                title="Avg Duration"
                value={`${stats.avg_call_duration}m`}
                subtitle="Avg Duration"
                icon={<TimerIcon />}
                color="secondary"
                delay={600}
              />
            </Box>
          </Fade>

          {/* Leaderboard and Follow-ups */}
          <Fade in={true} timeout={1000} style={{ transitionDelay: '600ms' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: 3, mb: 4 }}>
              <StyledCard>
                <CardHeader
                  title={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <TrophyIcon color="primary" />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Leaderboard (Top Tele-callers)
                      </Typography>
                    </Stack>
                  }
                />
                <CardContent>
              {leaderboard.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <PhoneIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="body1" color="text.secondary">
                          No call data available
                        </Typography>
                      </Box>
                    ) : (
                      <StyledTable component={Paper} elevation={0}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Telecaller</TableCell>
                              <TableCell align="right">Calls</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                    {leaderboard.map((entry, idx) => (
                              <TableRow 
                                key={entry.telecaller}
                                sx={idx === 0 ? { 
                                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                                  '&:hover': { bgcolor: alpha(theme.palette.warning.main, 0.15) }
                                } : {}}
                              >
                                <TableCell>
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    {idx === 0 && <TrophyIcon sx={{ color: 'warning.main', fontSize: 20 }} />}
                                    <Typography variant="body2" sx={{ fontWeight: idx === 0 ? 600 : 400 }}>
                                      {entry.telecaller}
                                    </Typography>
                                  </Stack>
                                </TableCell>
                                <TableCell align="right">
                                  <Chip 
                                    label={entry.calls} 
                                    size="small" 
                                    color={idx === 0 ? "warning" : "default"}
                                    variant={idx === 0 ? "filled" : "outlined"}
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </StyledTable>
                    )}
                  </CardContent>
                </StyledCard>

              <StyledCard>
                <CardHeader
                  title={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <NotificationIcon color="primary" />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        My Follow-up Reminders
                      </Typography>
                    </Stack>
                  }
                />
                <CardContent>
                    {fuError && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        {fuError}
                      </Alert>
                    )}
              {fuLoading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress size={32} />
                      </Box>
              ) : (
                      <Box>
                  {followUps.length === 0 ? (
                          <Box sx={{ textAlign: 'center', py: 4 }}>
                            <FollowUpIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                            <Typography variant="body1" color="text.secondary">
                              No pending follow-up tasks.
                            </Typography>
                          </Box>
                        ) : (
                          <Stack spacing={2}>
                            {followUps.slice(0, 5).map((fu, index) => (
                              <Zoom
                                key={fu.id}
                                in={true}
                                timeout={300}
                                style={{ transitionDelay: `${index * 100}ms` }}
                              >
                                <FollowUpCard>
                                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                    <Box sx={{ flex: 1 }}>
                                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                {new Date(fu.scheduled_time).toLocaleString()}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        {fu.notes}
                                      </Typography>
                                    </Box>
                                    <Link href={`/tele-calling/assignments/${fu.assignment}`} passHref>
                                      <Button size="small" color="primary">
                                        View
                                      </Button>
                            </Link>
                                  </Stack>
                                </FollowUpCard>
                              </Zoom>
                      ))}
                      {followUps.length > 5 && (
                              <Box sx={{ textAlign: 'center', pt: 2 }}>
                                <Link href="/tele-calling/assignments" passHref>
                                  <Button size="small" color="primary">
                            View all {followUps.length} follow-ups
                                  </Button>
                          </Link>
                              </Box>
                            )}
                          </Stack>
                        )}
                      </Box>
                    )}
                  </CardContent>
                </StyledCard>
            </Box>
          </Fade>

          {/* Quick Actions */}
          <Fade in={true} timeout={1000} style={{ transitionDelay: '800ms' }}>
            <StyledCard>
              <CardHeader
                title={
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Quick Actions
                  </Typography>
                }
              />
              <CardContent>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3 }}>
                  <QuickActionCard sx={{ 
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                  }}>
                    <CardContent>
                      <Stack spacing={1}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <TodayIcon sx={{ color: 'primary.main' }} />
                          <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                            View Today's Calls
                          </Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          Check your scheduled calls for today
                        </Typography>
                      </Stack>
                    </CardContent>
                  </QuickActionCard>
                  
                  <QuickActionCard sx={{ 
                    bgcolor: alpha(theme.palette.success.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
                  }}>
                    <CardContent>
                      <Stack spacing={1}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <ManageIcon sx={{ color: 'success.main' }} />
                          <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                            Manage Assignments
                          </Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          Create and manage call assignments
                        </Typography>
                      </Stack>
                    </CardContent>
                  </QuickActionCard>
                  
                  <QuickActionCard sx={{ 
                    bgcolor: alpha(theme.palette.secondary.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`
                  }}>
                    <CardContent>
                      <Stack spacing={1}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <AnalyticsIcon sx={{ color: 'secondary.main' }} />
                          <Typography variant="h6" sx={{ fontWeight: 600, color: 'secondary.main' }}>
                            Sales Funnel
                          </Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          View conversion analytics
                        </Typography>
                      </Stack>
                    </CardContent>
                  </QuickActionCard>
                </Box>
              </CardContent>
            </StyledCard>
          </Fade>
        </>
      )}
    </Container>
  );
} 