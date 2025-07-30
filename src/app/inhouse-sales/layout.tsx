import { ReactNode } from 'react';
import Sidebar, { SidebarNavItem } from '@/components/Sidebar';
import { Box } from '@mui/material';

interface InhouseSalesLayoutProps {
  children: ReactNode;
}

const navItems: SidebarNavItem[] = [
  { label: 'Dashboard', href: '/inhouse-sales/dashboard' },
  { label: 'Customers', href: '/inhouse-sales/customers' },
  { label: 'Pipeline', href: '/inhouse-sales/pipeline' },
  { label: 'Appointments', href: '/inhouse-sales/appointments' },
  { label: 'Follow-ups', href: '/inhouse-sales/follow-ups' },
  { label: 'My Tasks', href: '/inhouse-sales/tasks' },
  { label: 'Escalations', href: '/inhouse-sales/escalation' },
  { label: 'Feedback', href: '/inhouse-sales/feedback' },
  { label: 'Announcements', href: '/inhouse-sales/announcements' },
];

export default function InhouseSalesLayout({ children }: InhouseSalesLayoutProps) {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', display: 'flex' }}>
      <Sidebar navItems={navItems} title="In-house Sales" addNewCustomerHref="/inhouse-sales/add-customer" />
      <Box 
        component="main" 
        sx={{ 
          flex: 1, 
          p: 3, 
          transition: 'all 0.3s ease',
          overflow: 'auto'
        }}
      >
        {children}
      </Box>
    </Box>
  );
} 