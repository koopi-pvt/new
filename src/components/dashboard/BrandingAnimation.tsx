"use client";

import { motion } from 'framer-motion';

const BrandingAnimation = () => {
  return (
    <div className="mt-8 flex justify-center items-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="text-sm text-gray-500"
      >
        Powered by{' '}
        <span className="font-bold text-gray-700">Koopi</span>
      </motion.div>
    </div>
  );
};

export default BrandingAnimation;