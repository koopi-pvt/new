'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { PageLoader } from './ui/PageLoader';

const withAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  const Wrapper = (props: P) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.push('/login');
      }
    }, [user, loading, router]);

    if (loading || !user) {
      return <PageLoader message="Loading..." primaryColor="#000000" backgroundColor="#f1f1f1" />;
    }

    return <WrappedComponent {...props} />;
  };

  return Wrapper;
};

export default withAuth;