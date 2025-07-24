import { ReactNode } from 'react';
import Sidebar, { SidebarNavItem } from '@/components/Sidebar';

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

export default function PlatformAdminLayout({ children }: PlatformAdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar navItems={navItems} title="Platform Admin" />
      <main className="flex-1 p-6 transition-all">
        {children}
      </main>
    </div>
  );
} 