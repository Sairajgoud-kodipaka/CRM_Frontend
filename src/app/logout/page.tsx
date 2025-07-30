'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();
  useEffect(() => {
    // TODO: Add logout logic here (clear auth/session if needed)
    router.replace('/select-role');
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-lg text-gray-700">Logging out...</div>
    </div>
  );
} 