"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { storesAPI, usersAPI } from "@/lib/api";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  Fade,
  Zoom,
  Grid
} from '@mui/material';
import {
  Store as StoreIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Dashboard as DashboardIcon,
  Refresh as RefreshIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';

export default function StoreListPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [managerNames, setManagerNames] = useState<Record<number, string>>({});

  const fetchStores = async () => {
    setLoading(true);
    try {
      const data = await storesAPI.getStores();
      let storeArr = Array.isArray(data) ? data : (data && Array.isArray(data.results) ? data.results : []);
      setStores(storeArr);
      // Fetch all users and map manager IDs to names
      const usersData = await usersAPI.getUsers();
      const usersArr = Array.isArray(usersData) ? usersData : (usersData && Array.isArray(usersData.results) ? usersData.results : []);
      const nameMap: Record<number, string> = {};
      usersArr.forEach((user: any) => {
        nameMap[user.id] = user.first_name ? `${user.first_name} ${user.last_name || ''}` : user.username || user.id;
      });
      setManagerNames(nameMap);
      setError(null);
    } catch (err: any) {
      setError("Failed to load stores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color = 'primary' 
  }: {
    title: string;
    value: number;
    icon: React.ReactNode;
    color?: string;
  }) => (
    <Zoom in={true} style={{ transitionDelay: '100ms' }}>
      <Card elevation={2} sx={{ height: '100%' }}>
        <CardContent sx={{ p: 3, textAlign: 'center' }}>
          <Box 
            sx={{ 
              p: 1, 
              borderRadius: 2, 
              bgcolor: `${color}.light`, 
              color: `${color}.main`,
              display: 'inline-flex',
              mb: 2
            }}
          >
            {icon}
          </Box>
          <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 1 }}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </CardContent>
      </Card>
    </Zoom>
  );

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'grey.50',
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
                Stores
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage your jewelry store locations and operations
              </Typography>
            </Box>
            <Stack direction="row" spacing={2} sx={{ flexShrink: 0 }}>
              <Tooltip title="Refresh data">
                <IconButton onClick={fetchStores} color="primary">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                component={Link}
                href="/business-admin/stores/create"
                sx={{ 
                  display: { xs: 'none', sm: 'flex' },
                  minWidth: 'fit-content'
                }}
              >
                Add Store
              </Button>
            </Stack>
          </Box>
          
          {/* Mobile Action Buttons */}
          <Box sx={{ display: { xs: 'flex', sm: 'none' }, gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              component={Link}
              href="/business-admin/stores/create"
            >
              Add Store
            </Button>
          </Box>
        </Box>

        {/* Store Stats */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <StatCard
                title="Total Stores"
                value={stores.length}
                icon={<StoreIcon />}
                color="primary"
              />
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <StatCard
                title="Active Stores"
                value={stores.filter(store => store.is_active).length}
                icon={<LocationIcon />}
                color="success"
              />
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <StatCard
                title="Inactive Stores"
                value={stores.filter(store => !store.is_active).length}
                icon={<StoreIcon />}
                color="warning"
              />
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <StatCard
                title="With Managers"
                value={stores.filter(store => store.manager).length}
                icon={<DashboardIcon />}
                color="info"
              />
            </Box>
          </Box>
        </Box>

        {/* Stores Table */}
        <Card elevation={2}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            {loading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Loading stores...
                </Typography>
              </Box>
            ) : error ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
                <Button onClick={fetchStores} variant="outlined">
                  Try again
                </Button>
              </Box>
            ) : stores.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <StoreIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  No stores found.
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Add your first store to get started
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Manager</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stores.map((store) => (
                      <Fade in={true} key={store.id}>
                        <TableRow hover>
                          <TableCell>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {store.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {store.code}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2">
                                {store.city}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {store.state}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {store.manager ? managerNames[Number(store.manager)] || store.manager : "-"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={store.is_active ? "Active" : "Inactive"}
                              color={store.is_active ? "success" : "default"}
                              size="small"
                              sx={{ fontWeight: 500 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Tooltip title="Edit store">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  component={Link}
                                  href={`/business-admin/stores/${store.id}/edit`}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Store dashboard">
                                <IconButton
                                  size="small"
                                  color="info"
                                  component={Link}
                                  href={`/business-admin/stores/${store.id}/dashboard`}
                                >
                                  <DashboardIcon />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      </Fade>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
} 