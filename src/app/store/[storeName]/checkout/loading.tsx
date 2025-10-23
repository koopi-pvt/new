'use client';

import { PageLoader } from '@/components/ui/PageLoader';

export default function Loading() {
  return (
    <PageLoader 
      message="Loading checkout..." 
      primaryColor="#000000" 
      backgroundColor="#f9fafb" 
    />
  );
}
