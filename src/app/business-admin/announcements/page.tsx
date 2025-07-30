'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
  Stack,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Divider,
  useTheme,
  useMediaQuery,
  Fade,
  Zoom
} from '@mui/material';
import {
  Announcement as AnnouncementIcon,
  Add as AddIcon,
  Message as MessageIcon,
  Pin as PinIcon,
  Warning as WarningIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

interface Announcement {
  id: number;
  title: string;
  content: string;
  announcement_type: string;
  priority: string;
  priority_color: string;
  is_pinned: boolean;
  is_active: boolean;
  requires_acknowledgment: boolean;
  publish_at: string;
  expires_at: string | null;
  author: {
    id: number;
    username: string;
    full_name: string;
    role: string;
  };
  created_at: string;
  updated_at: string;
  read_count: number;
  unread_count: number;
  is_read_by_current_user: boolean;
  is_acknowledged_by_current_user: boolean;
}

export default function BusinessAdminAnnouncementsPage() {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const announcementsResponse = await api.get('/announcements/announcements/');
      
      // Ensure we have an array of announcements
      const data = announcementsResponse.data;
      if (Array.isArray(data)) {
        setAnnouncements(data);
      } else if (data && Array.isArray(data.results)) {
        // If it's a paginated response
        setAnnouncements(data.results);
      } else if (data && Array.isArray(data.announcements)) {
        // If it's wrapped in an object
        setAnnouncements(data.announcements);
      } else {
        console.warn('Unexpected announcements data structure:', data);
        setAnnouncements([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'default';
      case 'medium':
        return 'info';
      case 'high':
        return 'warning';
      case 'urgent':
        return 'error';
      default:
        return 'info';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'system_wide':
        return 'secondary';
      case 'team_specific':
        return 'success';
      case 'store_specific':
        return 'info';
      case 'role_specific':
        return 'warning';
      default:
        return 'primary';
    }
  };

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
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {title}
              </Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: `${color}.main` }}>
                {value}
              </Typography>
            </Box>
            <Box 
              sx={{ 
                p: 1, 
                borderRadius: 2, 
                bgcolor: `${color}.light`, 
                color: `${color}.main`
              }}
            >
              {icon}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Zoom>
  );

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ bgcolor: 'grey.50' }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={64} />
          <Typography variant="h6" color="text.secondary">
            Loading announcements...
          </Typography>
        </Stack>
      </Box>
    );
  }

  // Ensure announcements is always an array
  const safeAnnouncements = Array.isArray(announcements) ? announcements : [];

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
                Communication & Announcements
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage system-wide announcements and team communications
              </Typography>
            </Box>
            <Stack direction="row" spacing={2} sx={{ flexShrink: 0 }}>
              <Tooltip title="Refresh data">
                <IconButton onClick={fetchData} color="primary">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ 
                  display: { xs: 'none', sm: 'flex' },
                  minWidth: 'fit-content'
                }}
              >
                New Announcement
              </Button>
              <Button
                variant="outlined"
                startIcon={<MessageIcon />}
                sx={{ 
                  display: { xs: 'none', sm: 'flex' },
                  minWidth: 'fit-content'
                }}
              >
                New Message
              </Button>
            </Stack>
          </Box>
          
          {/* Mobile Action Buttons */}
          <Box sx={{ display: { xs: 'flex', sm: 'none' }, gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
            >
              New Announcement
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<MessageIcon />}
            >
              New Message
            </Button>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <StatCard
              title="Total Announcements"
              value={safeAnnouncements.length}
              icon={<AnnouncementIcon />}
              color="primary"
            />
          </Box>
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <StatCard
              title="Active Announcements"
              value={safeAnnouncements.filter(a => a.is_active).length}
              icon={<PinIcon />}
              color="success"
            />
          </Box>
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <StatCard
              title="Pinned Announcements"
              value={safeAnnouncements.filter(a => a.is_pinned).length}
              icon={<PinIcon />}
              color="warning"
            />
          </Box>
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <StatCard
              title="Urgent Announcements"
              value={safeAnnouncements.filter(a => a.priority === 'urgent').length}
              icon={<WarningIcon />}
              color="error"
            />
          </Box>
        </Box>

        {/* Announcements List */}
        <Card elevation={2}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              All Announcements
            </Typography>
            
            {safeAnnouncements.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <AnnouncementIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  No announcements yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Create your first announcement to get started.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={3}>
                {safeAnnouncements.map((announcement) => (
                  <Fade in={true} key={announcement.id}>
                    <Card 
                      elevation={1}
                      sx={{ 
                        borderLeft: !announcement.is_read_by_current_user ? 4 : 0,
                        borderColor: !announcement.is_read_by_current_user ? 'primary.main' : 'transparent'
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {announcement.title}
                              </Typography>
                              {announcement.is_pinned && (
                                <PinIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                              )}
                              <Chip
                                label={announcement.priority}
                                color={getPriorityColor(announcement.priority) as any}
                                size="small"
                                sx={{ fontWeight: 500 }}
                              />
                              <Chip
                                label={announcement.announcement_type.replace('_', ' ')}
                                color={getTypeColor(announcement.announcement_type) as any}
                                size="small"
                                sx={{ fontWeight: 500 }}
                              />
                              {!announcement.is_active && (
                                <Chip
                                  label="Inactive"
                                  variant="outlined"
                                  size="small"
                                  sx={{ fontWeight: 500 }}
                                />
                              )}
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                              <Typography variant="body2" color="text.secondary">
                                By {announcement.author.full_name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {format(new Date(announcement.created_at), 'MMM dd, yyyy HH:mm')}
                              </Typography>
                              {announcement.requires_acknowledgment && (
                                <Chip
                                  label="Requires acknowledgment"
                                  color="warning"
                                  size="small"
                                  sx={{ fontWeight: 500 }}
                                />
                              )}
                            </Box>
                            
                            <Typography variant="body2" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                              {announcement.content}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PeopleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">
                                  {announcement.read_count} read
                                </Typography>
                              </Box>
                              {announcement.expires_at && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                  <Typography variant="caption" color="text.secondary">
                                    Expires: {format(new Date(announcement.expires_at), 'MMM dd, yyyy')}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Box>
                          
                          <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                            <Tooltip title="Edit announcement">
                              <IconButton size="small" color="primary">
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete announcement">
                              <IconButton size="small" color="error">
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </Box>
                      </CardContent>
                    </Card>
                  </Fade>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
} 