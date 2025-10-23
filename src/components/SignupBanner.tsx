'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Zap, Star, Users, Check } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export function SignupBanner() {
  const [remainingSpots, setRemainingSpots] = useState(100);

  useEffect(() => {
    const fetchPromoData = async () => {
      try {
        const promoRef = doc(db, 'promoConfig', 'earlyAccess');
        const promoSnap = await getDoc(promoRef);
        
        if (promoSnap.exists()) {
          const data = promoSnap.data();
          const spotsLeft = (data.totalSpots || 100) - (data.usedSpots || 0);
          setRemainingSpots(spotsLeft);
        }
      } catch (error) {
        console.error('Error fetching promo data:', error);
      }
    };

    fetchPromoData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchPromoData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-full bg-black rounded-3xl overflow-hidden">
      {/* Content */}
      <div className="relative h-full p-10 flex flex-col justify-between">
        {/* Top Section */}
        <div>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8"
          >
            <Star className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white/90 uppercase tracking-wide">
              Limited Offer
            </span>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl lg:text-5xl font-semibold text-white mb-6 leading-tight tracking-tight"
          >
            Early Access
            <br />
            Pro Features
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-white/60 text-base mb-10 leading-relaxed"
          >
            First 100 members get lifetime Pro access. No credit card required.
          </motion.p>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4 mb-10"
          >
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <Crown className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium mb-0.5">Lifetime Pro Access</h3>
                <p className="text-white/50 text-sm">All premium features included</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium mb-0.5">Priority Support</h3>
                <p className="text-white/50 text-sm">Faster response times</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium mb-0.5">No Expiration</h3>
                <p className="text-white/50 text-sm">Yours forever, completely free</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section - Counter */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="relative"
        >
          <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-white/60" />
                  <p className="text-white/50 text-xs font-medium uppercase tracking-wide">Available</p>
                </div>
                <p className="text-5xl font-semibold text-white tracking-tight">{remainingSpots}</p>
              </div>
              <div className="text-right">
                <p className="text-white/50 text-xs font-medium uppercase tracking-wide mb-1">Total</p>
                <p className="text-5xl font-semibold text-white/30 tracking-tight">100</p>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(remainingSpots / 100) * 100}%` }}
                transition={{ duration: 1, delay: 0.8 }}
                className="h-full bg-white rounded-full"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
