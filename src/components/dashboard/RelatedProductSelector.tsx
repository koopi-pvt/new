'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase';
import { Product } from '@/types';
import { Check, Plus } from 'lucide-react';
import { InlineLoader } from '../ui/InlineLoader';

type RelatedProductSelectorProps = {
  selectedProducts: string[];
  onChange: (selectedProducts: string[]) => void;
  currentProductId?: string;
};

export function RelatedProductSelector({ selectedProducts, onChange, currentProductId }: RelatedProductSelectorProps) {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  const fetchProducts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('storeId', '==', user.uid));
      const snapshot = await getDocs(q);
      const productList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(productList.filter(p => p.id !== currentProductId));
    } catch (error) {
      console.error("Error fetching products: ", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProduct = (productId: string) => {
    const newSelection = selectedProducts.includes(productId)
      ? selectedProducts.filter(id => id !== productId)
      : [...selectedProducts, productId];
    onChange(newSelection);
  };

  if (loading) {
    return <InlineLoader message="Loading products..." primaryColor="#000000" size="sm" />;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {products.map(product => {
          const isSelected = selectedProducts.includes(product.id);
          return (
            <button
              key={product.id}
              onClick={() => toggleProduct(product.id)}
              className={`relative group bg-white/80 border rounded-xl p-2 sm:p-3 transition-all duration-200 ${
                isSelected
                  ? 'border-blue-500 ring-2 ring-blue-500 shadow-lg'
                  : 'border-gray-300 hover:border-gray-400 hover:shadow-md'
              }`}
            >
              <div className="aspect-square bg-gray-100 rounded-lg mb-2 sm:mb-3 overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200/50"></div>
                )}
              </div>
              <p className="text-[11px] sm:text-xs font-medium text-gray-800 truncate text-left">{product.name}</p>
              
              <div className={`absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 ${
                isSelected
                  ? 'bg-blue-500 scale-100'
                  : 'bg-gray-300 scale-0 group-hover:scale-100'
              }`}>
                {isSelected ? <Check className="w-3 h-3 text-white" /> : <Plus className="w-3 h-3 text-gray-600" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}