import { ReactNode } from 'react';
import Sidebar, { SidebarNavItem } from '@/components/Sidebar';

interface MarketingLayoutProps {
  children: ReactNode;
}

const navItems: SidebarNavItem[] = [
  { label: 'Dashboard', href: '/marketing/dashboard' },
  { label: 'E-commerce', href: '/marketing/ecom' },
  { label: 'WhatsApp', href: '/marketing/whatsapp' },
];

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar navItems={navItems} title="Marketing Team" />
      <main className="flex-1 p-6 transition-all">
        {children}
      </main>
    </div>
  );
} 