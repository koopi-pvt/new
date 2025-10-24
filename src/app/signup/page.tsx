'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { SignupBanner } from '@/components/SignupBanner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, ArrowLeft, Mail, Lock, AlertCircle, Store, 
  Package, Palette, Users, ShoppingCart, Target, Zap, 
  Sparkles, Globe, Check, Loader2
} from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, runTransaction, increment } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { useRouter } from 'next/navigation';
import Lottie from "lottie-react";
import animationData from "../../../public/loading-animation.json";
import withoutAuth from '@/components/withoutAuth';

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

function SignUpPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    storeName: '',
    storeNameSlug: '',
    sellLocations: ['online-store'],
    businessGoal: 'new-business',
    productType: 'physical',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storeNameStatus, setStoreNameStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
  const [suggestedSlugs, setSuggestedSlugs] = useState<string[]>([]);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'storeName') {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      setFormData((prev) => ({ ...prev, storeName: value, storeNameSlug: slug }));
      setStoreNameStatus('idle');
      setSuggestedSlugs([]);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const generateStoreName = (baseName: string): string => {
    return baseName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  const checkSlugAvailability = async (slug: string): Promise<boolean> => {
    try {
      const storeNameDoc = await getDoc(doc(db, 'storeNames', slug));
      return !storeNameDoc.exists();
    } catch (error) {
      console.error('Error checking store name:', error);
      return false;
    }
  };

  const generateSlugSuggestions = async (baseSlug: string) => {
    const suggestions: string[] = [];
    const suffixes = [
      Math.floor(Math.random() * 1000),
      'shop',
      'store',
      'co',
      'market',
      Date.now() % 10000,
    ];

    for (const suffix of suffixes) {
      const newSlug = `${baseSlug}-${suffix}`;
      const isAvailable = await checkSlugAvailability(newSlug);
      if (isAvailable) {
        suggestions.push(newSlug);
        if (suggestions.length >= 3) break;
      }
    }

    return suggestions;
  };

  const handleNext = async () => {
    setError('');

    if (currentStep === 1) {
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        setError('Please fill in all fields');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      if (!formData.agreeToTerms) {
        setError('You must agree to the Terms and Conditions to continue');
        return;
      }
    }

    if (currentStep === 2) {
      if (!formData.storeName.trim()) {
        setError('Please enter a store name');
        return;
      }
      if (formData.storeNameSlug.length < 3) {
        setError('Store name must be at least 3 characters');
        return;
      }

      // Check slug availability
      setStoreNameStatus('checking');
      const isAvailable = await checkSlugAvailability(formData.storeNameSlug);
      
      if (!isAvailable) {
        setStoreNameStatus('unavailable');
        setError('This store name is already taken. Please try one of the suggestions below or choose a different name.');
        
        // Generate suggestions
        const suggestions = await generateSlugSuggestions(formData.storeNameSlug);
        setSuggestedSlugs(suggestions);
        return;
      }
      
      setStoreNameStatus('available');
    }

    if (currentStep === 3) {
      if (formData.sellLocations.length === 0) {
        setError('Please select at least one option');
        return;
      }
    }

    setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    setError('');
    setSuggestedSlugs([]);
    setStoreNameStatus('idle');
    setCurrentStep(currentStep - 1);
  };

  const handleSellLocationToggle = (locationId: string) => {
    setFormData((prev) => {
      const newLocations = prev.sellLocations.includes(locationId)
        ? prev.sellLocations.filter((id) => id !== locationId)
        : [...prev.sellLocations, locationId];
      return { ...prev, sellLocations: newLocations };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Check promo availability and claim spot atomically
      let isPro = false;
      const promoRef = doc(db, 'promoConfig', 'earlyAccess');
      
      try {
        await runTransaction(db, async (transaction) => {
          const promoDoc = await transaction.get(promoRef);
          
          if (!promoDoc.exists()) {
            transaction.set(promoRef, {
              totalSpots: 100,
              usedSpots: 1,
              isActive: true,
              createdAt: new Date(),
            });
            isPro = true;
          } else {
            const data = promoDoc.data();
            const spotsLeft = (data.totalSpots || 100) - (data.usedSpots || 0);
            
            if (data.isActive && spotsLeft > 0) {
              transaction.update(promoRef, {
                usedSpots: increment(1),
              });
              isPro = true;
            }
          }
        });
      } catch (error) {
        console.error('Error checking promo:', error);
      }

      // Create user document with all onboarding data
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        createdAt: new Date(),
        storeName: formData.storeName,
        storeNameSlug: formData.storeNameSlug,
        subscription: {
          plan: isPro ? 'pro' : 'free',
          status: 'active',
          productCount: 0,
          productLimit: Infinity,
          ...(isPro ? {
            promoUser: true,
            promoExpiry: null,
          } : {}),
        },
        onboarding: {
          isCompleted: true,
          sellLocations: formData.sellLocations,
          businessGoal: formData.businessGoal,
          productType: formData.productType,
          addedFirstProduct: false,
          customizedStore: false,
        },
      });

      // Reserve the store name
      await setDoc(doc(db, 'storeNames', formData.storeNameSlug), {
        userId: user.uid,
        storeName: formData.storeName,
        createdAt: new Date(),
      });

      // Mark that user saw the promo popup
      localStorage.setItem('proOfferSeen', 'true');

      router.push('/dashboard');
    } catch (error: any) {
      setIsSubmitting(false);
      if (error.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists');
        setCurrentStep(1);
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address');
        setCurrentStep(1);
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak');
        setCurrentStep(1);
      } else {
        setError('Failed to create account. Please try again.');
      }
    }
  };

  const renderStepIndicator = () => (
    <div className="flex justify-center mb-8">
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                currentStep >= step
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {currentStep > step ? <Check className="w-5 h-5" /> : step}
            </div>
            {step < 5 && (
              <div
                className={`w-8 h-1 mx-1 rounded transition-all ${
                  currentStep > step ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] relative overflow-hidden flex items-center justify-center">
        <Header />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center py-10 sm:py-20"
        >
          <Lottie animationData={animationData} loop={true} className="w-32 h-32 sm:w-48 sm:h-48 mx-auto" />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-6 sm:mt-8 mb-3">Creating your store...</h2>
          <p className="text-base sm:text-lg text-gray-600">This will only take a moment</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] relative overflow-hidden">
      <Header />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      
      <main className="relative z-10 pt-20 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
              Create Your Store
            </h1>
            <p className="text-base sm:text-lg text-gray-600">
              Join thousands of entrepreneurs building their dream business
            </p>
          </motion.div>

          {renderStepIndicator()}

          <div className="backdrop-blur-2xl bg-white/70 rounded-[24px] border border-white/30 shadow-2xl p-6 sm:p-8 md:p-10">
            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {/* Step 1: Account Creation */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                        Create your account
                      </h2>
                      <p className="text-gray-600">
                        Start with your email and a secure password
                      </p>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="you@example.com"
                          className="w-full pl-12 pr-4 py-3.5 bg-white/80 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm placeholder:text-gray-400 shadow-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="password"
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          placeholder="At least 6 characters"
                          className="w-full pl-12 pr-4 py-3.5 bg-white/80 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm placeholder:text-gray-400 shadow-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                          placeholder="Re-enter your password"
                          className="w-full pl-12 pr-4 py-3.5 bg-white/80 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm placeholder:text-gray-400 shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={formData.agreeToTerms}
                          onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                          className="w-5 h-5 text-blue-500 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 mt-0.5 cursor-pointer"
                        />
                        <span className="text-sm text-gray-700 leading-relaxed">
                          I agree to the{' '}
                          <Link href="/terms" target="_blank" className="font-semibold text-blue-600 hover:underline">
                            Terms and Conditions
                          </Link>
                          {' '}and{' '}
                          <Link href="/privacy" target="_blank" className="font-semibold text-blue-600 hover:underline">
                            Privacy Policy
                          </Link>
                        </span>
                      </label>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Store Name */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                        Name your store
                      </h2>
                      <p className="text-gray-600">
                        Choose a unique name for your store
                      </p>
                    </div>

                    <div>
                      <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 mb-2">
                        Store Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                          <Store className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="storeName"
                          name="storeName"
                          value={formData.storeName}
                          onChange={handleChange}
                          required
                          placeholder="My Awesome Store"
                          className="w-full pl-12 pr-4 py-3.5 bg-white/80 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm placeholder:text-gray-400 shadow-sm"
                        />
                      </div>
                      {formData.storeNameSlug && (
                        <p className="mt-2 text-sm text-gray-500">
                          Your store URL will be: <span className="font-mono font-semibold">{formData.storeNameSlug}</span>
                        </p>
                      )}
                    </div>

                    {storeNameStatus === 'checking' && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Checking availability...</span>
                      </div>
                    )}

                    {storeNameStatus === 'unavailable' && suggestedSlugs.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                        <p className="text-sm font-medium text-yellow-800 mb-3">
                          Here are some available alternatives:
                        </p>
                        <div className="space-y-2">
                          {suggestedSlugs.map((slug) => (
                            <button
                              key={slug}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, storeName: slug, storeNameSlug: slug });
                                setStoreNameStatus('idle');
                                setSuggestedSlugs([]);
                                setError('');
                              }}
                              className="w-full text-left px-4 py-2 bg-white hover:bg-yellow-100 border border-yellow-300 rounded-lg transition-colors text-sm font-mono font-semibold text-gray-700"
                            >
                              {slug}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Step 3: Where to Sell */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                        Where do you plan to sell?
                      </h2>
                      <p className="text-gray-600">
                        Select all that apply
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {sellLocations.map((location) => {
                        const Icon = location.icon;
                        const isSelected = formData.sellLocations.includes(location.id);
                        return (
                          <button
                            key={location.id}
                            type="button"
                            onClick={() => handleSellLocationToggle(location.id)}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <Icon className={`w-6 h-6 flex-shrink-0 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                              <div className="flex-1">
                                <h3 className={`font-semibold text-sm mb-1 ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                                  {location.title}
                                </h3>
                                <p className={`text-xs ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                                  {location.description}
                                </p>
                              </div>
                              {isSelected && (
                                <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Business Goal */}
                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                        What's your business goal?
                      </h2>
                      <p className="text-gray-600">
                        This helps us tailor your experience
                      </p>
                    </div>

                    <div className="space-y-3">
                      {businessGoals.map((goal) => {
                        const Icon = goal.icon;
                        const isSelected = formData.businessGoal === goal.id;
                        return (
                          <button
                            key={goal.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, businessGoal: goal.id })}
                            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <Icon className={`w-6 h-6 flex-shrink-0 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                              <div className="flex-1">
                                <h3 className={`font-semibold text-sm mb-1 ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                                  {goal.title}
                                </h3>
                                <p className={`text-xs ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                                  {goal.description}
                                </p>
                              </div>
                              {isSelected && (
                                <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Step 5: Product Type */}
                {currentStep === 5 && (
                  <motion.div
                    key="step5"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                        What will you sell?
                      </h2>
                      <p className="text-gray-600">
                        Choose the type of products you'll offer
                      </p>
                    </div>

                    <div className="space-y-3">
                      {productTypes.map((type) => {
                        const Icon = type.icon;
                        const isSelected = formData.productType === type.id;
                        return (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, productType: type.id })}
                            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <Icon className={`w-6 h-6 flex-shrink-0 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                              <div className="flex-1">
                                <h3 className={`font-semibold text-sm mb-1 ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                                  {type.title}
                                </h3>
                                <p className={`text-xs ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                                  {type.description}
                                </p>
                              </div>
                              {isSelected && (
                                <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl mt-6"
                >
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </motion.div>
              )}

              <div className="flex gap-4 mt-8">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-all active:scale-95"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                  </button>
                )}
                
                {currentStep < 5 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={storeNameStatus === 'checking'}
                    className="flex-1 flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-blue-500 rounded-full hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {storeNameStatus === 'checking' ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-blue-500 rounded-full hover:bg-blue-600 transition-all active:scale-95 shadow-lg"
                  >
                    Create Store
                    <ArrowRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </form>
          </div>

          <p className="text-center text-sm text-gray-600 mt-8">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-semibold text-blue-600 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default withoutAuth(SignUpPage);
