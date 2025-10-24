"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/firebase';
import { doc, onSnapshot, getDoc, updateDoc } from 'firebase/firestore';
import WelcomeCard from '@/components/dashboard/WelcomeCard';
import SocialMediaKitCard from '@/components/dashboard/SocialMediaKitCard';
import QuickLookWidget from '@/components/dashboard/QuickLookWidget';
import { PageLoader } from '@/components/ui/PageLoader';
import QuickActionsWidget from '@/components/dashboard/QuickActionsWidget';
import GrowthCenter from '@/components/dashboard/GrowthCenter';
import BrandingAnimation from '@/components/dashboard/BrandingAnimation';
import AnimatedWidget from '@/components/dashboard/AnimatedWidget';
import { Share2, ArrowRight } from 'lucide-react';

const DashboardHomePage = () => {
  const { user, loading } = useAuth();
  const [hasProducts, setHasProducts] = useState(false);
  const [hasCustomizedStore, setHasCustomizedStore] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [storeUrl, setStoreUrl] = useState('');
  const [isStoreEnabled, setIsStoreEnabled] = useState(false);
  const [showSocialMediaKit, setShowSocialMediaKit] = useState(false);
  const [welcomeCardCompleted, setWelcomeCardCompleted] = useState(false);
  const [storeDataLoading, setStoreDataLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const storeDocRef = doc(db, "stores", user.uid);
      const unsubscribe = onSnapshot(storeDocRef, async (docSnap) => {
        if (docSnap.exists()) {
          const storeData = docSnap.data();
          console.log("Store data:", storeData); // Debug log
          setHasProducts(storeData.hasProducts === true);
          setHasCustomizedStore(storeData.hasCustomizedStore === true);
          setWelcomeCardCompleted(storeData.hasProducts === true && storeData.hasCustomizedStore === true);
          
          // Get storeName from store document, or fetch from users collection if missing
          let storeNameValue = storeData.storeName || '';
          let storeSlugValue = storeData.storeNameSlug || '';
          
          if (!storeNameValue || !storeSlugValue) {
            try {
              // Fetch from users collection
              const userDocRef = doc(db, "users", user.uid);
              const userDoc = await getDoc(userDocRef);
              if (userDoc.exists()) {
                const userData = userDoc.data();
                storeNameValue = storeNameValue || userData.storeName || '';
                storeSlugValue = storeSlugValue || userData.storeNameSlug || '';
                
                // Update store document with storeName if it was missing
                if ((userData.storeName || userData.storeNameSlug) && (!storeData.storeName || !storeData.storeNameSlug)) {
                  await updateDoc(storeDocRef, {
                    storeName: userData.storeName || storeNameValue,
                    storeNameSlug: userData.storeNameSlug || storeSlugValue
                  });
                  console.log("Updated store document with storeName from users collection");
                }
              }
            } catch (error) {
              console.error("Error fetching storeName from users collection:", error);
            }
          }
          
          setStoreName(storeNameValue);
          
          // Check if store is enabled - more robust check
          const websiteData = storeData.website || {};
          const websiteEnabled = websiteData.enabled === true;
          setIsStoreEnabled(websiteEnabled);
          
          if (storeSlugValue) {
            const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
            setStoreUrl(`${baseUrl}/store/${storeSlugValue}`);
          }
          // Show social media kit only if store name exists and store is enabled
          setShowSocialMediaKit(!!storeNameValue && websiteEnabled);
        } else {
          console.log("No store document found for user:", user.uid); // Debug log
        }
        setStoreDataLoading(false);
      });
      return () => unsubscribe();
    }
  }, [user]);

  if (loading) {
    return <PageLoader message="Loading your dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] relative overflow-hidden p-4 sm:p-6 lg:p-8">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto space-y-6 sm:space-y-8">
        <AnimatedWidget>
          <QuickLookWidget />
        </AnimatedWidget>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8 items-start">
          <div className="lg:col-span-3 space-y-6 sm:space-y-8">
            {!storeDataLoading && (
              welcomeCardCompleted ? (
                <AnimatedWidget>
                  <div className="space-y-6 sm:space-y-8">
                    <QuickActionsWidget />
                    <BrandingAnimation />
                  </div>
                </AnimatedWidget>
              ) : (
                <AnimatedWidget>
                  <WelcomeCard
                    hasProducts={hasProducts}
                    hasCustomizedStore={hasCustomizedStore}
                    hasPaymentSetup={false}
                  />
                </AnimatedWidget>
              )
            )}
         </div>
         {showSocialMediaKit && storeName ? (
           <div className="lg:col-span-2 space-y-6 sm:space-y-8">
             <SocialMediaKitCard
               storeName={storeName}
                storeUrl={storeUrl}
              />
              <AnimatedWidget>
                <GrowthCenter />
              </AnimatedWidget>
            </div>
          ) : (
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              <div className="backdrop-blur-2xl bg-white/70 rounded-[24px] border border-white/30 shadow-2xl p-6 sm:p-8 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <Share2 className="w-6 h-6 text-blue-500" />
                  <h3 className="text-lg font-bold text-gray-900">Social Media Kit</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  {storeName 
                    ? isStoreEnabled 
                      ? "Complete your store setup to unlock powerful social sharing tools that help you promote your store."
                      : "Enable your store to unlock social sharing tools that help you promote your brand."
                    : "Create your store first to unlock social sharing tools that help you promote your brand."}
                </p>
                {!storeName ? (
                  <div className="mt-4">
                    <Link href="/dashboard/website" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors">
                      Create Your Store
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : !isStoreEnabled ? (
                  <div className="mt-4">
                    <Link href="/dashboard/website" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors">
                      Enable Your Store
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHomePage;