'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AssignExamPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/exams');
  }, [router]);

  return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
      Loading Exam Assignments...
    </div>
  );
}
