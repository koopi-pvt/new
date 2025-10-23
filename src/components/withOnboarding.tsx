'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { PageLoader } from './ui/PageLoader';

const withOnboarding = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  const Wrapper = (props: P) => {
    const { user, userProfile, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
      if (loading) return;

      if (!user) {
        router.push('/login');
        return;
      }

      if (userProfile) {
        const isOnboardingComplete = userProfile.onboarding?.isCompleted;
        const isOnboardingPage = pathname === '/onboarding';

        if (isOnboardingComplete && isOnboardingPage) {
          router.push('/dashboard');
        } else if (!isOnboardingComplete && !isOnboardingPage) {
          router.push('/onboarding');
        }
      }
    }, [user, userProfile, loading, router, pathname]);

    if (loading || !userProfile) {
      return <PageLoader message="Verifying your details..." />;
    }

    // Render children if the routing conditions are met
    const isOnboardingComplete = userProfile.onboarding?.isCompleted;
    const isOnboardingPage = pathname === '/onboarding';

    if (isOnboardingComplete && !isOnboardingPage) {
      return <WrappedComponent {...props} />;
    }
    
    if (!isOnboardingComplete && isOnboardingPage) {
      return <WrappedComponent {...props} />;
    }

    return <PageLoader message="Redirecting..." />;
  };

  return Wrapper;
};

export default withOnboarding;