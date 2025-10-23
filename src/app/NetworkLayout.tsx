'use client';

import { usePathname } from 'next/navigation';
import { useNetwork } from '@/contexts/NetworkContext';
import NetworkError from '@/components/ui/NetworkError';

export default function NetworkLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isOnline } = useNetwork();

  const excludedPaths = ['/', '/login', '/signup'];
  const isExcluded = excludedPaths.includes(pathname);

  if (!isOnline && !isExcluded) {
    return <NetworkError />;
  }

  return <>{children}</>;
}