'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Container,
  Paper,
  CircularProgress,
  Stack,
  Divider,
  Link as MuiLink,
  useTheme,
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import api from '@/lib/api';
import Link from 'next/link';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[2],
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[4],
    transform: 'translateY(-2px)',
  }
}));

const StageCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.02),
  }
}));

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

export default function InhouseSalesPipelinePage() {
  const theme = useTheme();
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
    { value: 'lead', label: 'Lead', color: 'default' as const },
    { value: 'contacted', label: 'Contacted', color: 'primary' as const },
    { value: 'qualified', label: 'Qualified', color: 'warning' as const },
    { value: 'proposal', label: 'Proposal', color: 'secondary' as const },
    { value: 'negotiation', label: 'Negotiation', color: 'info' as const },
    { value: 'closed_won', label: 'Closed Won', color: 'success' as const },
    { value: 'closed_lost', label: 'Closed Lost', color: 'error' as const },
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
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStageColor = (stage: string) => {
    const stageConfig = pipelineStages.find(s => s.value === stage);
    return stageConfig?.color || 'default';
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
            Sales Pipeline & Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your sales pipeline and automate customer interactions
          </Typography>
        </Box>
        <Grid container spacing={3}>
          {[...Array(4)].map((_, i) => (
            <Grid item xs={12} md={3} key={i}>
              <Card sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 100 }}>
                  <CircularProgress />
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
          <Box>
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
              Sales Pipeline & Analytics
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your sales pipeline and automate customer interactions
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Link href="/inhouse-sales/dashboard" passHref>
              <Button variant="outlined" color="primary">
              View Dashboard
            </Button>
          </Link>
            <Button 
              variant="contained" 
              color="success"
              onClick={() => setShowCreateDialog(true)}
            >
                Create Pipeline
              </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Pipeline Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <StyledCard>
            <CardHeader 
              title={
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Total Pipeline Value
                </Typography>
              }
              sx={{ pb: 1 }}
            />
            <CardContent sx={{ pt: 0 }}>
              <Typography variant="h4" component="div" gutterBottom sx={{ fontWeight: 700 }}>
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
          </StyledCard>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <StyledCard>
            <CardHeader 
              title={
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Active Deals
                </Typography>
              }
              sx={{ pb: 1 }}
            />
            <CardContent sx={{ pt: 0 }}>
              <Typography variant="h4" component="div" gutterBottom sx={{ fontWeight: 700 }}>
              {pipelineData?.stage_summary ? 
                Object.values(pipelineData.stage_summary).reduce((sum, stage) => sum + stage.count, 0) : 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total active pipelines
              </Typography>
          </CardContent>
          </StyledCard>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <StyledCard>
            <CardHeader 
              title={
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Conversion Rate
                </Typography>
              }
              sx={{ pb: 1 }}
            />
            <CardContent sx={{ pt: 0 }}>
              <Typography variant="h4" component="div" gutterBottom sx={{ fontWeight: 700 }}>
              {pipelineData?.stage_summary ? 
                ((pipelineData.stage_summary.closed_won?.count || 0) / 
                 Math.max(Object.values(pipelineData.stage_summary).reduce((sum, stage) => sum + stage.count, 0), 1) * 100).toFixed(1) : 0}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Win rate
              </Typography>
          </CardContent>
          </StyledCard>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <StyledCard>
            <CardHeader 
              title={
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Avg Deal Size
                </Typography>
              }
              sx={{ pb: 1 }}
            />
            <CardContent sx={{ pt: 0 }}>
              <Typography variant="h4" component="div" gutterBottom sx={{ fontWeight: 700 }}>
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
          </StyledCard>
        </Grid>
      </Grid>

      {/* Pipeline Stages */}
      <StyledCard sx={{ mb: 4 }}>
        <CardHeader title={<Typography variant="h6" sx={{ fontWeight: 600 }}>Pipeline Stages</Typography>} />
        <CardContent>
          <Grid container spacing={2}>
            {pipelineData?.stage_summary && Object.entries(pipelineData.stage_summary).map(([stage, data]) => (
              <Grid item xs={12} sm={6} lg={3} key={stage}>
                <StageCard>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {data.name}
                    </Typography>
                    <Chip label={data.count} variant="outlined" size="small" />
                  </Stack>
                  <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 600, mb: 1 }}>
                  {formatCurrency(data.value)}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                  value={data.percentage} 
                    sx={{ mb: 1, height: 6, borderRadius: 3 }}
                />
                  <Typography variant="caption" color="text.secondary">
                  {data.percentage.toFixed(1)}% of total
                  </Typography>
                </StageCard>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </StyledCard>

      {/* Recent Pipelines */}
      <StyledCard sx={{ mb: 4 }}>
        <CardHeader title={<Typography variant="h6" sx={{ fontWeight: 600 }}>Recent Pipelines</Typography>} />
        <CardContent>
          <Stack spacing={2}>
            {Array.isArray(pipelineData?.recent_pipelines) && pipelineData.recent_pipelines.map((pipeline) => (
              <Paper key={pipeline.id} sx={{ p: 2, border: 1, borderColor: 'divider' }}>
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {pipeline.title}
                      </Typography>
                      <Chip 
                        label={pipelineStages.find(s => s.value === pipeline.stage)?.label}
                        color={getStageColor(pipeline.stage)}
                        size="small"
                      />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                    {pipeline.client.first_name} {pipeline.client.last_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                    Updated: {formatDate(pipeline.updated_at)}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                    <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 600 }}>
                    {formatCurrency(pipeline.expected_value)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                    {pipeline.probability}% probability
                    </Typography>
                  </Box>
                  <Box sx={{ minWidth: 140 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Stage</InputLabel>
                  <Select 
                    value={pipeline.stage} 
                        label="Stage"
                        onChange={(e) => moveToStage(pipeline.id, e.target.value)}
                  >
                      {pipelineStages.map((stage) => (
                          <MenuItem key={stage.value} value={stage.value}>
                          {stage.label}
                          </MenuItem>
                      ))}
                  </Select>
                    </FormControl>
                  </Box>
                </Stack>
              </Paper>
            ))}
            {(!pipelineData?.recent_pipelines || pipelineData.recent_pipelines.length === 0) && (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="body1" color="text.secondary">
                No recent pipelines
                </Typography>
              </Box>
            )}
          </Stack>
        </CardContent>
      </StyledCard>

      {/* Upcoming Actions */}
      <StyledCard>
        <CardHeader title={<Typography variant="h6" sx={{ fontWeight: 600 }}>Upcoming Actions</Typography>} />
        <CardContent>
          <Stack spacing={2}>
            {Array.isArray(pipelineData?.upcoming_actions) && pipelineData.upcoming_actions.map((action) => (
              <Paper key={action.id} sx={{ p: 2, border: 1, borderColor: 'divider' }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {action.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                    {action.client.first_name} {action.client.last_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {action.next_action}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {formatDate(action.next_action_date)}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            ))}
            {(!pipelineData?.upcoming_actions || pipelineData.upcoming_actions.length === 0) && (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="body1" color="text.secondary">
                No upcoming actions
                </Typography>
              </Box>
            )}
          </Stack>
        </CardContent>
      </StyledCard>

      {/* Create Pipeline Dialog */}
      <Dialog 
        open={showCreateDialog} 
        onClose={() => setShowCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Pipeline</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Title"
              fullWidth
              value={newPipeline.title}
              onChange={(e) => setNewPipeline(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter pipeline title"
            />
            
            <FormControl fullWidth>
              <InputLabel>Client</InputLabel>
              <Select
                value={newPipeline.client_id}
                label="Client"
                onChange={(e) => setNewPipeline(prev => ({ ...prev, client_id: e.target.value }))}
              >
                <MenuItem value="" disabled>
                  Select a client
                </MenuItem>
                {Array.isArray(clients) && clients.map((client) => (
                  <MenuItem key={client.id} value={client.id.toString()}>
                    {client.first_name} {client.last_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              label="Expected Value"
              type="number"
              fullWidth
              value={newPipeline.expected_value}
              onChange={(e) => setNewPipeline(prev => ({ ...prev, expected_value: e.target.value }))}
              placeholder="0.00"
            />
            
            <TextField
              label="Expected Close Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={newPipeline.expected_close_date}
              onChange={(e) => setNewPipeline(prev => ({ ...prev, expected_close_date: e.target.value }))}
            />
            
            <TextField
              label="Notes"
              multiline
              rows={3}
              fullWidth
              value={newPipeline.notes}
              onChange={(e) => setNewPipeline(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Enter any additional notes"
            />
            
            <Stack direction="row" justifyContent="flex-end" spacing={2}>
              <Button variant="outlined" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button variant="contained" onClick={createPipeline}>
                Create
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>
    </Container>
  );
} 