import { ReactNode } from 'react';
import Sidebar, { SidebarNavItem } from '@/components/Sidebar';
import { Box } from '@mui/material';

interface BusinessAdminLayoutProps {
  children: ReactNode;
}

const navItems: SidebarNavItem[] = [
  { label: 'Dashboard', href: '/business-admin/dashboard' },
  { label: 'Team Management', href: '/business-admin/team-management' },
  { label: 'Stores', href: '/business-admin/stores' },
  { label: 'Customers', href: '/business-admin/customers' },
  { label: 'Announcements', href: '/business-admin/announcements' },
  { label: 'WhatsApp', href: '/business-admin/whatsapp' },
  { label: 'E-commerce', href: '/business-admin/ecommerce' },
  { label: 'Catalogue', href: '/business-admin/catalogue' },
  { label: 'Pipeline', href: '/business-admin/pipeline' },
  { label: 'Segmentation', href: '/business-admin/segmentation' },
  { label: 'Import/Export', href: '/business-admin/customers/import-export' },
  { label: 'Settings', href: '/business-admin/settings' },
];

export default function BusinessAdminLayout({ children }: BusinessAdminLayoutProps) {
  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'grey.50', 
      display: 'flex' 
    }}>
      <Sidebar navItems={navItems} title="Business Admin" />
      <Box component="main" sx={{ 
        flex: 1, 
        p: 3,
        transition: 'all 0.3s ease'
      }}>
        {children}
      </Box>
    </Box>
  );
} 