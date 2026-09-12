'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StaffPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard/employees');
  }, [router]);

  return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
      Loading Staff Directory...
    </div>
  );
}
