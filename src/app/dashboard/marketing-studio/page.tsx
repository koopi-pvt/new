"use client";

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { PageLoader } from '@/components/ui/PageLoader';
import { Sparkles, Download, Package, Tag, Image as ImageIcon, Clock, ChevronRight } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { Product, Promotion } from '@/types';
import { motion } from 'framer-motion';
import * as htmlToImage from 'html-to-image';
import SelectionModal from '@/components/dashboard/SelectionModal';

// --- TEMPLATES ---
const templates = [
  {
    id: 'modern-promo',
    name: 'Modern Promo',
    preview: (product: Product, promotion: Promotion | null, watermark: boolean) => (
      <div className="w-full h-full bg-gray-100 flex font-sans relative overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <img src={product.images[0]} alt={product.name} className="w-2/3 h-full object-cover" />
        ) : (
          <div className="w-2/3 h-full bg-gray-200 flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-gray-400" />
          </div>
        )}
        <div className="w-1/3 bg-white flex flex-col justify-center p-8">
          <h2 className="text-4xl font-bold text-black mb-2">{product.name}</h2>
          <p className="text-lg text-gray-600 mb-4">Now available for LKR {product.price}</p>
          {promotion && (
            <div className="mt-4">
              <p className="text-md text-gray-700 mt-2">Use code:</p>
              <p className="text-xl font-bold text-red-500 bg-red-100 px-4 py-2 inline-block rounded-lg">{promotion.code}</p>
            </div>
          )}
        </div>
        {watermark && <div className="absolute top-4 right-4 bg-yellow-400 text-black text-sm font-bold px-3 py-1 rounded-full">LIMITED TIME</div>}
      </div>
    )
  },
  {
    id: 'bold-announcement',
    name: 'Bold Announcement',
    preview: (product: Product, promotion: Promotion | null, watermark: boolean) => (
      <div className="w-full h-full bg-black flex flex-col justify-center items-center font-sans p-12 text-center relative">
        {product.images && product.images.length > 0 ? (
          <img src={product.images[0]} alt={product.name} className="absolute inset-0 w-full h-full object-cover opacity-30" />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gray-800 opacity-30" />
        )}
        <h2 className="text-6xl font-extrabold text-white z-10">{product.name}</h2>
        <p className="text-2xl text-white/80 mt-4 z-10">Just Dropped</p>
        {promotion && (
          <div className="mt-6 bg-yellow-400 text-black px-6 py-3 rounded-full z-10">
            <p className="text-2xl font-bold">{promotion.code}</p>
          </div>
        )}
        {watermark && <div className="absolute bottom-4 right-4 bg-white text-black text-sm font-bold px-3 py-1 rounded-full">LIMITED TIME OFFER</div>}
      </div>
    )
  },
  {
    id: 'minimalist-focus',
    name: 'Minimalist Focus',
    preview: (product: Product, promotion: Promotion | null, watermark: boolean) => (
      <div className="w-full h-full bg-white flex font-sans relative">
        <div className="w-1/2 flex flex-col justify-center p-10">
          <h2 className="text-5xl font-bold text-gray-800">{product.name}</h2>
          <p className="text-xl text-gray-500 mt-4">LKR {product.price}</p>
          {promotion && (
            <div className="mt-6">
              <p className="text-lg">Special offer with key:</p>
              <p className="text-2xl font-mono bg-gray-100 p-3 inline-block rounded-md">{promotion.code}</p>
            </div>
          )}
        </div>
        <div className="w-1/2 h-full">
          {product.images && product.images.length > 0 ? (
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-200" />
          )}
        </div>
        {watermark && <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">LIMITED</div>}
      </div>
    )
  }
];

export default function MarketingStudioPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(templates[0]);
  const [addWatermark, setAddWatermark] = useState(false);
  
  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);

  useEffect(() => {
    document.title = 'Marketing Studio - Koopi Dashboard';
    if (user) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchData = async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      const productsQuery = query(collection(db, 'products'), where('storeId', '==', user.uid));
      const promotionsQuery = query(collection(db, 'promotions'), where('storeId', '==', user.uid));
      
      const [productsSnapshot, promotionsSnapshot] = await Promise.all([
        getDocs(productsQuery),
        getDocs(promotionsQuery)
      ]);

      const productsData = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
      const promotionsData = promotionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Promotion[];

      setProducts(productsData);
      setPromotions(promotionsData);

      if (productsData.length > 0) {
        setSelectedProduct(productsData[0]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;

    setIsDownloading(true);
    try {
      const dataUrl = await htmlToImage.toPng(cardRef.current, { quality: 1 });
      const link = document.createElement('a');
      link.download = `marketing-post-${selectedProduct?.name?.replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Oops, something went wrong!', error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (authLoading || loadingData) {
    return <PageLoader message="Loading Marketing Studio..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <div className="min-h-screen bg-[#f5f5f7] p-4 sm:p-6 lg:p-8">
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6 backdrop-blur-xl bg-white/60 rounded-[20px] p-4 sm:p-5 border border-white/20 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="group flex items-center justify-center w-9 h-9 rounded-full bg-black/5">
                <Sparkles className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">Marketing Studio</h1>
                <p className="text-sm text-gray-600 mt-0.5">Create stunning posts for your products</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <div className="backdrop-blur-2xl bg-white/70 rounded-[24px] border border-white/30 shadow-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Package className="w-5 h-5" /> Select a Product</h3>
                <button onClick={() => setIsProductModalOpen(true)} className="w-full text-left p-3 bg-white/80 rounded-xl border border-gray-300 flex justify-between items-center">
                  <span>{selectedProduct ? selectedProduct.name : 'Select a product'}</span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="backdrop-blur-2xl bg-white/70 rounded-[24px] border border-white/30 shadow-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Tag className="w-5 h-5" /> Add a Promotion Key (Optional)</h3>
                <button onClick={() => setIsPromotionModalOpen(true)} className="w-full text-left p-3 bg-white/80 rounded-xl border border-gray-300 flex justify-between items-center">
                  <span>{selectedPromotion ? selectedPromotion.name : 'None'}</span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="backdrop-blur-2xl bg-white/70 rounded-[24px] border border-white/30 shadow-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Template & Options</h3>
                <div className="grid grid-cols-3 gap-3">
                  {templates.map(template => (
                    <button key={template.id} onClick={() => setSelectedTemplate(template)} className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${selectedTemplate.id === template.id ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200 hover:border-blue-400'}`}>
                      <div className="w-full h-full scale-[0.25] origin-top-left" style={{ width: '400%', height: '400%' }}>
                        {selectedProduct && template.preview(selectedProduct, selectedPromotion, addWatermark)}
                      </div>
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <p className="text-xs font-bold text-white text-center">{template.name}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="mt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={addWatermark} onChange={(e) => setAddWatermark(e.target.checked)} className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-500" />
                    <span className="text-sm text-gray-700">Add "Limited Time" Watermark</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="backdrop-blur-2xl bg-white/70 rounded-[24px] border border-white/30 shadow-2xl p-6">
                <div className="aspect-square w-full max-w-xl mx-auto">
                  {selectedProduct && selectedTemplate ? (
                    <div ref={cardRef} className="w-full h-full rounded-xl overflow-hidden shadow-lg">
                      {selectedTemplate.preview(selectedProduct, selectedPromotion, addWatermark)}
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center">
                      <p className="text-gray-500">Please select a product to see a preview.</p>
                    </div>
                  )}
                </div>
                <div className="mt-6 max-w-xl mx-auto">
                  <button onClick={handleDownload} disabled={!selectedProduct || isDownloading} className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all hover:bg-gray-800 disabled:opacity-60">
                    {isDownloading ? 'Generating...' : 'Download Image'}
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SelectionModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        items={products}
        selectedItem={selectedProduct}
        onSelect={(item) => setSelectedProduct(item as Product)}
        title="Select a Product"
      />

      <SelectionModal
        isOpen={isPromotionModalOpen}
        onClose={() => setIsPromotionModalOpen(false)}
        items={[{ id: 'none', name: 'None' }, ...promotions]}
        selectedItem={selectedPromotion}
        onSelect={(item) => setSelectedPromotion(item.id === 'none' ? null : item as Promotion)}
        title="Select a Promotion"
      />
    </>
  );
}