"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { Package, ShoppingCart, ArrowRight, Star, User } from 'lucide-react';
import Link from 'next/link';
import Cart from '@/components/Cart';
import CartIcon from '@/components/CartIcon';
import { useBuyerAuth } from '@/contexts/BuyerAuthContext';
import { useCart } from '@/contexts/CartContext';
import { useStore } from '@/contexts/StoreContext';
import { templates, Template } from '@/lib/templates';
import { InlineLoader } from '@/components/ui/InlineLoader';
import ProductCard from '@/components/store/ProductCard';
import { Product } from '@/types';
import { ProductFilter, FilterState } from '@/components/store/ProductFilter';
import { ProductListSkeleton } from '@/components/ui/ProductListSkeleton';

export default function StorePage() {
  const { storeData: store, loading } = useStore();
  const params = useParams();
  const storeName = params.storeName as string;
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    category: '',
    priceRange: '',
    sortBy: 'newest',
  });
  const { addToCart, setIsCartOpen } = useCart();
  const { buyer, buyerProfile } = useBuyerAuth();

  // Set page title dynamically
  useEffect(() => {
    if (store) {
      document.title = `${store.storeName} - Shop Online`;
    }
  }, [store]);

  useEffect(() => {
    if (store) {
      fetchProducts();
    }
  }, [store]);

  const fetchProducts = async () => {
    if (!store) return;
    setProductsLoading(true);
    try {
      const productsRef = collection(db, 'products');
      const storeId = store.userId || store.ownerId;
      if (!storeId) {
        throw new Error('Store ID not found');
      }
      const productsQuery = query(productsRef, where('storeId', '==', storeId), where('status', '==', 'Active'));
      const productsSnapshot = await getDocs(productsQuery);
      const productsData = productsSnapshot.docs.map(doc => {
        const data = { id: doc.id, ...doc.data() } as Product;
        console.log('Product data:', data.name, 'Images:', data.images);
        return data;
      });
      setProducts(productsData);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setProductsLoading(false);
    }
  };

  if (error || !store) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Store Not Found</h1>
          <p className="text-gray-600">{error || 'This store does not exist'}</p>
        </div>
      </div>
    );
  }

  const templateId = store.website?.templateId || 'classic';
  const template = templates[templateId as Template] || templates.classic;

  const hero = store.website?.hero || {
    title: `Welcome to ${store.storeName}`,
    subtitle: store.storeDescription || 'Discover amazing products',
    ctaText: 'Shop Now',
    alignment: 'left'
  };

  const theme = store.website?.theme || {
    primaryColor: '#000000',
    accentColor: '#000000',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    fontFamily: 'inter'
  };

  const about = store.website?.about || {
    show: true,
    title: `About ${store.storeName}`,
    content: store.storeDescription || 'Welcome to our store!'
  };

  const footer = store.website?.footer || {
    text: '',
    showPoweredBy: true
  };

  const getFontClass = (font: string) => {
    switch (font) {
      case 'serif': return 'font-serif';
      case 'mono': return 'font-mono';
      case 'system': return 'font-sans';
      default: return 'font-sans'; // inter
    }
  };

  const handleQuickAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault(); // Prevent navigation to product page
    e.stopPropagation();
    
    const storeId = store.userId || store.ownerId || '';
    
    addToCart({
      productId: product.id,
      storeId: storeId,
      storeName: store?.storeName || storeName,
      name: product.name,
      price: product.price ?? 0,
      image: product.images && product.images.length > 0 ? product.images[0] : undefined,
    }, 1);
    
    setIsCartOpen(true);
  };

  // Get unique categories from products
  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach(product => {
      if (product.category) {
        cats.add(product.category);
      }
    });
    return Array.from(cats).sort();
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(product => {
        const nameMatch = product.name?.toLowerCase().includes(searchLower);
        const descMatch = product.description?.toLowerCase().includes(searchLower);
        const tagsMatch = product.tags?.some(tag => tag.toLowerCase().includes(searchLower));
        return nameMatch || descMatch || tagsMatch;
      });
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number);
      filtered = filtered.filter(product => {
        const price = product.price || 0;
        return price >= min && price <= max;
      });
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price-low':
          return (a.price || 0) - (b.price || 0);
        case 'price-high':
          return (b.price || 0) - (a.price || 0);
        case 'name-asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '');
        case 'popular':
          // Sort by review count and rating
          const popularityA = (a.reviewCount || 0) * (a.averageRating || 0);
          const popularityB = (b.reviewCount || 0) * (b.averageRating || 0);
          return popularityB - popularityA;
        case 'newest':
        default:
          // Sort by creation date (newest first)
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB.getTime() - dateA.getTime();
      }
    });

    return filtered;
  }, [products, filters]);

  const sectionOrder = store.website?.sectionOrder || ['hero', 'about'];

  const sectionComponents: { [key: string]: React.ReactNode } = {
    hero: (
      <section
        className="relative py-12 sm:py-16 md:py-20 px-4 sm:px-6"
        style={{
          backgroundColor: hero.backgroundImage ? 'transparent' : theme.backgroundColor,
          backgroundImage: hero.backgroundImage ? `url(${hero.backgroundImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className={`max-w-7xl mx-auto ${hero.backgroundImage ? 'bg-white/95 backdrop-blur-sm rounded-2xl p-6 sm:p-8 md:p-12' : ''} ${hero.alignment === 'center' ? 'text-center' : ''}`}>
          <div className={`${hero.alignment === 'center' ? 'mx-auto' : ''} max-w-3xl`}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4" style={{ color: hero.backgroundImage ? '#000000' : theme.textColor }}>
              {hero.title}
            </h1>
            <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8" style={{ color: hero.backgroundImage ? '#666666' : theme.textColor, opacity: 0.9 }}>
              {hero.subtitle}
            </p>
            <a
              href="#products"
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-all hover:scale-105 active:scale-95 text-sm sm:text-base"
              style={{
                backgroundColor: theme.primaryColor,
                color: '#ffffff'
              }}
            >
              {hero.ctaText}
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
          </div>
        </div>
      </section>
    ),
    about: about.show ? (
      <section id="about" className="py-12 sm:py-16 px-4 sm:px-6" style={{ backgroundColor: theme.textColor + '05' }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6" style={{ color: theme.textColor }}>{about.title}</h2>
          <p className="text-base sm:text-lg max-w-3xl whitespace-pre-wrap" style={{ color: theme.textColor, opacity: 0.8 }}>
            {about.content}
          </p>
        </div>
      </section>
    ) : null,
  };

  return (
    <>
      <Cart />
      <div className={`min-h-screen ${getFontClass(theme.fontFamily || 'inter')}`} style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}>
        {/* Header */}
        <header className="border-b sticky top-0 z-50 backdrop-blur-sm" style={{ borderColor: theme.textColor + '20', backgroundColor: theme.backgroundColor + 'f0' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            {store.website?.logo ? (
              <img src={store.website.logo} alt={store.storeName} className="h-8 sm:h-10 object-contain" />
            ) : (
              <div className="text-lg sm:text-xl font-semibold" style={{ color: theme.textColor }}>{store.storeName}</div>
            )}
            <nav className="flex items-center gap-3 sm:gap-5">
              <a href="#products" className="text-sm font-medium transition-opacity hover:opacity-70 hidden sm:block" style={{ color: theme.textColor, opacity: 0.8 }}>
                Products
              </a>
              {about.show && (
                <a href="#about" className="text-sm font-medium transition-opacity hover:opacity-70 hidden sm:block" style={{ color: theme.textColor, opacity: 0.8 }}>
                  About
                </a>
              )}
              {buyer && buyerProfile ? (
                <Link
                  href="/buyer/orders"
                  className="flex items-center gap-1 text-sm font-medium transition-opacity hover:opacity-70"
                  style={{ color: theme.textColor, opacity: 0.8 }}
                  title={buyerProfile.name}
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Account</span>
                </Link>
              ) : (
                <Link
                  href={`/buyer/login?returnUrl=${encodeURIComponent(`/store/${storeName}`)}`}
                  className="flex items-center gap-1 text-sm font-medium transition-opacity hover:opacity-70"
                  style={{ color: theme.textColor, opacity: 0.8 }}
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
              )}
              <CartIcon iconColor={theme.textColor} badgeColor={theme.primaryColor} />
            </nav>
          </div>
        </header>

        {sectionOrder.map(key => (
          <React.Fragment key={key}>{sectionComponents[key]}</React.Fragment>
        ))}

        {/* Products Section */}
        <section id="products" className="py-12 sm:py-16 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6" style={{ color: theme.textColor }}>Products</h2>

            {productsLoading ? (
              <ProductListSkeleton theme={{
                primaryColor: theme.primaryColor,
                backgroundColor: theme.backgroundColor || '#ffffff',
                textColor: theme.textColor || '#000000'
              }} />
            ) : products.length > 0 ? (
              <>
                <ProductFilter
                  theme={theme}
                  categories={categories}
                  products={products}
                  onFilterChange={setFilters}
                  totalProducts={products.length}
                  filteredCount={filteredProducts.length}
                />

                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        storeName={storeName}
                        template={template}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Package className="w-16 h-16 mx-auto mb-4" style={{ color: theme.textColor, opacity: 0.4 }} />
                    <h3 className="text-xl font-semibold mb-2" style={{ color: theme.textColor }}>No products match your filters</h3>
                    <p style={{ color: theme.textColor, opacity: 0.7 }}>Try adjusting your search or filters</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <Package className="w-16 h-16 mx-auto mb-4" style={{ color: theme.textColor, opacity: 0.4 }} />
                <h3 className="text-xl font-semibold mb-2" style={{ color: theme.textColor }}>No products yet</h3>
                <p style={{ color: theme.textColor, opacity: 0.7 }}>Check back soon for new items</p>
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
      <footer className="border-t py-6 sm:py-8 px-4 sm:px-6" style={{ borderColor: theme.textColor + '20' }}>
        <div className="max-w-7xl mx-auto text-center text-sm" style={{ color: theme.textColor, opacity: 0.7 }}>
          {footer.text ? (
            <p className="mb-2">{footer.text}</p>
          ) : (
            <p className="mb-2">&copy; {new Date().getFullYear()} {store.storeName}. All rights reserved.</p>
          )}
          {footer.showPoweredBy && (
            <p className="mt-2">Powered by Koopi</p>
          )}
        </div>
      </footer>
      </div>
    </>
  );
}