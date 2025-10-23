'use client';

import { useEffect, useState, useRef, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Palette, Store, Check, ArrowRight, Sparkles, Rocket, HelpCircle, Globe, Users, ShoppingCart, Target, Zap, Upload, Loader2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db, storage } from '@/firebase';
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { PageLoader } from '@/components/ui/PageLoader';

interface OnboardingProgress {
  addedFirstProduct: boolean;
  customizedStore: boolean;
  namedStore: boolean;
}

const sellLocations = [
  { 
    id: 'online-store', 
    title: 'An online store', 
    description: 'Create a fully customizable website',
    icon: Store
  },
  { 
    id: 'retail', 
    title: 'In person at a retail store', 
    description: 'Brick-and-mortar stores',
    icon: ShoppingCart
  },
  { 
    id: 'events', 
    title: 'In person at events', 
    description: 'Markets, fairs, and pop-ups',
    icon: Users
  },
  { 
    id: 'existing-site', 
    title: 'An existing website or blog', 
    description: 'Add a Buy Button to your website',
    icon: Globe
  },
  { 
    id: 'social-media', 
    title: 'Social media', 
    description: 'Reach customers on Facebook, Instagram, TikTok',
    icon: Zap
  },
  { 
    id: 'marketplaces', 
    title: 'Online marketplaces', 
    description: 'List products on Etsy, Amazon, and more',
    icon: Package
  },
];

const businessGoals = [
  { 
    id: 'new-business', 
    title: 'Start a new business', 
    description: 'Launch your entrepreneurial journey',
    icon: Sparkles
  },
  { 
    id: 'grow-existing', 
    title: 'Grow an existing business', 
    description: 'Expand your current operations',
    icon: Target
  },
  { 
    id: 'side-hustle', 
    title: 'Create a side hustle', 
    description: 'Earn extra income alongside your job',
    icon: Zap
  },
  { 
    id: 'replace-income', 
    title: 'Replace my full-time income', 
    description: 'Build a sustainable online business',
    icon: Store
  },
];

const productTypes = [
  { 
    id: 'physical', 
    title: 'Physical products', 
    description: 'Items you ship to customers',
    icon: Package
  },
  { 
    id: 'digital', 
    title: 'Digital products', 
    description: 'Downloads, courses, or subscriptions',
    icon: Zap
  },
  { 
    id: 'services', 
    title: 'Services', 
    description: 'Consulting, coaching, or freelance work',
    icon: Users
  },
  { 
    id: 'mix', 
    title: 'Mix of products and services', 
    description: 'A combination of offerings',
    icon: ShoppingCart
  },
];

export default function LaunchpadPage() {
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();
  const [onboardingStep, setOnboardingStep] = useState(0); // 0 = not started, 1-4 = questions, 5 = launchpad
  const [progress, setProgress] = useState<OnboardingProgress>({
    addedFirstProduct: false,
    customizedStore: false,
    namedStore: false,
  });
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Onboarding data
  const [selectedSellLocations, setSelectedSellLocations] = useState<string[]>(['online-store']);
  const [selectedGoal, setSelectedGoal] = useState('new-business');
  const [selectedProductType, setSelectedProductType] = useState('physical');
  const [storeName, setStoreName] = useState('');
  const [storeNameSlug, setStoreNameSlug] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [storeNameStatus, setStoreNameStatus] = useState<'checking' | 'available' | 'unavailable' | 'idle'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user && userProfile) {
      // Check if onboarding questions are completed
      const onboarding = userProfile.onboarding || {};
      const hasCompletedQuestions = onboarding.isCompleted || onboarding.sellLocations;
      
      if (hasCompletedQuestions) {
        // Skip to launchpad (step 5)
        setOnboardingStep(5);
      } else {
        // Start with onboarding questions (step 1)
        setOnboardingStep(1);
      }

      // Load progress from user profile
      const namedStore = !!userProfile.storeName;
      
      const currentProgress = {
        addedFirstProduct: onboarding.addedFirstProduct || false,
        customizedStore: onboarding.customizedStore || false,
        namedStore: namedStore,
      };

      setProgress(currentProgress);

      // Calculate percentage
      const completed = Object.values(currentProgress).filter(Boolean).length;
      const total = 3;
      setProgressPercentage((completed / total) * 100);

      setIsLoading(false);

      // If all steps are complete, redirect to dashboard
      if (completed === total && hasCompletedQuestions) {
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      }
    }
  }, [user, userProfile, loading, router]);

  // Store name checking
  useEffect(() => {
    if (storeNameSlug.length <= 2) {
      setStoreNameStatus('idle');
      return;
    }

    setStoreNameStatus('checking');
    const debounceCheck = setTimeout(async () => {
      try {
        const storeNameDoc = await getDoc(doc(db, 'storeNames', storeNameSlug));
        setStoreNameStatus(storeNameDoc.exists() ? 'unavailable' : 'available');
      } catch (error) {
        console.error('Error checking store name:', error);
        setStoreNameStatus('idle');
      }
    }, 500);

    return () => clearTimeout(debounceCheck);
  }, [storeNameSlug]);

  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  };

  const handleStoreNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setStoreName(name);
    setStoreNameSlug(slugify(name));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generatePlaceholder = (name: string) => {
    const firstLetter = name.charAt(0).toUpperCase();
    const colors = ['#f56565', '#ed8936', '#ecc94b', '#48bb78', '#38b2ac', '#4299e1', '#667eea', '#9f7aea', '#ed64a6'];
    const color = colors[name.length % colors.length];
    const svg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="${color}"/><text x="50%" y="50%" font-family="Arial" font-size="100" fill="white" text-anchor="middle" dy=".3em">${firstLetter}</text></svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  const toggleSellLocation = (id: string) => {
    setSelectedSellLocations(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleOnboardingComplete = async () => {
    if (!user || !storeName.trim() || storeNameStatus !== 'available') return;
    
    setIsSaving(true);
    try {
      let logoUrl = '';
      const storageRef = ref(storage, `logos/${user.uid}/${logoFile ? logoFile.name : 'placeholder.svg'}`);

      if (logoFile && logoPreview) {
        await uploadString(storageRef, logoPreview, 'data_url');
        logoUrl = await getDownloadURL(storageRef);
      } else {
        const placeholderSvg = generatePlaceholder(storeName);
        await uploadString(storageRef, placeholderSvg, 'data_url');
        logoUrl = await getDownloadURL(storageRef);
      }

      // Update user document
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        onboarding: {
          sellLocations: selectedSellLocations,
          goal: selectedGoal,
          productType: selectedProductType,
          isCompleted: true,
        },
        storeName: storeNameSlug,
        storeLogoUrl: logoUrl,
      });

      // Create store document
      const storeDocRef = doc(db, 'stores', user.uid);
      await setDoc(storeDocRef, {
        ownerId: user.uid,
        storeName: storeNameSlug,
        storeDescription: '',
        storeCategory: '',
        website: {
          enabled: false,
          logo: logoUrl,
          templateId: 'classic',
          theme: {
            primaryColor: '#000000',
            accentColor: '#333333',
            backgroundColor: '#ffffff',
            textColor: '#000000',
            fontFamily: 'inter',
          },
          hero: {
            title: `Welcome to ${storeName}`,
            subtitle: 'Discover amazing products',
            ctaText: 'Shop Now',
            alignment: 'left',
            backgroundImage: '',
          },
        },
      });

      // Create store name lookup
      const storeNameDocRef = doc(db, 'storeNames', storeNameSlug);
      await setDoc(storeNameDocRef, {
        ownerId: user.uid,
      });

      // Move to launchpad
      setOnboardingStep(5);
      setIsSaving(false);
    } catch (error) {
      console.error('Error saving onboarding:', error);
      setIsSaving(false);
    }
  };

  if (loading || isLoading) {
    return <PageLoader />;
  }

  // Render onboarding questions
  if (onboardingStep >= 1 && onboardingStep <= 4) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] relative overflow-hidden flex items-center justify-center py-8 px-4">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 w-full max-w-5xl">
          <div className="backdrop-blur-xl bg-white/60 rounded-[24px] border border-white/30 shadow-2xl p-6 sm:p-8 md:p-12">
            <AnimatePresence mode="wait">
              {/* Step 1: Where to sell */}
              {onboardingStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <div className="w-full max-w-2xl mx-auto">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <Store className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="bg-white/80 rounded-2xl p-5 shadow-md flex-1">
                        <h2 className="font-bold text-lg text-gray-900 mb-2">Where would you like to sell?</h2>
                        <p className="text-gray-600">Select all that apply. This will help us recommend the right features.</p>
                      </div>
                    </div>

                    <div className="mt-6 sm:ml-16 space-y-3">
                      {sellLocations.map((option) => {
                        const isSelected = selectedSellLocations.includes(option.id);
                        return (
                          <motion.div
                            key={option.id}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => toggleSellLocation(option.id)}
                            className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer border-2 transition-all ${
                              isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white/80 hover:border-gray-300'
                            }`}
                          >
                            <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                              {isSelected && <Check className="w-4 h-4 text-white" />}
                            </div>
                            <span className="font-semibold text-gray-800">{option.title}</span>
                          </motion.div>
                        );
                      })}
                    </div>

                    <div className="mt-8 sm:ml-16">
                      <button
                        onClick={() => setOnboardingStep(2)}
                        className="flex items-center gap-2 px-6 py-3 text-base font-semibold text-white bg-blue-500 rounded-full hover:bg-blue-600 transition-all active:scale-95 shadow-lg"
                      >
                        Continue <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Store identity */}
              {onboardingStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <div className="w-full max-w-2xl mx-auto">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="bg-white/80 rounded-2xl p-5 shadow-md flex-1">
                        <h2 className="font-bold text-lg text-gray-900 mb-2">Set up your store identity</h2>
                        <p className="text-gray-600">Add a name and logo for your store. You can change this later.</p>
                      </div>
                    </div>

                    <div className="mt-6 sm:ml-16 space-y-6">
                      <div>
                        <label htmlFor="storeName" className="font-semibold text-gray-800 mb-2 block">Store Name</label>
                        <input
                          id="storeName"
                          type="text"
                          value={storeName}
                          onChange={handleStoreNameChange}
                          placeholder="e.g., My Awesome Store"
                          className="w-full p-4 rounded-xl border-2 border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500 transition-all"
                        />
                        {storeNameSlug && (
                          <p className="text-sm text-gray-500 mt-2">
                            Your store URL will be: <span className="font-semibold text-gray-700">/store/{storeNameSlug}</span>
                          </p>
                        )}
                        {storeNameStatus === 'checking' && (
                          <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Checking availability...
                          </div>
                        )}
                        {storeNameStatus === 'available' && (
                          <div className="flex items-center gap-2 mt-3 text-sm text-green-600">
                            <Check className="w-4 h-4" />
                            Great! This name is available
                          </div>
                        )}
                        {storeNameStatus === 'unavailable' && (
                          <div className="flex items-center gap-2 mt-3 text-sm text-red-600">
                            <AlertCircle className="w-4 h-4" />
                            This name is already taken
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                        <div
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-400 hover:border-blue-500 transition-all"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {logoPreview ? (
                            <img src={logoPreview} alt="Logo Preview" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <Upload className="w-8 h-8 text-gray-500" />
                          )}
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/png, image/jpeg, image/svg+xml"
                            className="hidden"
                          />
                        </div>
                        <div>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-5 py-2 text-sm font-semibold text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200 transition-all"
                          >
                            Upload Logo
                          </button>
                          <p className="text-xs text-gray-500 mt-2">Or a placeholder will be generated.</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 sm:ml-16">
                      <button
                        onClick={() => setOnboardingStep(3)}
                        disabled={!storeName.trim() || storeNameStatus !== 'available'}
                        className="flex items-center gap-2 px-6 py-3 text-base font-semibold text-white bg-blue-500 rounded-full hover:bg-blue-600 transition-all active:scale-95 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        Continue <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Business goal */}
              {onboardingStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="w-full max-w-2xl mx-auto">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center">
                        <Target className="w-6 h-6 text-pink-600" />
                      </div>
                      <div className="bg-white/80 rounded-2xl p-5 shadow-md flex-1">
                        <h2 className="font-bold text-lg text-gray-900 mb-2">What's your main goal?</h2>
                        <p className="text-gray-600">This will help us tailor your experience.</p>
                      </div>
                    </div>

                    <div className="mt-6 sm:ml-16 space-y-3">
                      {businessGoals.map((option) => {
                        const isSelected = selectedGoal === option.id;
                        return (
                          <motion.div
                            key={option.id}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => setSelectedGoal(option.id)}
                            className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer border-2 transition-all ${
                              isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white/80 hover:border-gray-300'
                            }`}
                          >
                            <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                              {isSelected && <div className="w-3 h-3 bg-white rounded-full" />}
                            </div>
                            <span className="font-semibold text-gray-800">{option.title}</span>
                          </motion.div>
                        );
                      })}
                    </div>

                    <div className="mt-8 sm:ml-16">
                      <button
                        onClick={() => setOnboardingStep(4)}
                        className="flex items-center gap-2 px-6 py-3 text-base font-semibold text-white bg-blue-500 rounded-full hover:bg-blue-600 transition-all active:scale-95 shadow-lg"
                      >
                        Continue <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Product type */}
              {onboardingStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="w-full max-w-2xl mx-auto">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <Package className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="bg-white/80 rounded-2xl p-5 shadow-md flex-1">
                        <h2 className="font-bold text-lg text-gray-900 mb-2">What do you plan to sell?</h2>
                        <p className="text-gray-600">This helps us set up the right features for you.</p>
                      </div>
                    </div>

                    <div className="mt-6 sm:ml-16 space-y-3">
                      {productTypes.map((option) => {
                        const isSelected = selectedProductType === option.id;
                        return (
                          <motion.div
                            key={option.id}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => setSelectedProductType(option.id)}
                            className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer border-2 transition-all ${
                              isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white/80 hover:border-gray-300'
                            }`}
                          >
                            <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                              {isSelected && <div className="w-3 h-3 bg-white rounded-full" />}
                            </div>
                            <span className="font-semibold text-gray-800">{option.title}</span>
                          </motion.div>
                        );
                      })}
                    </div>

                    <div className="mt-8 sm:ml-16">
                      <button
                        onClick={handleOnboardingComplete}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-3 text-base font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-full hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Setting up...
                          </>
                        ) : (
                          <>
                            Complete Setup <Check className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  // Render launchpad (step 5)

  const steps = [
    {
      id: 'product',
      title: 'Add Your First Product',
      description: 'The most important step - your store needs products to sell',
      icon: Package,
      completed: progress.addedFirstProduct,
      action: () => router.push('/dashboard/products/new'),
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      id: 'customize',
      title: 'Customize Your Store\'s Look',
      description: 'Make your store unique with themes and branding',
      icon: Palette,
      completed: progress.customizedStore,
      action: () => router.push('/dashboard/website'),
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      id: 'name',
      title: 'Name Your Store & Go Live',
      description: 'Make your store accessible to the world',
      icon: Store,
      completed: progress.namedStore,
      action: () => router.push('/dashboard/settings'),
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      iconColor: 'text-pink-600',
    },
  ];

  const completedCount = Object.values(progress).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#f5f5f7] relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <main className="relative z-10 pt-20 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 mb-4">
              <Rocket className="w-8 h-8 text-blue-600" />
              <Sparkles className="w-6 h-6 text-yellow-500" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Let's get your store ready for its first sale!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Complete these 3 essential steps to launch your online store
            </p>

            {/* Progress Bar */}
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Your Progress</span>
                <span className="text-sm font-bold text-blue-600">{Math.round(progressPercentage)}%</span>
              </div>
              <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-lg"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {completedCount} of 3 steps completed
              </p>
            </div>
          </motion.div>

          {/* Steps */}
          <div className="space-y-6 mb-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                className={`backdrop-blur-xl bg-white/80 rounded-2xl border-2 p-6 sm:p-8 shadow-lg transition-all hover:shadow-xl ${
                  step.completed
                    ? 'border-green-500 bg-green-50/50'
                    : 'border-white/50 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start gap-6">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-16 h-16 rounded-2xl ${step.bgColor} flex items-center justify-center shadow-md ${step.completed ? 'bg-green-100' : ''}`}>
                    {step.completed ? (
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-8 h-8 text-white" />
                      </div>
                    ) : (
                      <step.icon className={`w-8 h-8 ${step.iconColor}`} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                          {step.title}
                        </h3>
                        <p className="text-gray-600">{step.description}</p>
                      </div>
                      {step.completed && (
                        <span className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                          <Check className="w-4 h-4" />
                          Done
                        </span>
                      )}
                    </div>

                    {!step.completed && (
                      <button
                        onClick={step.action}
                        className={`inline-flex items-center gap-2 px-6 py-3 text-base font-semibold text-white bg-gradient-to-r ${step.color} rounded-full hover:shadow-lg transition-all active:scale-95`}
                      >
                        {step.id === 'product' ? 'Add Product' : step.id === 'customize' ? 'Customize Now' : 'Set Store Name'}
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Help Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="backdrop-blur-xl bg-blue-50/80 rounded-2xl border border-blue-200 p-6 text-center"
          >
            <HelpCircle className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Not sure where to start?</h3>
            <p className="text-gray-600 mb-4">
              We recommend starting with adding your first product. It's quick and easy!
            </p>
            <button
              onClick={() => router.push('/docs')}
              className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-blue-600 bg-white rounded-full hover:bg-blue-100 transition-all"
            >
              View Quick Guide
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Dashboard Button (shown when at least one product is added) */}
          {progress.addedFirstProduct && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 text-center"
            >
              <button
                onClick={() => router.push('/dashboard')}
                className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full hover:shadow-2xl transition-all active:scale-95"
              >
                Go to My Dashboard
                <ArrowRight className="w-6 h-6" />
              </button>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
