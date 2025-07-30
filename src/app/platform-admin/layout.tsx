import { ReactNode } from 'react';
import Sidebar, { SidebarNavItem } from '@/components/Sidebar';
import { Box, CssBaseline } from '@mui/material';

interface PlatformAdminLayoutProps {
  children: ReactNode;
}

const navItems: SidebarNavItem[] = [
  { label: 'Dashboard', href: '/platform-admin/dashboard' },
  { label: 'Sales Funnel', href: '/platform-admin/sales-funnel' },
  { label: 'Deploy CRM', href: '/platform-admin/deploy-crm' },
  { label: 'Analytics', href: '/platform-admin/analytics' },
  { label: 'Support', href: '/platform-admin/support' },
];

const PlatformAdminLayout: React.FC<PlatformAdminLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Sidebar navItems={navItems} title="Platform Admin" />
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
};

export default PlatformAdminLayout;