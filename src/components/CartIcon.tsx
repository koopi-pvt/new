'use client';

import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

type CartIconProps = {
  className?: string;
  iconColor?: string;
  badgeColor?: string;
};

export default function CartIcon({ className, iconColor = '#000000', badgeColor = '#000000' }: CartIconProps) {
  const { getItemCount, setIsCartOpen } = useCart();
  const itemCount = getItemCount();

  return (
    <button
      onClick={() => setIsCartOpen(true)}
      className={`relative p-2 rounded-full hover:bg-gray-100/50 transition-colors ${className}`}
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      <ShoppingCart className="w-5 h-5" style={{ color: iconColor }} />
      {itemCount > 0 && (
        <span
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center shadow-md"
          style={{ backgroundColor: badgeColor }}
        >
          {itemCount > 9 ? '9+' : itemCount}
        </span>
      )}
    </button>
  );
}
