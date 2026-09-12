'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StaffLoginsPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard/audit-logs');
  }, [router]);

  return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
      Loading Staff Logins & Security Trail...
    </div>
  );
}
