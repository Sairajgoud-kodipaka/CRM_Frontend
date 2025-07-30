'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Typography, 
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Event as EventIcon,
  Assignment as AssignmentIcon,
  Announcement as AnnouncementIcon,
  Logout as LogoutIcon,
  Add as AddIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  Feedback as FeedbackIcon,
  BarChart as BarChartIcon,
  Group as GroupIcon,
  Storage as StorageIcon,
  ImportExport as ImportExportIcon,
  Store as StoreIcon,
  WhatsApp as WhatsAppIcon,
  ShoppingCart as ShoppingCartIcon,
  Inventory as InventoryIcon,
  Timeline as TimelineIcon,
  Segment as SegmentIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

export interface SidebarNavItem {
  label: string;
  href: string;
}

interface SidebarProps {
  navItems: SidebarNavItem[];
  title: string;
  addNewCustomerHref?: string;
}

const icons: Record<string, React.ReactNode> = {
  Dashboard: <DashboardIcon />,
  Customers: <PeopleIcon />,
  Appointments: <EventIcon />,
  'My Tasks': <AssignmentIcon />,
  Announcements: <AnnouncementIcon />,
  Logout: <LogoutIcon />,
  'Add New Customer': <AddIcon />,
  Escalations: <WarningIcon />,
  'Follow-ups': <RefreshIcon />,
  Feedback: <FeedbackIcon />,
  'Sales Funnel': <BarChartIcon />,
  'Team Management': <GroupIcon />,
  'Customer DB': <StorageIcon />,
  'Import/Export': <ImportExportIcon />,
  Stores: <StoreIcon />,
  WhatsApp: <WhatsAppIcon />,
  'E-commerce': <ShoppingCartIcon />,
  Catalogue: <InventoryIcon />,
  Pipeline: <TimelineIcon />,
  Segmentation: <SegmentIcon />,
  Settings: <SettingsIcon />,
};

export default function Sidebar({ navItems, title, addNewCustomerHref }: SidebarProps) {
  const [isClient, setIsClient] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => { setIsClient(true); }, []);

  let user = null;
  if (isClient) {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) user = JSON.parse(userStr);
    } catch {}
  }

  let greeting = '';
  if (isClient && user) {
    if (user.first_name) greeting = `Hi, ${user.first_name}!`;
    else if (user.username) greeting = `Hi, ${user.username}!`;
    else greeting = 'Hi there!';
  }

  let currentPath = '';
  if (isClient) {
    currentPath = window.location.pathname;
  }

  const drawerWidth = 256;

  const drawerContent = (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      bgcolor: '#374151', // Changed to gray color
      color: 'white',
      overflow: 'hidden', // Hide scrollbar
      '&::-webkit-scrollbar': {
        display: 'none', // Hide scrollbar for webkit browsers
      },
      msOverflowStyle: 'none', // Hide scrollbar for IE/Edge
      scrollbarWidth: 'none', // Hide scrollbar for Firefox
    }}>
      <Box sx={{ p: 3, pb: 2 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            fontWeight: 800, 
            color: 'white',
            mb: 1
          }}
        >
          {title}
        </Typography>
        {isClient && greeting && (
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'orange.200',
              fontWeight: 600
            }}
          >
            {greeting}
          </Typography>
        )}
      </Box>

      {/* Logout Button moved to top */}
      <Box sx={{ px: 3, pb: 2 }}>
        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton
            component={Link}
            href="/logout"
            sx={{
              borderRadius: 2,
              color: 'rgba(255, 255, 255, 0.8)',
              '&:hover': {
                color: 'white',
                backgroundColor: 'rgba(51, 65, 85, 1)',
              },
              '& .MuiListItemIcon-root': {
                color: 'inherit',
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {icons.Logout}
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', mx: 3, mb: 2 }} />

      <List sx={{ 
        flex: 1, 
        px: 1,
        overflow: 'auto',
        '&::-webkit-scrollbar': {
          display: 'none', // Hide scrollbar for webkit browsers
        },
        msOverflowStyle: 'none', // Hide scrollbar for IE/Edge
        scrollbarWidth: 'none', // Hide scrollbar for Firefox
      }}>
        {navItems.map((item) => {
          const isActive = currentPath === item.href;
          return (
            <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                href={item.href}
                sx={{
                  borderRadius: 2,
                  mx: 0.5,
                  color: isActive ? 'orange.200' : 'white',
                  backgroundColor: isActive ? 'rgba(75, 85, 99, 0.8)' : 'transparent',
                  fontWeight: isActive ? 700 : 500,
                  '&:hover': {
                    backgroundColor: isActive ? 'rgba(75, 85, 99, 0.9)' : 'rgba(51, 65, 85, 1)',
                    color: isActive ? 'orange.200' : 'white',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'inherit',
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {icons[item.label] || <Box sx={{ width: 20, height: 20 }} />}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontSize: '1rem',
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ p: 3, pt: 2 }}>
        {addNewCustomerHref && (
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              href={addNewCustomerHref}
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                '&:hover': {
                  color: 'white',
                },
                '& .MuiListItemIcon-root': {
                  color: 'inherit',
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {icons['Add New Customer']}
              </ListItemIcon>
              <ListItemText primary="Add New Customer" />
            </ListItemButton>
          </ListItem>
        )}

        <Typography 
          variant="caption" 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.4)',
            textAlign: 'center',
            display: 'block',
            mt: 4
          }}
        >
          © Jewelry CRM
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
} 