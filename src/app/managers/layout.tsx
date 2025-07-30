import { ReactNode } from 'react';
import Sidebar, { SidebarNavItem } from '@/components/Sidebar';
import { Box, CssBaseline } from '@mui/material';

interface ManagersLayoutProps {
  children: ReactNode;
}

const navItems: SidebarNavItem[] = [
  { label: 'Dashboard', href: '/managers/dashboard' },
  { label: 'Sales Funnel', href: '/managers/salesfunnel' },
  { label: 'Team Management', href: '/managers/team-management' },
  { label: 'Customer DB', href: '/managers/customer-db' },
  { label: 'Escalations', href: '/managers/escalations' },
  { label: 'Import/Export', href: '/managers/import-export' },
];

export default function ManagersLayout({ children }: ManagersLayoutProps) {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Sidebar navItems={navItems} title="Manager Dashboard" />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: '#fafafa',
          minHeight: '100vh'
        }}
      >
        {children}
      </Box>
    </Box>
  );
}



