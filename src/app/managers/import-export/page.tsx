'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ManagersImportExportRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the correct import/export page
    router.replace('/managers/customers/import-export');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-blue-600 font-semibold mb-2">Redirecting...</div>
        <div className="text-gray-600">Taking you to the Import/Export page</div>
      </div>
    </div>
  );
} 