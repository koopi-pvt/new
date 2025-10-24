'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { PageLoader } from './ui/PageLoader';

const withOnboarding = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  const Wrapper = (props: P) => {
    const { user, userProfile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (loading) return;

      if (!user) {
        router.push('/login');
        return;
      }

      // If user doesn't have onboarding completed, redirect to signup
      if (userProfile && !userProfile.onboarding?.isCompleted) {
        router.push('/signup');
      }
    }, [user, userProfile, loading, router]);

    if (loading || !userProfile) {
      return <PageLoader message="Verifying your details..." />;
    }

    // If onboarding is complete, render the component
    if (userProfile.onboarding?.isCompleted) {
      return <WrappedComponent {...props} />;
    }

    return <PageLoader message="Redirecting to complete setup..." />;
  };

  return Wrapper;
};

export default withOnboarding;