'use client';

import Link from 'next/link';
import { Star, Package, TrendingUp } from 'lucide-react';
import { templates } from '@/lib/templates';

import { Product } from '@/types';

type ProductCardProps = {
  product: Product;
  storeName: string;
  template: any;
};

const ProductCard = ({ product, storeName, template }: ProductCardProps) => {
  const cardStyles = template.productCard;
  const theme = template.theme;

  // Get images from product
  const productImages = product.images || [];
  
  // Calculate discount percentage
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  // Check if product has variants
  const hasVariants = product.variants && product.variants.length > 0;
  const variantCount = hasVariants
    ? product.variants!.reduce((sum, v) => sum + v.options.length, 0)
    : 0;

  // Check if product is out of stock
  const isOutOfStock = (() => {
    if (!product.inventoryTracked) return false;
    
    // Check if has variants
    if (product.variants && product.variants.length > 0 && product.variantStock) {
      // Check if all variants are out of stock
      const allVariantsOutOfStock = Object.values(product.variantStock).every(stock => stock === 0);
      return allVariantsOutOfStock;
    }
    
    // Check simple inventory
    return product.inventory === 0 || product.quantity === 0;
  })();

  // Check if product is new (created in last 30 days)
  const isNewProduct = (() => {
    if (!product.createdAt) return false;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const productDate = product.createdAt.toDate ? product.createdAt.toDate() : new Date(product.createdAt);
    return productDate >= thirtyDaysAgo;
  })();

  return (
    <Link href={`/store/${storeName}/product/${product.id}`}>
      <div className={cardStyles.container}>
        {/* Image Container */}
        <div className="relative w-full bg-gray-50 overflow-hidden">
          {productImages.length > 0 ? (
            <>
              <img
                src={productImages[0]}
                alt={product.name}
                className={`${cardStyles.image} ${isOutOfStock ? 'opacity-50' : ''}`}
                crossOrigin="anonymous"
              />
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/10"></div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <Package className="w-16 h-16 text-gray-400" />
            </div>
          )}
          
          {/* Discount Badge */}
          {hasDiscount && !isOutOfStock && (
            <div 
              className="absolute top-3 left-3 px-3 py-1 rounded-full text-white text-xs font-bold shadow-lg flex items-center gap-1"
              style={{ backgroundColor: theme.primaryColor, zIndex: 10 }}
            >
              <TrendingUp className="w-3 h-3" />
              {discountPercent}% OFF
            </div>
          )}

          {/* New Product Badge */}
          {isNewProduct && !isOutOfStock && !hasDiscount && (
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold shadow-lg flex items-center gap-1" style={{ zIndex: 10 }}>
              ⭐ NEW
            </div>
          )}

          {/* Out of Stock Badge */}
          {isOutOfStock && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-3 rounded-full bg-red-500 text-white text-sm font-bold shadow-2xl" style={{ zIndex: 10 }}>
              Out of Stock
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className={cardStyles.details}>
          {/* Product Name */}
          <h3 className={cardStyles.title}>
            {product.name}
          </h3>

          {/* Rating */}
          {product.averageRating !== undefined && product.reviewCount !== undefined && product.reviewCount > 0 && (
            <div className={cardStyles.rating}>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.floor(product.averageRating!)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">
                ({product.reviewCount})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cardStyles.price}>
              LKR {product.price.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className={cardStyles.compareAtPrice}>
                LKR {product.compareAtPrice!.toFixed(2)}
              </span>
            )}
          </div>

          {/* Variants Info */}
          {hasVariants && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Package className="w-3 h-3" />
              <span>{variantCount} options available</span>
            </div>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {product.tags.slice(0, 3).map((tag, index) => (
                <span 
                  key={index}
                  className="px-2 py-0.5 text-xs rounded-full"
                  style={{ 
                    backgroundColor: theme.primaryColor + '15',
                    color: theme.primaryColor
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;