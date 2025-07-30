'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Container,
  ThemeProvider
} from '@mui/material';
import { FlexGrid } from '@/components/ui/FlexGrid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import api from '@/lib/api';
import Link from 'next/link';
import { businessAdminTheme } from '@/lib/theme';

// Simple DatePicker component
const DatePicker = ({ selected, onChange, placeholderText, className }: {
  selected: Date;
  onChange: (date: Date) => void;
  placeholderText: string;
  className?: string;
}) => (
  <TextField
    type="date"
    value={selected.toISOString().split('T')[0]}
    onChange={(e) => onChange(new Date(e.target.value))}
    className={className}
    fullWidth
    margin="normal"
  />
);

interface PipelineData {
  stage_summary: Record<string, {
    name: string;
    count: number;
    value: number;
    percentage: number;
  }>;
  recent_pipelines: Array<{
    id: number;
    title: string;
    client: {
      first_name: string;
      last_name: string;
    };
    stage: string;
    expected_value: number;
    probability: number;
    expected_close_date: string;
    updated_at: string;
  }>;
  upcoming_actions: Array<{
    id: number;
    title: string;
    client: {
      first_name: string;
      last_name: string;
    };
    next_action: string;
    next_action_date: string;
  }>;
}

interface Client {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export default function PipelinePage() {
  const [pipelineData, setPipelineData] = useState<PipelineData | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPipeline, setNewPipeline] = useState({
    title: '',
    client_id: '',
    expected_value: '',
    expected_close_date: '',
    notes: '',
  });

  const pipelineStages = [
    { value: 'lead', label: 'Lead', color: 'bg-gray-100 text-gray-800' },
    { value: 'contacted', label: 'Contacted', color: 'bg-blue-100 text-blue-800' },
    { value: 'qualified', label: 'Qualified', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'proposal', label: 'Proposal', color: 'bg-purple-100 text-purple-800' },
    { value: 'negotiation', label: 'Negotiation', color: 'bg-orange-100 text-orange-800' },
    { value: 'closed_won', label: 'Closed Won', color: 'bg-green-100 text-green-800' },
    { value: 'closed_lost', label: 'Closed Lost', color: 'bg-red-100 text-red-800' },
  ];

  useEffect(() => {
    fetchPipelineData();
    fetchClients();
  }, []);

  const fetchPipelineData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/sales/pipeline/dashboard/');
      setPipelineData(response.data);
    } catch (error) {
      console.error('Error fetching pipeline data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients/clients/');
      // Ensure response.data is an array
      if (Array.isArray(response.data)) {
        setClients(response.data);
      } else if (response.data && Array.isArray(response.data.results)) {
        // Handle paginated response
        setClients(response.data.results);
      } else {
        console.error('Unexpected clients data format:', response.data);
        setClients([]);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      setClients([]);
    }
  };

  const createPipeline = async () => {
    try {
      await api.post('/sales/pipeline/create/', {
        ...newPipeline,
        expected_value: parseFloat(newPipeline.expected_value),
        client: parseInt(newPipeline.client_id),
      });
      
      setShowCreateDialog(false);
      setNewPipeline({
        title: '',
        client_id: '',
        expected_value: '',
        expected_close_date: '',
        notes: '',
      });
      fetchPipelineData();
    } catch (error) {
      console.error('Error creating pipeline:', error);
    }
  };

  const moveToStage = async (pipelineId: number, newStage: string) => {
    try {
      await api.post(`/sales/pipeline/${pipelineId}/transition/`, {
        stage: newStage,
      });
      fetchPipelineData();
    } catch (error) {
      console.error('Error moving pipeline stage:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStageColor = (stage: string) => {
    const stageConfig = pipelineStages.find(s => s.value === stage);
    return stageConfig?.color || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <ThemeProvider theme={businessAdminTheme}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={businessAdminTheme}>
      <Box sx={{ 
        minHeight: '100vh', 
        bgcolor: 'background.default',
        py: { xs: 2, md: 3 },
        px: { xs: 2, md: 3 }
      }}>
        <Container maxWidth="xl" disableGutters>
          {/* Header */}
          <Box sx={{ mb: { xs: 3, md: 4 } }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              Sales Pipeline
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Manage your sales pipeline and track deal progress
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowCreateDialog(true)}
              >
                Create Pipeline
              </Button>
            </Stack>
          </Box>

          {/* Stats Cards */}
          <FlexGrid container spacing={3} sx={{ mb: 4 }}>
            <FlexGrid xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="div" gutterBottom>
                    Total Pipeline Value
                  </Typography>
                  <Typography variant="h4" component="div" color="success.main">
                    {formatCurrency(
                      pipelineData?.stage_summary ? 
                      Object.values(pipelineData.stage_summary).reduce((sum, stage) => sum + stage.value, 0) : 0
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {pipelineData?.stage_summary ? 
                      Object.values(pipelineData.stage_summary).reduce((sum, stage) => sum + stage.count, 0) : 0} active deals
                  </Typography>
                </CardContent>
              </Card>
            </FlexGrid>
            
            <FlexGrid xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="div" gutterBottom>
                    Active Deals
                  </Typography>
                  <Typography variant="h4" component="div" color="success.main">
                    {pipelineData?.stage_summary ? 
                      Object.values(pipelineData.stage_summary).reduce((sum, stage) => sum + stage.count, 0) : 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total active pipelines
                  </Typography>
                </CardContent>
              </Card>
            </FlexGrid>
            
            <FlexGrid xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="div" gutterBottom>
                    Conversion Rate
                  </Typography>
                  <Typography variant="h4" component="div" color="success.main">
                    {pipelineData?.stage_summary ? 
                      ((pipelineData.stage_summary.closed_won?.count || 0) / 
                      Math.max(Object.values(pipelineData.stage_summary).reduce((sum, stage) => sum + stage.count, 0), 1) * 100).toFixed(1) : 0}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Win rate
                  </Typography>
                </CardContent>
              </Card>
            </FlexGrid>
            
            <FlexGrid xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="div" gutterBottom>
                    Avg Deal Size
                  </Typography>
                  <Typography variant="h4" component="div" color="success.main">
                    {formatCurrency(
                      pipelineData?.stage_summary ? 
                      Object.values(pipelineData.stage_summary).reduce((sum, stage) => sum + stage.value, 0) / 
                      Math.max(Object.values(pipelineData.stage_summary).reduce((sum, stage) => sum + stage.count, 0), 1) : 0
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average deal value
                  </Typography>
                </CardContent>
              </Card>
            </FlexGrid>
          </FlexGrid>

          {/* Pipeline Stages */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" component="div" gutterBottom>
                Pipeline Stages
              </Typography>
              <FlexGrid container spacing={2}>
                {pipelineData?.stage_summary && Object.entries(pipelineData.stage_summary).map(([stage, data]) => (
                  <FlexGrid xs={12} sm={6} md={3} key={stage}>
                    <Card variant="outlined">
                      <CardContent>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="subtitle2" component="div">{data.name}</Typography>
                          <Chip label={data.count} variant="outlined" />
                        </Stack>
                        <Typography variant="h5" component="div" color="success.main">
                          {formatCurrency(data.value)}
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={data.percentage} 
                          sx={{ mt: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {data.percentage.toFixed(1)}% of total
                        </Typography>
                      </CardContent>
                    </Card>
                  </FlexGrid>
                ))}
              </FlexGrid>
            </CardContent>
          </Card>

          {/* Recent Pipelines */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" component="div" gutterBottom>
                Recent Pipelines
              </Typography>
              <Stack spacing={2}>
                {Array.isArray(pipelineData?.recent_pipelines) && pipelineData.recent_pipelines.map((pipeline) => (
                  <Stack direction="row" justifyContent="space-between" alignItems="center" key={pipeline.id} spacing={2} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Stack direction="column" spacing={0.5}>
                      <Typography variant="subtitle2" component="div">{pipeline.title}</Typography>
                      <Stack direction="row" spacing={1}>
                        <Chip label={pipelineStages.find(s => s.value === pipeline.stage)?.label} variant="outlined" />
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {pipeline.client.first_name} {pipeline.client.last_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Updated: {formatDate(pipeline.updated_at)}
                      </Typography>
                    </Stack>
                    <Stack direction="column" alignItems="flex-end" spacing={0.5}>
                      <Typography variant="subtitle2" component="div">
                        {formatCurrency(pipeline.expected_value)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {pipeline.probability}% probability
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <Select 
                        value={pipeline.stage} 
                        onChange={(e) => moveToStage(pipeline.id, e.target.value as string)}
                        size="small"
                      >
                        {pipelineStages.map((stage) => (
                          <MenuItem key={stage.value} value={stage.value}>
                            {stage.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </Stack>
                  </Stack>
                ))}
                {(!pipelineData?.recent_pipelines || pipelineData.recent_pipelines.length === 0) && (
                  <Typography variant="body2" color="text.secondary" align="center" py={4}>
                    No recent pipelines
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>

          {/* Upcoming Actions */}
          <Card>
            <CardContent>
              <Typography variant="h6" component="div" gutterBottom>
                Upcoming Actions
              </Typography>
              <Stack spacing={2}>
                {Array.isArray(pipelineData?.upcoming_actions) && pipelineData.upcoming_actions.map((action) => (
                  <Stack direction="row" justifyContent="space-between" alignItems="center" key={action.id} spacing={2} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Stack direction="column" spacing={0.5}>
                      <Typography variant="subtitle2" component="div">{action.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {action.client.first_name} {action.client.last_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {action.next_action}
                      </Typography>
                    </Stack>
                    <Stack direction="column" alignItems="flex-end" spacing={0.5}>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(action.next_action_date)}
                      </Typography>
                    </Stack>
                  </Stack>
                ))}
                {(!pipelineData?.upcoming_actions || pipelineData.upcoming_actions.length === 0) && (
                  <Typography variant="body2" color="text.secondary" align="center" py={4}>
                    No upcoming actions
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </ThemeProvider>
  );
} 