import Link from 'next/link';

const navItems = [
  { label: 'Stores', href: '/business-admin/settings/stores' },
  { label: 'Team', href: '/business-admin/settings/team' },
  { label: 'Tags & Segments', href: '/business-admin/settings/tags' },
  { label: 'Notifications', href: '/business-admin/settings/notifications' },
  { label: 'Branding', href: '/business-admin/settings/branding' },
  { label: 'Legal & Policies', href: '/business-admin/settings/legal' },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r p-6">
        <h2 className="text-xl font-bold mb-6">Settings</h2>
        <nav className="flex flex-col gap-3">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="text-gray-700 hover:text-blue-700 font-medium px-2 py-1 rounded hover:bg-blue-50"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
} 