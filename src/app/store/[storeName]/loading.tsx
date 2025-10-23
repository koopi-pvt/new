'use client';

import { UniversalLoader } from '@/components/ui/UniversalLoader';

export default function Loading() {
  return (
    <UniversalLoader 
      size="lg"
      primaryColor="#000000"
      backgroundColor="#ffffff"
      fullscreen={true}
      message="Loading store..."
    />
  );
}
