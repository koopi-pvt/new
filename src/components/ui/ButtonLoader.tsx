'use client';

import React from 'react';

type ButtonLoaderProps = {
  color?: string;
  size?: 'sm' | 'md' | 'lg';
};

export function ButtonLoader({ color = '#ffffff', size = 'md' }: ButtonLoaderProps) {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-5 h-5 border-2',
    lg: 'w-6 h-6 border-3'
  };

  return (
    <div
      className={`${sizeMap[size]} rounded-full animate-spin`}
      style={{
        borderColor: color,
        borderTopColor: 'transparent'
      }}
    />
  );
}