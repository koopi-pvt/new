"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Share2, Sparkles, ArrowRight, X, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SocialMediaKit from './SocialMediaKit';

type SocialMediaKitCardProps = {
  storeName: string;
  storeUrl: string;
  onDismiss?: () => void;
};

export default function SocialMediaKitCard({ storeName, storeUrl, onDismiss }: SocialMediaKitCardProps) {
  const [showKit, setShowKit] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative backdrop-blur-2xl bg-white/70 rounded-[24px] border border-white/30 shadow-2xl p-6 sm:p-8 h-full flex flex-col"
      >
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 p-2 bg-gray-200/50 hover:bg-gray-300/60 rounded-full transition-colors z-10"
            title="Dismiss"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        )}

        <div className="flex-grow flex flex-col">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="px-3 py-1 rounded-full bg-green-100 border border-green-200"
                >
                  <span className="text-xs sm:text-sm font-medium text-green-700">
                    Your Website is Live!
                  </span>
                </motion.div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Share Your Store
              </h2>
              <p className="text-gray-600 text-base">
                Your store is live! Create a beautiful announcement post for your social media.
              </p>
            </div>
            
            <div className="hidden sm:block self-center">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center">
                <Share2 className="w-12 h-12 md:w-16 md:h-16 text-blue-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-6 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => setShowKit(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors shadow-md active:scale-95 w-full justify-center"
          >
            Create Launch Post
            <ArrowRight className="w-4 h-4" />
          </button>
          <Link href="/dashboard/marketing-studio" className="w-full">
            <button
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-full text-sm font-medium hover:bg-black transition-colors shadow-md active:scale-95 w-full justify-center"
            >
              <Sparkles className="w-4 h-4" />
              Marketing Studio
            </button>
          </Link>
        </div>
      </motion.div>

      <AnimatePresence>
        {showKit && (
          <SocialMediaKit
            storeName={storeName}
            storeUrl={storeUrl}
            onClose={() => setShowKit(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
