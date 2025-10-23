'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

type Theme = {
  primaryColor: string;
  accentColor: string;
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: string;
};

type StoreHeaderProps = {
  storeName?: string;
  theme?: Theme;
  logo?: string;
};

export function StoreHeader({ storeName, theme, logo }: StoreHeaderProps) {
  const headerStyle = {
    backgroundColor: theme ? `${theme.backgroundColor}f0` : '#ffffff',
    borderColor: theme ? `${theme.textColor}20` : '#e5e5e5',
    color: theme ? theme.textColor : '#000000',
  };

  return (
    <header className="fixed top-0 w-full z-50 border-b backdrop-blur-xl bg-white/80" style={headerStyle}>
      <nav className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href={storeName ? `/store/${storeName}` : '/'} className="flex items-center gap-2 text-xl font-semibold">
              {logo ? (
                <img src={logo} alt={storeName} className="h-8 object-contain" />
              ) : (
                <>
                  <ShoppingBag className="w-6 h-6" />
                  <span>{storeName ? storeName : 'Koopi'}</span>
                </>
              )}
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href={storeName ? `/store/${storeName}` : '/'} className="text-sm font-medium transition-opacity hover:opacity-70">
              Back to Store
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}