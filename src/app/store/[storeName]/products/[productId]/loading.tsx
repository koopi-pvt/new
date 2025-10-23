'use client';

import { PageLoader } from '@/components/ui/PageLoader';

export default function Loading() {
  return (
    <PageLoader 
      message="Loading product..." 
      primaryColor="#000000" 
      backgroundColor="#ffffff" 
    />
  );
}
