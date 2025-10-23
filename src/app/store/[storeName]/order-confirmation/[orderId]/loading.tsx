'use client';

import { PageLoader } from '@/components/ui/PageLoader';

export default function Loading() {
  return (
    <PageLoader 
      message="Loading order details..." 
      primaryColor="#000000" 
      backgroundColor="#f9fafb" 
    />
  );
}
