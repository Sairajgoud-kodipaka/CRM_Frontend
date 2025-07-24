import { ReactNode } from 'react';
import Sidebar, { SidebarNavItem } from '@/components/Sidebar';

interface ManagersLayoutProps {
  children: ReactNode;
}

const navItems: SidebarNavItem[] = [
  { label: 'Dashboard', href: '/managers/dashboard' },
  { label: 'Sales Funnel', href: '/managers/salesfunnel' },
  { label: 'Team Management', href: '/managers/team-management' },
  { label: 'Customer DB', href: '/managers/customer-db' },
];

export default function ManagersLayout({ children }: ManagersLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar navItems={navItems} title="Manager Dashboard" />
      <main className="flex-1 p-6 transition-all">
        {children}
      </main>
    </div>
  );
} 