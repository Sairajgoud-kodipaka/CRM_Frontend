'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Chip,
  Button,
  TextField,
  MenuItem,
  Grid,
  CircularProgress,
  Stack,
  Container,
  Paper,
  InputAdornment,
  Fade,
  useTheme,
  alpha
} from '@mui/material';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Target, 
  Search,
  Filter,
  Download,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import api from '@/lib/api';

interface Segment {
  id: string;
  name: string;
  slug: string;
  category: string;
  count: number;
  growth: number;
  conversionRate: number;
  avgRevenue: number;
  totalRevenue: number;
  tags: string[];
  lastUpdated: string;
  status: 'active' | 'inactive' | 'draft';
}

interface SegmentCategory {
  name: string;
  count: number;
  percentage: number;
}

export default function SegmentOverview() {
  const theme = useTheme();
  const [segments, setSegments] = useState<Segment[]>([]);
  const [categories, setCategories] = useState<SegmentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('count');

  useEffect(() => {
    const fetchSegments = async () => {
      setLoading(true);
      try {
        const response = await api.get('/marketing/segment-overview/');
        setSegments(response.data);
      } catch (error) {
        console.error('Error fetching segment overview:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSegments();
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Revenue':
        return 'primary';
      case 'Intent':
        return 'info';
      case 'Product':
        return 'success';
      case 'Event':
        return 'warning';
      default:
        return 'default';
    }
  };

  const filteredSegments = segments.filter(segment =>
    segment.name.toLowerCase().includes(search.toLowerCase()) ||
    segment.category.toLowerCase().includes(search.toLowerCase()) ||
    segment.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  );

  const sortedSegments = [...filteredSegments].sort((a, b) => {
    switch (sortBy) {
      case 'count':
        return b.count - a.count;
      case 'growth':
        return b.growth - a.growth;
      case 'conversion':
        return b.conversionRate - a.conversionRate;
      case 'revenue':
        return b.totalRevenue - a.totalRevenue;
      default:
        return b.count - a.count;
    }
  });

  const totalCustomers = segments.reduce((sum, segment) => sum + segment.count, 0);
  const totalRevenue = segments.reduce((sum, segment) => sum + segment.totalRevenue, 0);
  const avgConversionRate = segments.reduce((sum, segment) => sum + segment.conversionRate, 0) / segments.length;

  const MetricCard = ({ 
    title, 
    value, 
    subtitle, 
    icon,
    color = 'primary'
  }: {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ReactNode;
    color?: string;
  }) => (
    <Card elevation={1} sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            {title}
          </Typography>
          <Box sx={{ color: `${color}.main` }}>
            {icon}
          </Box>
        </Box>
        <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 0.5 }}>
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          p: 8 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack spacing={3}>
      {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2
        }}>
          <Box>
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
              Customer Segments
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage and analyze your customer segments
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" startIcon={<Download size={20} />}>
            Export
          </Button>
            <Button variant="contained" startIcon={<Users size={20} />}>
            Create Segment
          </Button>
          </Stack>
        </Box>

      {/* Overall Metrics */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} lg={3}>
            <MetricCard
              title="Total Segments"
              value={segments.length.toString()}
              subtitle={`${categories.length} categories`}
              icon={<Users size={20} />}
              color="primary"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} lg={3}>
            <MetricCard
              title="Total Customers"
              value={totalCustomers.toLocaleString()}
              subtitle="Across all segments"
              icon={<Users size={20} />}
              color="info"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} lg={3}>
            <MetricCard
              title="Avg Conversion Rate"
              value={`${avgConversionRate.toFixed(1)}%`}
              subtitle="Across all segments"
              icon={<Target size={20} />}
              color="success"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} lg={3}>
            <MetricCard
              title="Total Revenue"
              value={`₹${(totalRevenue / 1000000).toFixed(1)}M`}
              subtitle="From all segments"
              icon={<DollarSign size={20} />}
              color="warning"
            />
          </Grid>
        </Grid>

        {/* Filters and Segment Management */}
        <Card elevation={2}>
          <CardHeader>
            <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
              Segment Management
            </Typography>
          </CardHeader>
          <CardContent sx={{ p: 3 }}>
            {/* Search and Filters */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search segments..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search size={20} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  select
                  label="Filter by category"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  <MenuItem value="revenue">Revenue</MenuItem>
                  <MenuItem value="intent">Intent</MenuItem>
                  <MenuItem value="product">Product</MenuItem>
                  <MenuItem value="event">Event</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  select
                  label="Sort by"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="count">Customer Count</MenuItem>
                  <MenuItem value="growth">Growth Rate</MenuItem>
                  <MenuItem value="conversion">Conversion Rate</MenuItem>
                  <MenuItem value="revenue">Revenue</MenuItem>
                </TextField>
              </Grid>
            </Grid>

          {/* Category Distribution */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Category Distribution
              </Typography>
              <Grid container spacing={2}>
              {categories.map((category) => (
                  <Grid item xs={6} sm={3} key={category.name}>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        textAlign: 'center',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                          borderColor: 'primary.main'
                        }
                      }}
                    >
                      <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {category.count}
                      </Typography>
                      <Typography variant="body2" color="text.primary">
                        {category.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {category.percentage}%
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>

          {/* Segments List */}
            <Stack spacing={2}>
              {sortedSegments.map((segment, index) => (
                <Fade in={true} timeout={300 + index * 50} key={segment.id}>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 3,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.grey[500], 0.05),
                        borderColor: 'grey.400'
                      }
                    }}
                  >
                    {/* Segment Header */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      mb: 2 
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: 'primary.main'
                          }}
                        />
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {segment.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {segment.category} • {segment.count} customers
                          </Typography>
                        </Box>
                      </Box>
                      <Chip 
                        label={segment.status.charAt(0).toUpperCase() + segment.status.slice(1)}
                        color={segment.status === 'active' ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>

                    {/* Metrics Grid */}
                    <Grid container spacing={3} sx={{ mb: 2 }}>
                      <Grid item xs={6} sm={3}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Growth</Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 600,
                              color: segment.growth > 0 ? 'success.main' : 'error.main'
                            }}
                          >
                      {segment.growth > 0 ? '+' : ''}{segment.growth}%
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Conversion Rate</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {segment.conversionRate}%
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Avg Revenue</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            ₹{(segment.avgRevenue / 1000).toFixed(0)}K
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Total Revenue</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            ₹{(segment.totalRevenue / 100000).toFixed(1)}L
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Tags and Last Updated */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: 2
                    }}>
                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                    {segment.tags.slice(0, 3).map((tag) => (
                          <Chip 
                            key={tag} 
                            label={tag}
                            variant="outlined" 
                            size="small"
                          />
                    ))}
                    {segment.tags.length > 3 && (
                          <Chip 
                            label={`+${segment.tags.length - 3} more`}
                            variant="outlined" 
                            size="small"
                          />
                        )}
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                    Updated {new Date(segment.lastUpdated).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Paper>
                </Fade>
              ))}
            </Stack>
        </CardContent>
      </Card>
      </Stack>
    </Container>
  );
} 