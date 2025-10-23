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

type ModernProductLayoutProps = {
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

export function ModernProductLayout({
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
}: ModernProductLayoutProps) {
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
                          className={`px-4 py-2 border-2 rounded-xl transition-all relative font-medium ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
                          style={{
                            borderColor: isSelected ? theme.primaryColor : theme.textColor + '30',
                            backgroundColor: isSelected ? theme.primaryColor + '15' : 'transparent',
                            color: isDisabled ? theme.textColor + '50' : theme.textColor,
                            transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                            textDecoration: isDisabled ? 'line-through' : 'none'
                          }}
                        >
                          {option.value}
                          {isSelected && !isDisabled && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.primaryColor }}>
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="border-t pt-6" style={{ borderColor: theme.textColor + '20' }}>
            {isOutOfStock ? (
              <div className="space-y-4">
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-center">
                  <p className="text-red-800 font-bold text-lg mb-1">Out of Stock</p>
                  <p className="text-red-600 text-sm">This product is currently unavailable</p>
                </div>
                <button
                  disabled
                  className="w-full py-4 rounded-full font-semibold text-white flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  Out of Stock
                </button>
              </div>
            ) : (
              <div className="space-y-4">
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
                  className="w-full py-4 rounded-full font-semibold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                  style={{ backgroundColor: addedToCart ? theme.accentColor : theme.primaryColor }}
                >
                  {addedToCart ? (
                    <>
                      <Check className="w-5 h-5" />
                      Added to Cart!
                    </>
                  ) : (
                    'Add to Cart'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
