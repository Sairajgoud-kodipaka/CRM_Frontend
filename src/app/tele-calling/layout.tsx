import { ReactNode } from 'react';
import Sidebar, { SidebarNavItem } from '@/components/Sidebar';

interface TeleCallingLayoutProps {
  children: ReactNode;
}

const navItems: SidebarNavItem[] = [
  { label: 'Dashboard', href: '/tele-calling/dashboard' },
  { label: 'Sales Funnel', href: '/tele-calling/sales-funnel' },
  { label: 'Tele-calling', href: '/tele-calling/tele-calling' },
];

export default function TeleCallingLayout({ children }: TeleCallingLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar navItems={navItems} title="Tele-calling Team" />
      <main className="flex-1 p-6 transition-all">
        {children}
      </main>
    </div>
  );
} 