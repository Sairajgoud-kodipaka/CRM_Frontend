import { ReactNode } from 'react';
import Sidebar, { SidebarNavItem } from '@/components/Sidebar';

interface BusinessAdminLayoutProps {
  children: ReactNode;
}

const navItems: SidebarNavItem[] = [
  { label: 'Dashboard', href: '/business-admin/dashboard' },
  { label: 'Team Management', href: '/business-admin/team-management' },
  { label: 'Stores', href: '/business-admin/stores' },
  { label: 'WhatsApp', href: '/business-admin/whatsapp' },
  { label: 'E-commerce', href: '/business-admin/ecommerce' },
  { label: 'Catalogue', href: '/business-admin/catalogue' },
  { label: 'Pipeline', href: '/business-admin/pipeline' },
  { label: 'Segmentation', href: '/business-admin/segmentation' },
  { label: 'Settings', href: '/business-admin/settings' },
];

export default function BusinessAdminLayout({ children }: BusinessAdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar navItems={navItems} title="Business Admin" />
      <main className="flex-1 p-6 transition-all">
        {children}
      </main>
    </div>
  );
} 