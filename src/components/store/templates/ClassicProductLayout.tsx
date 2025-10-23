'use client';

import React from 'react';
import { ImageGallery } from '@/components/store/ImageGallery';
import { Star, Check } from 'lucide-react';
import { Product } from '@/types';

type Theme = {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily?: string;
};

type ClassicProductLayoutProps = {
  product: Product;
  theme: Theme;
  handleAddToCart: () => void;
  addedToCart: boolean;
  quantity: number;
  setQuantity: (quantity: number) => void;
  selectedVariants: { [key: string]: string };
  handleVariantChange: (variantName: string, option: string) => void;
  isOutOfStock: boolean;
  isOptionDisabled: (variantName: string, option: string) => boolean;
};

export function ClassicProductLayout({
  product, 
  theme, 
  handleAddToCart, 
  addedToCart, 
  quantity, 
  setQuantity,
  selectedVariants,
  handleVariantChange,
  isOutOfStock,
  isOptionDisabled
}: ClassicProductLayoutProps) {
  const displayPrice = typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(product.price || '0').toFixed(2);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <ImageGallery images={product.images || []} productName={product.name} />
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: theme.textColor }}>
              {product.name}
            </h1>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-3xl font-bold" style={{ color: theme.textColor }}>LKR {displayPrice}</span>
              {product.compareAtPrice && (
                <span className="text-xl text-gray-500 line-through">LKR {product.compareAtPrice.toFixed(2)}</span>
              )}
            </div>
            {product.rating && (
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < product.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                ))}
                <span className="text-sm text-gray-600 ml-2">({product.reviews?.length || 0} reviews)</span>
              </div>
            )}
          </div>
          <div className="border-t pt-6" style={{ borderColor: theme.textColor + '20' }}>
            <h2 className="text-lg font-semibold mb-3" style={{ color: theme.textColor }}>Description</h2>
            <p className="leading-relaxed whitespace-pre-wrap" style={{ color: theme.textColor, opacity: 0.8 }}>
              {product.description || 'No description available'}
            </p>
          </div>

          {product.variants && product.variants.length > 0 && (
            <div className="border-t pt-6" style={{ borderColor: theme.textColor + '20' }}>
              {product.variants.map((variant, index) => (
                <div key={index} className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.textColor }}>
                    {variant.name}
                    {selectedVariants[variant.name] && (
                      <span className="ml-2 text-xs" style={{ opacity: 0.7 }}>: {selectedVariants[variant.name]}</span>
                    )}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {variant.options.map((option, optionIndex) => {
                      const isSelected = selectedVariants[variant.name] === option.value;
                      const isDisabled = isOptionDisabled(variant.name, option.value);
                      return (
                        <button
                          key={optionIndex}
                          onClick={() => handleVariantChange(variant.name, option.value)}
                          disabled={isDisabled}
                          className={`px-4 py-2 border rounded-lg transition-all relative ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
                          style={{
                            borderColor: isSelected ? theme.primaryColor : theme.textColor + '30',
                            backgroundColor: isSelected ? theme.primaryColor + '10' : 'transparent',
                            color: isDisabled ? theme.textColor + '50' : theme.textColor,
                            fontWeight: isSelected ? '600' : '400',
                            textDecoration: isDisabled ? 'line-through' : 'none'
                          }}
                        >
                          {option.value}
                          {isSelected && !isDisabled && (
                            <Check className="w-4 h-4 absolute -top-1 -right-1" style={{ color: theme.primaryColor }} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="border-t pt-6 space-y-4" style={{ borderColor: theme.textColor + '20' }}>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.textColor }}>Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border rounded-lg flex items-center justify-center transition-opacity hover:opacity-70"
                  style={{ borderColor: theme.textColor + '30', color: theme.textColor }}
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 h-10 text-center border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: theme.textColor + '30', color: theme.textColor, backgroundColor: theme.backgroundColor }}
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border rounded-lg flex items-center justify-center transition-opacity hover:opacity-70"
                  style={{ borderColor: theme.textColor + '30', color: theme.textColor }}
                >
                  +
                </button>
              </div>
            </div>
            <button
              onClick={handleAddToCart}
              className={`w-full py-4 rounded-full font-semibold text-white flex items-center justify-center gap-2 transition-all shadow-lg ${isOutOfStock ? 'cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}`}
              style={{ backgroundColor: addedToCart ? theme.accentColor : (isOutOfStock ? '#999' : theme.primaryColor) }}
              disabled={isOutOfStock}
            >
              {addedToCart ? (
                <>
                  <Check className="w-5 h-5" />
                  Added to Cart!
                </>
              ) : isOutOfStock ? (
                'Out of Stock'
              ) : (
                'Add to Cart'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
