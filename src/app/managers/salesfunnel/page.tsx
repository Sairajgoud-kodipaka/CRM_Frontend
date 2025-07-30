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
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Divider,
  Alert,
  LinearProgress,
  Avatar,
  useTheme,
  alpha,
  Fade,
  Grid,
  Badge
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Star as StarIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { FlexGrid } from '@/components/ui/FlexGrid';

// Mock data - replace with actual API calls
const salesFunnelData = {
  overview: {
    totalDeals: 248,
    totalValue: 2850000,
    conversionRate: 23.5,
    avgDealSize: 11500,
    activePipeline: 1650000
  },
  stages: [
    { name: 'Leads', count: 85, value: 425000, color: '#2196F3' },
    { name: 'Qualified', count: 62, value: 620000, color: '#FF9800' },
    { name: 'Proposal', count: 38, value: 570000, color: '#9C27B0' },
    { name: 'Negotiation', count: 24, value: 480000, color: '#FF5722' },
    { name: 'Closed Won', count: 18, value: 360000, color: '#4CAF50' },
    { name: 'Closed Lost', count: 21, value: 0, color: '#F44336' }
  ],
  teamPerformance: [
    { id: 1, name: 'Sarah Johnson', deals: 15, value: 185000, conversion: 28.5, avatar: 'SJ' },
    { id: 2, name: 'Mike Chen', deals: 12, value: 142000, conversion: 25.0, avatar: 'MC' },
    { id: 3, name: 'Lisa Rodriguez', deals: 18, value: 198000, conversion: 31.2, avatar: 'LR' },
    { id: 4, name: 'David Kim', deals: 10, value: 125000, conversion: 22.8, avatar: 'DK' }
  ],
  recentActivities: [
    { id: 1, deal: 'Enterprise Software License', client: 'TechCorp Inc', action: 'Moved to Negotiation', time: '2 hours ago', value: 45000 },
    { id: 2, deal: 'CRM Implementation', client: 'StartupXYZ', action: 'Proposal Sent', time: '4 hours ago', value: 28000 },
    { id: 3, deal: 'Cloud Migration', client: 'RetailChain Ltd', action: 'Deal Closed Won', time: '6 hours ago', value: 67000 },
    { id: 4, deal: 'Security Audit', client: 'FinanceGroup', action: 'Qualified Lead', time: '8 hours ago', value: 15000 }
  ]
};

export default function ManagersSalesFunnel() {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [timeFilter, setTimeFilter] = useState('30days');
  const [teamFilter, setTeamFilter] = useState('all');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getConversionColor = (rate: number) => {
    if (rate >= 30) return theme.palette.success.main;
    if (rate >= 20) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Fade in={true} timeout={800}>
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 800, color: 'primary.dark' }}>
                Sales Funnel Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Monitor and optimize your team's sales performance
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button variant="outlined" startIcon={<DownloadIcon />}>
                Export Report
              </Button>
              <Button variant="contained" startIcon={<AssessmentIcon />}>
                Analytics Dashboard
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Fade>

      {/* Key Metrics Cards */}
      <FlexGrid container spacing={3} sx={{ mb: 4 }}>
        <FlexGrid xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <PeopleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {salesFunnelData.overview.totalDeals}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Active Deals
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </FlexGrid>

        <FlexGrid xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <MoneyIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {formatCurrency(salesFunnelData.overview.activePipeline)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Pipeline Value
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </FlexGrid>

        <FlexGrid xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {salesFunnelData.overview.conversionRate}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Conversion Rate
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </FlexGrid>

        <FlexGrid xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <StarIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {formatCurrency(salesFunnelData.overview.avgDealSize)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Deal Size
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </FlexGrid>
      </FlexGrid>

      {/* Funnel Visualization */}
      <Card sx={{ mb: 4 }}>
        <CardHeader 
          title="Sales Funnel Overview"
          action={
            <Stack direction="row" spacing={1}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Time Period</InputLabel>
                <Select
                  value={timeFilter}
                  label="Time Period"
                  onChange={(e) => setTimeFilter(e.target.value)}
                >
                  <MenuItem value="7days">Last 7 Days</MenuItem>
                  <MenuItem value="30days">Last 30 Days</MenuItem>
                  <MenuItem value="3months">Last 3 Months</MenuItem>
                  <MenuItem value="year">This Year</MenuItem>
                </Select>
              </FormControl>
              <IconButton>
                <RefreshIcon />
              </IconButton>
            </Stack>
          }
        />
        <CardContent>
          <Stack spacing={3}>
            {salesFunnelData.stages.map((stage, index) => {
              const width = Math.max(10, (stage.count / salesFunnelData.stages[0].count) * 100);
              return (
                <Box key={stage.name}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {stage.name}
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      <Chip 
                        label={`${stage.count} deals`} 
                        size="small" 
                        variant="outlined"
                      />
                      <Typography variant="body2" color="text.secondary">
                        {formatCurrency(stage.value)}
                      </Typography>
                    </Stack>
                  </Stack>
                  <Box
                    sx={{
                      height: 40,
                      bgcolor: alpha(stage.color, 0.1),
                      borderRadius: 2,
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <Box
                      sx={{
                        height: '100%',
                        width: `${width}%`,
                        bgcolor: stage.color,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '60px'
                      }}
                    >
                      <Typography variant="body2" color="white" fontWeight={600}>
                        {stage.count}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Stack>
        </CardContent>
      </Card>

      {/* Team Performance & Recent Activities */}
      <FlexGrid container spacing={3}>
        <FlexGrid xs={12} md={7}>
          <Card sx={{ height: '100%' }}>
            <CardHeader 
              title="Team Performance"
              action={
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Team Filter</InputLabel>
                  <Select
                    value={teamFilter}
                    label="Team Filter"
                    onChange={(e) => setTeamFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Team</MenuItem>
                    <MenuItem value="seniors">Senior Reps</MenuItem>
                    <MenuItem value="juniors">Junior Reps</MenuItem>
                  </Select>
                </FormControl>
              }
            />
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Sales Rep</TableCell>
                      <TableCell align="center">Active Deals</TableCell>
                      <TableCell align="center">Pipeline Value</TableCell>
                      <TableCell align="center">Conversion Rate</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {salesFunnelData.teamPerformance.map((rep) => (
                      <TableRow key={rep.id} hover>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              {rep.avatar}
                            </Avatar>
                            <Typography variant="body2" fontWeight={600}>
                              {rep.name}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="center">
                          <Badge badgeContent={rep.deals} color="primary">
                            <Chip label={rep.deals} variant="outlined" />
                          </Badge>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" fontWeight={600}>
                            {formatCurrency(rep.value)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Stack alignItems="center" spacing={1}>
                            <Typography 
                              variant="body2" 
                              fontWeight={600}
                              color={getConversionColor(rep.conversion)}
                            >
                              {rep.conversion}%
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={rep.conversion} 
                              sx={{ width: 60, height: 4 }}
                              color={rep.conversion >= 30 ? 'success' : rep.conversion >= 20 ? 'warning' : 'error'}
                            />
                          </Stack>
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1}>
                            <IconButton size="small">
                              <ViewIcon />
                            </IconButton>
                            <IconButton size="small">
                              <EditIcon />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </FlexGrid>

        <FlexGrid xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Recent Activities" />
            <CardContent>
              <Stack spacing={2}>
                {salesFunnelData.recentActivities.map((activity) => (
                  <Box key={activity.id}>
                    <Stack spacing={1}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {activity.deal}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {activity.client}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {activity.time}
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Chip 
                          label={activity.action}
                          size="small"
                          color={activity.action.includes('Won') ? 'success' : 'default'}
                          variant="outlined"
                        />
                        <Typography variant="body2" fontWeight={600}>
                          {formatCurrency(activity.value)}
                        </Typography>
                      </Stack>
                    </Stack>
                    <Divider sx={{ mt: 2 }} />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </FlexGrid>
      </FlexGrid>

      {/* Alert Section */}
      <Box sx={{ mt: 4 }}>
        <Alert severity="info" icon={<TimelineIcon />}>
          <Typography variant="body2">
            <strong>Performance Insight:</strong> Conversion rate has improved by 5.2% this month. 
            Sarah Johnson is leading with the highest conversion rate of 31.2%.
          </Typography>
        </Alert>
      </Box>
    </Container>
  );
} 