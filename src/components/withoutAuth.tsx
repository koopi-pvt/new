'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { PageLoader } from './ui/PageLoader';

const withoutAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  const Wrapper = (props: P) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && user) {
        router.push('/dashboard');
      }
    }, [user, loading, router]);

    if (loading || user) {
      return <PageLoader message="Redirecting..." primaryColor="#000000" backgroundColor="#ffffff" />;
    }

    return <WrappedComponent {...props} />;
  };

  return Wrapper;
};

export default withoutAuth;