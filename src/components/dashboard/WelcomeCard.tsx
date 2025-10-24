"use client";

import { Circle, CheckCircle, Package, Palette, CreditCard, ArrowRight, Globe, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';
import Confetti from 'react-confetti';
import { motion } from 'framer-motion';

type WelcomeCardProps = {
  hasProducts: boolean;
  hasCustomizedStore: boolean;
  hasPaymentSetup: boolean;
};

const WelcomeCard = ({ hasProducts, hasCustomizedStore, hasPaymentSetup }: WelcomeCardProps) => {
  const router = useRouter();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [websiteEnabled, setWebsiteEnabled] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [isExploding, setIsExploding] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    if (localStorage.getItem('welcomeCardComplete') === 'true') {
      setIsComplete(true);
    }
  }, []);

  useEffect(() => {
    if (hasProducts && hasCustomizedStore) {
      setIsExploding(true);
      localStorage.setItem('welcomeCardComplete', 'true');
    }
  }, [hasProducts, hasCustomizedStore]);

  useEffect(() => {
    if (!user) return;

    const storeRef = doc(db, 'stores', user.uid);
    const unsubscribe = onSnapshot(storeRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setWebsiteEnabled(data.website?.enabled || false);
        setStoreName(data.storeName || '');
      }
    });

    return () => unsubscribe();
  }, [user]);
  
  // Calculate progress
  const completedTasks = [hasProducts, hasCustomizedStore].filter(Boolean).length;
  const totalTasks = 2;
  const allTasksComplete = completedTasks === totalTasks;

  // Determine current task based on what's completed
  let currentTask = {
    title: 'Add your first product',
    description: 'Start by adding a product and a few key details.',
    buttonText: 'Get started',
    icon: Package,
    step: 1,
    action: () => {
      console.log('Navigating to add product');
      router.push('/dashboard/products/new?from=dashboard');
    }
  };

  if (hasProducts && !hasCustomizedStore) {
    currentTask = {
      title: 'Customize your website',
      description: 'Design your store website with custom hero section, colors, and branding.',
      buttonText: 'Customize website',
      icon: Palette,
      step: 2,
      action: () => {
        console.log('Customize website clicked');
        router.push('/dashboard/website');
      }
    };
  }

  const TaskIcon = currentTask.icon;

  if (!mounted) {
    return null;
  }

  if (allTasksComplete) {
    return (
      <>
        {isExploding && <Confetti recycle={false} onConfettiComplete={() => setIsExploding(false)} />}
        <motion.div
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 0, scale: 0.8, transition: { duration: 0.5, delay: 2 } }}
          onAnimationComplete={() => setIsComplete(true)}
          className="backdrop-blur-2xl bg-white/70 rounded-[24px] border border-white/30 shadow-2xl p-4 sm:p-6 md:p-8 mb-8"
        >
          <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-7 h-7 text-green-600" />
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-green-600">
                  All tasks complete!
                </h2>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-3">
                Your store is ready to launch
              </h1>
              <p className="text-gray-600 text-base mb-4">
                Great job! You've completed all the setup tasks. Your digital product business is ready to go.
              </p>

              {websiteEnabled && storeName && (
                <div className="flex items-center gap-3 p-4 bg-white/50 rounded-lg border border-gray-200/50">
                  <Globe className="w-5 h-5 text-gray-700" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-1">Your Store Website</p>
                    <Link
                      href={
                        typeof window !== 'undefined' && window.location.hostname === 'localhost'
                          ? `/store/${storeName}`
                          : `https://${storeName}.${process.env.NEXT_PUBLIC_BASE_DOMAIN || 'koopi.online'}`
                      }
                      target="_blank"
                      className="text-sm text-gray-600 hover:text-gray-900 hover:underline flex items-center gap-1 break-all"
                    >
                      {typeof window !== 'undefined' && window.location.hostname === 'localhost'
                        ? `${window.location.origin}/store/${storeName}`
                        : `https://${storeName}.${process.env.NEXT_PUBLIC_BASE_DOMAIN || 'koopi.online'}`}
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            <div className="hidden lg:block ml-8 flex-shrink-0 self-center">
              <div className="w-40 h-40 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl flex items-center justify-center">
                <CheckCircle className="w-24 h-24 text-green-600" />
              </div>
            </div>
          </div>
        </motion.div>
      </>
    );
  }
  if (isComplete) {
    return null;
  }

  return (
    <div className="backdrop-blur-2xl bg-white/70 rounded-[24px] border border-white/30 shadow-2xl p-4 sm:p-6 md:p-8 mb-8">
      <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
        <div className="flex-1">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center flex-shrink-0 border border-gray-200/50">
                <Circle className="w-6 h-6 text-gray-600" />
              </div>
              <span className="text-sm sm:text-base font-medium text-gray-500">
                {completedTasks} of {totalTasks} tasks complete
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Set up your digital product business
            </h1>
            <p className="text-gray-600 text-base">
              Follow these tasks to quickly set up, manage, and successfully sell your digital products.
            </p>
          </div>

          {/* Current Active Task - Prominent Display */}
          <div className="bg-white/50 rounded-xl p-4 sm:p-6 border-2 border-blue-200/50 mb-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <TaskIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                      {currentTask.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {currentTask.description}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-full border border-gray-200 flex-shrink-0 self-start sm:self-center">
                    Step {currentTask.step}
                  </span>
                </div>
                <button
                  onClick={currentTask.action}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors shadow-md active:scale-95"
                >
                  {currentTask.buttonText}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            {/* Step 1 */}
            <div className="flex items-center gap-2">
              {hasProducts ? (
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <Package className="w-4 h-4 text-green-600" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <Package className="w-4 h-4 text-gray-400" />
                </div>
              )}
              <span className={`text-sm font-medium ${hasProducts ? 'text-green-600' : 'text-gray-500'}`}>
                Add product
              </span>
            </div>

            {/* Divider */}
            <div className="w-full sm:w-8 h-px bg-gray-300"></div>

            {/* Step 2 */}
            <div className="flex items-center gap-2">
              {hasCustomizedStore ? (
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <Palette className="w-4 h-4 text-green-600" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <Palette className="w-4 h-4 text-gray-400" />
                </div>
              )}
              <span className={`text-sm font-medium ${hasCustomizedStore ? 'text-green-600' : 'text-gray-500'}`}>
                Customize
              </span>
            </div>

          </div>
        </div>
        
        {/* Right Side Illustration */}
        <div className="hidden lg:block flex-shrink-0 self-center">
          <div className="w-40 h-40 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center">
            <Package className="w-20 h-20 text-blue-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeCard;