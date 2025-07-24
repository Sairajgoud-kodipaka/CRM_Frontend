import { ReactNode } from 'react';
import Sidebar, { SidebarNavItem } from '@/components/Sidebar';

interface InhouseSalesLayoutProps {
  children: ReactNode;
}

const navItems: SidebarNavItem[] = [
  { label: 'Dashboard', href: '/inhouse-sales/dashboard' },
  { label: 'Customers', href: '/inhouse-sales/customers' },
  { label: 'Appointments', href: '/inhouse-sales/appointments' },
  { label: 'My Tasks', href: '/inhouse-sales/tasks' },
  { label: 'Announcements', href: '/inhouse-sales/announcements' },
];

export default function InhouseSalesLayout({ children }: InhouseSalesLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar navItems={navItems} title="In-house Sales" addNewCustomerHref="/inhouse-sales/add-customer" />
      <main className="flex-1 p-6 transition-all">
        {children}
      </main>
    </div>
  );
} 