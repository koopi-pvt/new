'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, documentId } from 'firebase/firestore';
import { db } from '@/firebase';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import { Package } from 'lucide-react';

type RelatedProductsProps = {
  relatedProductIds: string[];
  currentProductId: string;
  storeName: string;
  theme: {
    primaryColor: string;
    textColor: string;
    backgroundColor?: string;
  };
};

export function RelatedProducts({ 
  relatedProductIds, 
  currentProductId,
  storeName, 
  theme 
}: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRelatedProducts();
  }, [relatedProductIds]);

  const fetchRelatedProducts = async () => {
    if (!relatedProductIds || relatedProductIds.length === 0) {
      setLoading(false);
      return;
    }

    try {
      // Firestore 'in' query has a limit of 10 items
      const idsToFetch = relatedProductIds.slice(0, 10).filter(id => id !== currentProductId);
      
      if (idsToFetch.length === 0) {
        setLoading(false);
        return;
      }

      const productsQuery = query(
        collection(db, 'products'),
        where(documentId(), 'in', idsToFetch)
      );

      const snapshot = await getDocs(productsQuery);
      const productsData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Product))
        .filter(product => product.status === 'Active');

      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching related products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12">
        <h2 className="text-2xl font-bold mb-6" style={{ color: theme.textColor }}>
          You Might Also Like
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-white/50 rounded-lg mb-3" />
              <div className="h-4 bg-white/50 rounded mb-2" />
              <div className="h-4 bg-white/50 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="py-12 border-t" style={{ borderColor: theme.textColor + '20' }}>
      <div className="flex items-center gap-3 mb-6">
        <Package className="w-6 h-6" style={{ color: theme.primaryColor }} />
        <h2 className="text-2xl font-bold" style={{ color: theme.textColor }}>
          You Might Also Like
        </h2>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            storeName={storeName}
            theme={theme}
          />
        ))}
      </div>
    </div>
  );
}
