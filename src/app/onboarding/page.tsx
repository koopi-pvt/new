"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageLoader } from '@/components/ui/PageLoader';

// Redirect to launchpad - onboarding logic has been moved there
export default function OnboardingRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.push('/launchpad');
  }, [router]);

  return <PageLoader message="Redirecting to setup..." />;
}
