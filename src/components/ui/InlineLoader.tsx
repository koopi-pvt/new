'use client';

import React from 'react';
import { UniversalLoader } from './UniversalLoader';

type InlineLoaderProps = {
  message?: string;
  primaryColor?: string;
  size?: 'sm' | 'md' | 'lg';
};

export function InlineLoader({ 
  message = '', 
  primaryColor = '#000000',
  size = 'sm'
}: InlineLoaderProps) {
  return (
    <UniversalLoader
      fullscreen
      size={size}
      primaryColor={primaryColor}
      backgroundColor="#f5f5f7"
      message={message}
    />
  );
}