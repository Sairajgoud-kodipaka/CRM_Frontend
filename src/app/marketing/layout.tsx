import { ReactNode } from 'react';
import Sidebar, { SidebarNavItem } from '@/components/Sidebar';
import { Box, CssBaseline } from '@mui/material';

interface MarketingLayoutProps {
  children: ReactNode;
}

const navItems: SidebarNavItem[] = [
  { label: 'Dashboard', href: '/marketing/dashboard' },
  { label: 'E-commerce', href: '/marketing/ecom' },
  { label: 'WhatsApp', href: '/marketing/whatsapp' },
];

const MarketingLayout: React.FC<MarketingLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Sidebar navItems={navItems} title="Marketing Team" />
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

export default MarketingLayout; 