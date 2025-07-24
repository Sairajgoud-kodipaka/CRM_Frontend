'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

export interface SidebarNavItem {
  label: string;
  href: string;
}

interface SidebarProps {
  navItems: SidebarNavItem[];
  title: string;
  addNewCustomerHref?: string;
}

const icons: Record<string, React.ReactNode> = {
  Dashboard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5V6.75A2.25 2.25 0 015.25 4.5h13.5A2.25 2.25 0 0121 6.75v6.75m-18 0v6.75A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 19.5v-6m-18 0h18" /></svg>
  ),
  Customers: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4.13a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
  ),
  Appointments: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="2" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 7v2m8-2v2M3 11h18" /></svg>
  ),
  'My Tasks': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="2" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6M9 11h6M9 15h2" /></svg>
  ),
  Announcements: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7v4a2 2 0 01-2 2H7a2 2 0 01-2-2V7" /><path strokeLinecap="round" strokeLinejoin="round" d="M5 7V5a2 2 0 012-2h10a2 2 0 012 2v2" /></svg>
  ),
  Logout: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" /></svg>
  ),
  'Add New Customer': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
  ),
};

export default function Sidebar({ navItems, title, addNewCustomerHref }: SidebarProps) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  let user = null;
  if (isClient) {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) user = JSON.parse(userStr);
    } catch {}
  }

  let greeting = '';
  if (isClient && user) {
    if (user.first_name) greeting = `Hi, ${user.first_name}!`;
    else if (user.username) greeting = `Hi, ${user.username}!`;
    else greeting = 'Hi there!';
  }

  let currentPath = '';
  if (isClient) {
    currentPath = window.location.pathname;
  }

  return (
    <aside className="min-h-screen w-64 bg-blue-800 text-white flex flex-col justify-between py-6 px-0">
      <div>
        <div className="px-6 mb-8">
          <span className="text-2xl font-extrabold tracking-tight text-white block mb-2">{title}</span>
          {isClient && greeting && (
            <span className="block text-lg font-semibold text-orange-200 mt-1">{greeting}</span>
          )}
        </div>
        <nav className="flex flex-col gap-1 px-2">
          {navItems.map((item) => {
            const isActive = currentPath === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-6 py-2 rounded-lg font-medium transition-all duration-150 text-base
                  ${isActive ? 'bg-[#4b5563]/80 text-orange-200 font-bold' : 'hover:bg-[#334155] hover:text-white/90 text-white/80'}`}
              >
                <span>{icons[item.label] || <span className="w-5 h-5" />}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="px-6 mt-8">
        <div className="border-t border-white/10 my-4" />
        <Link href="/logout" className="flex items-center gap-3 text-white/80 hover:text-white font-medium mb-4">
          <span>{icons.Logout}</span>
          <span>Logout</span>
        </Link>
        {addNewCustomerHref && (
          <Link href={addNewCustomerHref} className="flex items-center gap-2 text-white/80 hover:text-white py-2">
            <span>{icons['Add New Customer']}</span>
            <span>Add New Customer</span>
          </Link>
        )}
        <div className="text-xs text-white/40 mt-8 text-center">© Jewelry CRM</div>
      </div>
    </aside>
  );
} 