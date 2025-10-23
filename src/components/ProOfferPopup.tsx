'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Zap, BarChart2, ShieldCheck, Users } from 'lucide-react';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import useOnClickOutside from '../hooks/useOnClickOutside';

export function ProOfferPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [remainingSpots, setRemainingSpots] = useState(100);
  const [isLoading, setIsLoading] = useState(true);
  const popupRef = useRef<HTMLDivElement | null>(null);

  useOnClickOutside(popupRef, () => handleClose());

  useEffect(() => {
    const checkAndShowPopup = async () => {
      const hasSeenPopup = localStorage.getItem('proOfferSeen');
      if (hasSeenPopup) {
        setIsLoading(false);
        return;
      }

      try {
        const promoRef = doc(db, 'promoConfig', 'earlyAccess');
        const promoSnap = await getDoc(promoRef);
        if (promoSnap.exists()) {
          const data = promoSnap.data();
          const spotsLeft = (data.totalSpots || 100) - (data.usedSpots || 0);
          if (data.isActive && spotsLeft > 0) {
            setRemainingSpots(spotsLeft);
            setIsOpen(true);
          }
        } else {
          setRemainingSpots(100);
          setIsOpen(true);
        }
      } catch (error) {
        console.error('Error fetching promo data:', error);
        setRemainingSpots(100);
        setIsOpen(true);
      }
      setIsLoading(false);
    };

    const timer = setTimeout(checkAndShowPopup, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    if (isOpen) {
      setIsOpen(false);
      localStorage.setItem('proOfferSeen', 'true');
    }
  };

  const handleSignup = () => {
    localStorage.setItem('proOfferSeen', 'true');
  };

  if (isLoading) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          >
            <div
              ref={popupRef}
              className="relative w-full max-w-md sm:max-w-lg md:max-w-3xl lg:max-w-5xl backdrop-blur-xl border border-gray-200 text-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 sm:top-5 sm:right-5 p-1.5 rounded-full bg-gray-500/10 hover:bg-gray-500/20 transition-colors z-10"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              <div className="flex flex-col md:flex-row flex-grow">
                {/* Left Column - Content */}
                <div className="w-full md:w-1/2 p-8 sm:p-10 md:p-12 bg-white/80">
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-blue-500">
                    Introducing
                  </h2>
                  <h3 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
                    Lifetime Pro Access
                  </h3>
                  
                  <p className="mt-6 text-base text-gray-600 leading-relaxed">
                    Be one of the first <span className="font-semibold text-gray-800">{remainingSpots} users</span> to sign up and get lifetime access to all Pro features, including advanced tools and priority support.
                  </p>

                  <Link
                    href="/signup"
                    onClick={handleSignup}
                    className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto mt-8 py-4 px-8 bg-blue-500 text-white text-base font-semibold rounded-full hover:bg-blue-600 transition-all active:scale-[0.98] shadow-lg shadow-blue-500/30"
                  >
                    Upgrade to Pro
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                {/* Right Column - Visual */}
                <div className="w-full md:w-1/2 flex flex-col p-8 sm:p-10 md:p-12 bg-gray-100/80">
                  <div className="flex-grow flex flex-col items-center justify-center gap-4 sm:gap-6 w-full">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, duration: 0.5 }}
                      className="w-full max-w-xs bg-white border border-gray-200 rounded-2xl p-4 shadow-md"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-gray-500" />
                          <span className="text-sm font-medium text-gray-600">Spots Remaining</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">{remainingSpots}<span className="text-gray-400 font-medium">/100</span></p>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-blue-500 rounded-full"
                          initial={{ width: '0%' }}
                          animate={{ width: `${(100 - remainingSpots) / 100 * 100}%` }}
                          transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                        />
                      </div>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      className="flex items-center gap-3 bg-white border border-gray-200 rounded-full px-6 py-3 text-base sm:text-lg font-medium shadow-md"
                    >
                      <BarChart2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                      <span>Advanced Analytics</span>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4, duration: 0.3 }}
                      className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full flex items-center justify-center text-xl sm:text-2xl text-gray-500"
                    >
                      +
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                      className="flex items-center gap-3 bg-white border border-gray-200 rounded-full px-6 py-3 text-base sm:text-lg font-medium shadow-md"
                    >
                      <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                      <span>Priority Support</span>
                    </motion.div>
                  </div>
                  <div className="flex-shrink-0 flex justify-center pt-6">
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1, duration: 0.5 }}
                      className="flex items-center gap-2 text-sm bg-blue-100 border border-blue-200 text-blue-600 rounded-full px-4 py-1.5"
                    >
                      <Zap className="w-4 h-4" />
                      Lifetime Access
                    </motion.span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
