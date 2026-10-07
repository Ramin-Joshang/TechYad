'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export function ReferralCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams?.get('ref');
    if (ref && typeof window !== 'undefined') {
      const cleanRef = ref.trim().toUpperCase();
      try {
        localStorage.setItem('tecyad_referral_code', cleanRef);
        // Also set cookie valid for 30 days
        document.cookie = `tecyad_referral_code=${cleanRef}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
      } catch (e) {
        // ignore storage errors
      }
    }
  }, [searchParams]);

  return null;
}
