'use client';

import React, { useState } from 'react';
import { Tag, Check, AlertCircle, Loader2 } from 'lucide-react';
import { db } from '@/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { Promotion } from '@/types';

interface DiscountCodeInputProps {
  storeId: string;
  storeName: string;
  cartSubtotal: number;
  cartItems: Array<{ productId: string; createdAt?: any }>;
  onDiscountApplied: (discount: {
    promotionId: string;
    code: string;
    discountType: 'percentage' | 'fixed' | 'free_shipping';
    discountValue: number;
    discountAmount: number;
  }) => void;
  currentDiscount?: {
    code: string;
    discountAmount: number;
  } | null;
  onDiscountRemoved: () => void;
}

export default function DiscountCodeInput({
  storeId,
  storeName,
  cartSubtotal,
  cartItems,
  onDiscountApplied,
  currentDiscount,
  onDiscountRemoved,
}: DiscountCodeInputProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateAndApplyCode = async () => {
    if (!code.trim()) {
      setError('Please enter a discount code');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Query for promotion by code and storeId
      const q = query(
        collection(db, 'promotions'),
        where('storeId', '==', storeId),
        where('code', '==', code.toUpperCase())
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError('Invalid discount code');
        setLoading(false);
        return;
      }

      const promoDoc = snapshot.docs[0];
      const promo = { id: promoDoc.id, ...promoDoc.data() } as Promotion;

      // Validate promotion
      const now = new Date();

      // Check if active
      if (!promo.isActive) {
        setError('This discount code is not active');
        setLoading(false);
        return;
      }

      // Check start date
      if (promo.conditions.startDate && promo.conditions.startDate.toDate() > now) {
        setError('This discount code is not yet valid');
        setLoading(false);
        return;
      }

      // Check end date
      if (promo.conditions.endDate && promo.conditions.endDate.toDate() < now) {
        setError('This discount code has expired');
        setLoading(false);
        return;
      }

      // Check total usage limit
      if (promo.conditions.maxTotalUses && promo.currentUses >= promo.conditions.maxTotalUses) {
        setError('This discount code has reached its usage limit');
        setLoading(false);
        return;
      }

      // Check minimum purchase amount
      if (promo.conditions.minPurchaseAmount && cartSubtotal < promo.conditions.minPurchaseAmount) {
        setError(`Minimum purchase of LKR ${promo.conditions.minPurchaseAmount.toFixed(2)} required`);
        setLoading(false);
        return;
      }

      // Check if applies to specific products
      if (promo.applicationType === 'specific_products' && promo.applicableProductIds) {
        const cartProductIds = cartItems.map(item => item.productId);
        const hasApplicableProduct = cartProductIds.some(id => 
          promo.applicableProductIds?.includes(id)
        );
        
        if (!hasApplicableProduct) {
          setError('This code does not apply to items in your cart');
          setLoading(false);
          return;
        }
      }

      // Check if only for new products (if flag is set)
      if (promo.conditions.newProductsOnly) {
        // Consider products created in the last 30 days as "new"
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const hasNewProduct = cartItems.some(item => {
          if (item.createdAt) {
            const productDate = item.createdAt.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
            return productDate >= thirtyDaysAgo;
          }
          return false;
        });

        if (!hasNewProduct) {
          setError('This code only applies to new products');
          setLoading(false);
          return;
        }
      }

      // Calculate discount amount
      let discountAmount = 0;
      
      if (promo.discountType === 'percentage') {
        discountAmount = (cartSubtotal * promo.discountValue) / 100;
      } else if (promo.discountType === 'fixed') {
        discountAmount = Math.min(promo.discountValue, cartSubtotal);
      } else if (promo.discountType === 'free_shipping') {
        // Free shipping - this will be handled in checkout
        discountAmount = 0;
      }

      // Apply discount
      onDiscountApplied({
        promotionId: promo.id,
        code: promo.code,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        discountAmount,
      });

      setSuccess(`Discount applied! You saved LKR ${discountAmount.toFixed(2)}`);
      setCode('');
      setLoading(false);
    } catch (err) {
      console.error('Error applying discount:', err);
      setError('Failed to apply discount code');
      setLoading(false);
    }
  };

  const handleRemove = () => {
    onDiscountRemoved();
    setSuccess('');
    setError('');
  };

  if (currentDiscount) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-green-900">
                Code "{currentDiscount.code}" applied!
              </p>
              <p className="text-xs text-green-700">
                You saved LKR {currentDiscount.discountAmount.toFixed(2)}
              </p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="text-sm text-red-600 hover:text-red-700 font-medium underline"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Tag className="w-5 h-5 text-gray-400" />
          </span>
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError('');
              setSuccess('');
            }}
            placeholder="Enter discount code"
            className="w-full pl-10 pr-4 py-3 bg-white/80 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm shadow-sm uppercase"
            disabled={loading}
          />
        </div>
        <button
          onClick={validateAndApplyCode}
          disabled={loading || !code.trim()}
          className="px-5 py-3 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-xl text-sm font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Applying...
            </>
          ) : (
            'Apply'
          )}
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}
    </div>
  );
}
