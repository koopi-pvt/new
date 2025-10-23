'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type CartItem = {
  id: string; 
  productId: string;
  storeId: string;
  storeName: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  variant?: { [key: string]: string };
};

export type AppliedDiscount = {
  promotionId: string;
  code: string;
  discountType: 'percentage' | 'fixed' | 'free_shipping';
  discountValue: number;
  discountAmount: number;
};

type CartContextType = {
  items: CartItem[];
  appliedDiscount: AppliedDiscount | null;
  addToCart: (item: Omit<CartItem, 'quantity' | 'id'>, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  getDiscount: () => number;
  getTotal: () => number;
  applyDiscount: (discount: AppliedDiscount) => void;
  removeDiscount: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'koopi_cart';
const DISCOUNT_STORAGE_KEY = 'koopi_discount';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedDiscount, setAppliedDiscount] = useState<AppliedDiscount | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart) as CartItem[];
        const sanitizedCart = parsedCart.map(item => ({
          ...item,
          price: typeof item.price === 'number' ? item.price : 0,
        }));
        setItems(sanitizedCart);
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
    
    const savedDiscount = localStorage.getItem(DISCOUNT_STORAGE_KEY);
    if (savedDiscount) {
      try {
        setAppliedDiscount(JSON.parse(savedDiscount));
      } catch (error) {
        console.error('Error loading discount:', error);
      }
    }
    
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isLoaded]);

  // Save discount to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      if (appliedDiscount) {
        localStorage.setItem(DISCOUNT_STORAGE_KEY, JSON.stringify(appliedDiscount));
      } else {
        localStorage.removeItem(DISCOUNT_STORAGE_KEY);
      }
    }
  }, [appliedDiscount, isLoaded]);

  const generateCartItemId = (productId: string, variant?: { [key: string]: string }) => {
    if (!variant || Object.keys(variant).length === 0) {
      return productId;
    }
    // Sort keys for consistent ID generation
    const variantString = Object.entries(variant)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([key, value]) => `${key}:${value}`)
      .join('|');
    return `${productId}-${variantString}`;
  };

  const addToCart = (item: Omit<CartItem, 'quantity' | 'id'>, quantity: number = 1) => {
    const newItemId = generateCartItemId(item.productId, item.variant);

    setItems((currentItems) => {
      const existingItem = currentItems.find((i) => i.id === newItemId);

      if (existingItem) {
        // Update quantity if item with same variant already exists
        return currentItems.map((i) =>
          i.id === newItemId
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      } else {
        // Add new item
        const newItem = { ...item, id: newItemId, quantity };
        return [...currentItems, newItem];
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedDiscount(null);
  };

  const getItemCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getSubtotal = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getDiscount = () => {
    if (!appliedDiscount) return 0;
    
    const subtotal = getSubtotal();
    
    if (appliedDiscount.discountType === 'percentage') {
      return (subtotal * appliedDiscount.discountValue) / 100;
    } else if (appliedDiscount.discountType === 'fixed') {
      return Math.min(appliedDiscount.discountValue, subtotal);
    }
    
    return 0;
  };

  const getTotal = () => {
    const subtotal = getSubtotal();
    const discount = getDiscount();
    return Math.max(0, subtotal - discount);
  };

  const applyDiscount = (discount: AppliedDiscount) => {
    setAppliedDiscount(discount);
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        appliedDiscount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getItemCount,
        getSubtotal,
        getDiscount,
        getTotal,
        applyDiscount,
        removeDiscount,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
