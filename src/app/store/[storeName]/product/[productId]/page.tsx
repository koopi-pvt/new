"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { Package, ShoppingCart, ArrowLeft, Star, Check, User, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useBuyerAuth } from '@/contexts/BuyerAuthContext';
import Cart from '@/components/Cart';
import CartIcon from '@/components/CartIcon';
import { useStore } from '@/contexts/StoreContext';
import { ClassicProductLayout } from '@/components/store/templates/ClassicProductLayout';
import { ModernProductLayout } from '@/components/store/templates/ModernProductLayout';
import { MinimalistProductLayout } from '@/components/store/templates/MinimalistProductLayout';
import { BoldProductLayout } from '@/components/store/templates/BoldProductLayout';
import { Product } from '@/types';
import { PageLoader } from '@/components/ui/PageLoader';
import { ReviewSubmission } from '@/components/store/ReviewSubmission';
import { ReviewList } from '@/components/store/ReviewList';
import { RelatedProducts } from '@/components/store/RelatedProducts';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const storeName = params.storeName as string;
  const productId = params.productId as string;
  const { storeData: store, loading: storeLoading } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: string }>({});
  const [addedToCart, setAddedToCart] = useState(false);
  const { addToCart, setIsCartOpen } = useCart();
  const { buyer, buyerProfile } = useBuyerAuth();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewEligibility, setReviewEligibility] = useState<{
    canReview: boolean;
    reason?: string;
  } | null>(null);

  useEffect(() => {
    if (store && productId) {
      fetchProduct();
    }
  }, [store, productId]);

  // Set page title dynamically
  useEffect(() => {
    if (product && store) {
      document.title = `${product.name} - ${store.storeName}`;
    }
  }, [product, store]);

  const fetchProduct = async () => {
    if (!store) return;
    try {
      const productDoc = await getDoc(doc(db, 'products', productId));
      const storeId = store.userId || store.ownerId;
      if (!storeId) {
        setError('Store ID not found');
        setLoading(false);
        return;
      }
      if (productDoc.exists() && productDoc.data().storeId === storeId) {
        const productData = { id: productDoc.id, ...productDoc.data() } as any;
        
        // Transform variants if they are in the old format
        if (productData.variants && productData.variants.length > 0) {
          productData.variants = productData.variants.map((variant: any) => ({
            ...variant,
            options: variant.options.map((option: any) =>
              typeof option === 'string' ? { value: option } : option
            ),
          }));
        }
        
        setProduct(productData as Product);
        
        // Initialize selected variants if product has variants
        if (productData.variants && productData.variants.length > 0) {
          const initialVariants: { [key: string]: string } = {};
          productData.variants.forEach((variant: { name: string; options: { value: string }[] }) => {
            if (variant.options.length > 0) {
              initialVariants[variant.name] = variant.options[0].value;
            }
          });
          setSelectedVariants(initialVariants);
        }
      } else {
        setError('Product not found');
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const getVariantCombinations = () => {
    if (!product || !product.variants || product.variants.length === 0) return [];

    const combinations = product.variants.reduce((acc, variant) => {
      if (acc.length === 0) {
        return variant.options.map(option => ({ [variant.name]: option.value }));
      }
      return acc.flatMap(combination =>
        variant.options.map(option => ({ ...combination, [variant.name]: option.value }))
      );
    }, [] as { [key: string]: string }[]);

    return combinations;
  };

  const isOptionDisabled = (variantName: string, option: string) => {
    if (!product?.inventoryTracked || !product.variantStock || !product.variants) return false;

    const testCombination = { ...selectedVariants };
    testCombination[variantName] = option;

    const allCombinations = getVariantCombinations();

    const relevantCombinations = allCombinations.filter(combo => {
      return Object.keys(testCombination).every(key => testCombination[key] === combo[key]);
    });

    if (relevantCombinations.length === 0) {
      return true;
    }

    const allOutOfStock = relevantCombinations.every(combo => {
      const key = product.variants!.map(v => combo[v.name]).join(' / ');
      return product.variantStock![key] === 0;
    });

    return allOutOfStock;
  };

  if (loading) {
    const theme = store?.website?.theme || { primaryColor: '#000000', backgroundColor: '#ffffff' };
    return <PageLoader message="Loading product..." primaryColor={theme.primaryColor} backgroundColor={theme.backgroundColor} />;
  }

  if (error || !store || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Product Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'This product does not exist'}</p>
          <Link href={`/store/${storeName}`} className="text-sm font-medium text-gray-900 hover:underline">
            Back to store
          </Link>
        </div>
      </div>
    );
  }

  const baseTheme = store.website?.theme;

  const theme = {
    primaryColor: baseTheme?.primaryColor || '#000000',
    accentColor: baseTheme?.accentColor || '#000000',
    backgroundColor: baseTheme?.backgroundColor || '#ffffff',
    textColor: baseTheme?.textColor || '#000000',
    fontFamily: baseTheme?.fontFamily || 'inter'
  };

  const getFontClass = (font: string) => {
    switch (font) {
      case 'serif': return 'font-serif';
      case 'mono': return 'font-mono';
      case 'system': return 'font-sans';
      default: return 'font-sans';
    }
  };

  const displayPrice = typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(product.price || '0').toFixed(2);

  // Check if product is out of stock
  const isOutOfStock = () => {
    if (!product.inventoryTracked) return false;
    if (product.variants && product.variants.length > 0) {
      const variantKey = Object.values(selectedVariants).join(' / ');
      const stock = product.variantStock?.[variantKey];
      return stock !== undefined && stock <= 0;
    }
    return product.quantity === 0;
  };

  const handleAddToCart = () => {
    // Check if product is out of stock
    if (isOutOfStock()) {
      alert('This product is currently out of stock');
      return;
    }

    // Validate that all required variants are selected
    if (product.variants && product.variants.length > 0) {
      const missingVariants = product.variants.filter(
        variant => !selectedVariants[variant.name]
      );
      
      if (missingVariants.length > 0) {
        alert(`Please select: ${missingVariants.map(v => v.name).join(', ')}`);
        return;
      }
    }

    addToCart(
      {
        productId: product.id,
        storeId: store.userId || store.ownerId || '',
        storeName: store.storeName,
        name: product.name,
        price: typeof product.price === 'number' ? product.price : parseFloat(product.price || '0'),
        image: product.images && product.images.length > 0 ? product.images[0] : undefined,
        variant: Object.keys(selectedVariants).length > 0 ? selectedVariants : undefined,
      },
      quantity
    );
    
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
    setIsCartOpen(true);
  };

  const handleVariantChange = (variantName: string, option: string) => {
    setSelectedVariants(prev => ({
      ...prev,
      [variantName]: option
    }));
  };

  const renderLayout = () => {
    const props = { 
      product, 
      theme, 
      handleAddToCart, 
      addedToCart, 
      quantity, 
      setQuantity,
      selectedVariants,
      handleVariantChange,
      isOutOfStock: isOutOfStock(),
      isOptionDisabled
    };
    switch (store.website?.templateId) {
      case 'modern':
        return <ModernProductLayout {...props} />;
      case 'minimalist':
        return <MinimalistProductLayout {...props} />;
      case 'bold':
        return <BoldProductLayout {...props} />;
      default:
        return <ClassicProductLayout {...props} />;
    }
  };


  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    // Refresh the page to show new review
    window.location.reload();
  };

  return (
    <>
      <Cart />
      <div className={`min-h-screen ${getFontClass(theme.fontFamily || 'inter')}`} style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}>
        {/* Header */}
        <header className="border-b sticky top-0 z-50 backdrop-blur-sm" style={{ borderColor: theme.textColor + '20', backgroundColor: theme.backgroundColor + 'f0' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/store/${storeName}`}
                className="transition-opacity hover:opacity-70"
                style={{ color: theme.textColor }}
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              {store.website?.logo ? (
                <img src={store.website.logo} alt={store.storeName} className="h-8 object-contain" />
              ) : (
                <div className="text-lg sm:text-xl font-semibold" style={{ color: theme.textColor }}>{store.storeName}</div>
              )}
            </div>
            <div className="flex items-center gap-3">
              {buyer && buyerProfile ? (
                <Link
                  href="/buyer/orders"
                  className="p-2 hover:opacity-70 transition-opacity"
                  style={{ color: theme.textColor }}
                  title={buyerProfile.name}
                >
                  <User className="w-5 h-5" />
                </Link>
              ) : (
                <Link
                  href={`/buyer/login?returnUrl=${encodeURIComponent(`/store/${storeName}/product/${productId}`)}`}
                  className="p-2 hover:opacity-70 transition-opacity"
                  style={{ color: theme.textColor }}
                >
                  <User className="w-5 h-5" />
                </Link>
              )}
              <CartIcon iconColor={theme.textColor} badgeColor={theme.primaryColor} />
            </div>
          </div>
        </header>

        {/* Product Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {renderLayout()}
        </div>

        {/* Reviews Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 border-t" style={{ borderColor: theme.textColor + '20' }}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-6 h-6" style={{ color: theme.primaryColor }} />
              <h2 className="text-2xl font-bold" style={{ color: theme.textColor }}>
                Customer Reviews
              </h2>
            </div>
            {buyer && buyerProfile && !showReviewForm ? (
              <button
                onClick={() => setShowReviewForm(true)}
                className="px-4 py-2 rounded-full font-medium text-white transition-all hover:opacity-90 flex items-center gap-2 shadow-md active:scale-95"
                style={{ backgroundColor: theme.primaryColor }}
              >
                <Star className="w-4 h-4" />
                Write a Review
              </button>
            ) : !buyer && !showReviewForm ? (
              <Link
                href={`/buyer/login?returnUrl=${encodeURIComponent(`/store/${storeName}/product/${productId}`)}`}
                className="px-4 py-2 rounded-full font-medium text-white transition-all hover:opacity-90 shadow-md active:scale-95"
                style={{ backgroundColor: theme.primaryColor }}
              >
                Login to Review
              </Link>
            ) : null}
          </div>

          {/* Review Submission Form */}
          {showReviewForm && buyer && buyerProfile && (
            <div className="mb-8 p-6 rounded-lg border" style={{ borderColor: theme.textColor + '20' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: theme.textColor }}>
                  Write Your Review
                </h3>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="text-sm hover:opacity-70"
                  style={{ color: theme.textColor }}
                >
                  Cancel
                </button>
              </div>
              <ReviewSubmission
                productId={product.id}
                storeId={store.userId || store.ownerId || ''}
                buyerId={buyer.uid}
                buyerEmail={buyer.email || ''}
                buyerName={buyerProfile.name}
                theme={theme}
                onReviewSubmitted={handleReviewSubmitted}
              />
            </div>
          )}

          {/* Review List */}
          <ReviewList productId={product.id} theme={theme} />
        </div>

        {/* Related Products */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <RelatedProducts
              relatedProductIds={product.relatedProducts}
              currentProductId={product.id}
              storeName={storeName}
              theme={theme}
            />
          </div>
        )}
      </div>
    </>
  );
}
