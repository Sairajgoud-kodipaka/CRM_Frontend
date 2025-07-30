import { ReactNode } from 'react';
import { Box, CssBaseline } from '@mui/material';
import Sidebar, { SidebarNavItem } from '@/components/Sidebar';

interface TeleCallingLayoutProps {
  children: ReactNode;
}

const navItems: SidebarNavItem[] = [
  { label: 'Dashboard', href: '/tele-calling/dashboard' },
  { label: 'Sales Funnel', href: '/tele-calling/sales-funnel' },
  { label: 'Tele-calling', href: '/tele-calling/tele-calling' },
  { label: 'Assignments', href: '/tele-calling/assignments' },
];

export default function TeleCallingLayout({ children }: TeleCallingLayoutProps) {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Sidebar navItems={navItems} title="Tele-calling Team" />
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