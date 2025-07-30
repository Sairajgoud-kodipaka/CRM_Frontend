'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText,
  Divider,
  ThemeProvider,
  createTheme
} from '@mui/material';
import { 
  Store as StoreIcon,
  Group as GroupIcon,
  Support as SupportIcon
} from '@mui/icons-material';

// Create a theme for business admin settings
const settingsTheme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    h5: {
      fontWeight: 600,
    },
    body1: {
      fontSize: '0.875rem',
    },
  },
  components: {
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          marginBottom: '4px',
          '&.Mui-selected': {
            backgroundColor: '#e3f2fd',
            color: '#1976d2',
            '&:hover': {
              backgroundColor: '#e3f2fd',
            },
          },
        },
      },
    },
  },
});

const navItems = [
  { 
    label: 'Stores', 
    href: '/business-admin/settings/stores',
    icon: <StoreIcon />
  },
  { 
    label: 'Team', 
    href: '/business-admin/settings/team',
    icon: <GroupIcon />
  },
  { 
    label: 'Support', 
    href: '/business-admin/support',
    icon: <SupportIcon />
  },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <ThemeProvider theme={settingsTheme}>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        <Box
          component="aside"
          sx={{
            width: 280,
            bgcolor: 'background.paper',
            borderRight: 1,
            borderColor: 'divider',
            p: 3,
          }}
        >
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            Settings
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <List sx={{ p: 0 }}>
            {navItems.map((item) => (
              <ListItem key={item.href} sx={{ p: 0, mb: 0.5 }}>
                <ListItemButton
                  component={Link}
                  href={item.href}
                  selected={pathname === item.href}
                  sx={{
                    borderRadius: 1,
                    '&.Mui-selected': {
                      bgcolor: 'primary.50',
                      color: 'primary.main',
                      '&:hover': {
                        bgcolor: 'primary.50',
                      },
                    },
                  }}
                >
                  <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                    {item.icon}
                  </Box>
                  <ListItemText 
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: pathname === item.href ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
        <Box
          component="main"
          sx={{
            flex: 1,
            p: 4,
            bgcolor: 'background.default',
          }}
        >
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
} 