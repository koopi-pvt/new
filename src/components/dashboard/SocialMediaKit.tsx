"use client";

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import useOnClickOutside from '@/hooks/useOnClickOutside';
import { X, Download, Palette, Check, ArrowRight, Share2, Instagram, Facebook, Twitter } from 'lucide-react';
import { motion } from 'framer-motion';
import * as htmlToImage from 'html-to-image';

type SocialMediaKitProps = {
  storeName: string;
  storeUrl: string;
  onClose: () => void;
};

const templates = [
    {
        id: 'apple-light',
        name: 'Minimal Light',
        preview: (storeName: string) => (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center p-12 font-sans">
                <div className="text-center">
                    <h1 className="text-6xl font-bold text-black tracking-tight mb-4">{storeName}</h1>
                    <p className="text-2xl text-gray-600">Now Available Online.</p>
                    <div className="mt-8 px-8 py-4 bg-white rounded-full shadow-md">
                        <p className="text-lg font-semibold text-black">Shop Now</p>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'apple-dark',
        name: 'Minimal Dark',
        preview: (storeName: string) => (
            <div className="w-full h-full bg-black flex items-center justify-center p-12 font-sans">
                <div className="text-center">
                    <h1 className="text-6xl font-bold text-white tracking-tight mb-4">{storeName}</h1>
                    <p className="text-2xl text-gray-400">Now Available Online.</p>
                    <div className="mt-8 px-8 py-4 bg-gray-800 rounded-full">
                        <p className="text-lg font-semibold text-white">Shop Now</p>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'gradient-vibrant',
        name: 'Vibrant Gradient',
        preview: (storeName: string) => (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-12 font-sans">
                <div className="text-center">
                    <h1 className="text-6xl font-extrabold text-white tracking-tight mb-4" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>{storeName}</h1>
                    <p className="text-2xl text-white/90">We're Live!</p>
                    <div className="mt-8 px-8 py-4 bg-white/20 backdrop-blur-sm rounded-full">
                        <p className="text-lg font-semibold text-white">Explore The New Collection</p>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'simple-and-clean',
        name: 'Simple & Clean',
        preview: (storeName: string) => (
            <div className="w-full h-full bg-white flex flex-col items-center justify-center p-12 font-sans">
                <div className="text-left w-full">
                    <p className="text-2xl text-gray-500">Grand Opening</p>
                    <h1 className="text-7xl font-bold text-black tracking-tighter my-4">{storeName}</h1>
                    <div className="w-24 h-1.5 bg-black"></div>
                    <p className="text-xl text-gray-600 mt-6">Visit us online to see what's new.</p>
                </div>
            </div>
        )
    },
    {
        id: 'modern-bold',
        name: 'Modern Bold',
        preview: (storeName: string) => (
            <div className="w-full h-full bg-yellow-400 flex flex-col items-center justify-center p-12 font-sans">
                <div className="text-center">
                    <p className="text-xl font-medium text-black">EST. 2025</p>
                    <h1 className="text-8xl font-black text-black tracking-tighter my-2">{storeName}</h1>
                    <p className="text-2xl font-bold text-black bg-black text-white py-2 px-4 inline-block">NOW OPEN</p>
                </div>
            </div>
        )
    },
    {
        id: 'elegant-serif',
        name: 'Elegant Serif',
        preview: (storeName: string) => (
            <div className="w-full h-full bg-[#F3EFEA] flex items-center justify-center p-12" style={{ fontFamily: "'Playfair Display', serif" }}>
                <div className="text-center">
                    <p className="text-2xl text-[#8B8589]">A New Shopping Experience</p>
                    <h1 className="text-7xl font-bold text-[#3A3535] my-6">{storeName}</h1>
                    <p className="text-xl text-[#8B8589] tracking-widest">VISIT OUR WEBSITE</p>
                </div>
            </div>
        )
    },
];

export default function SocialMediaKit({ storeName, storeUrl, onClose }: SocialMediaKitProps) {
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useOnClickOutside(modalRef, onClose);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleDownload = async () => {
    if (!cardRef.current) return;

    setIsDownloading(true);
    try {
      const targetWidth = 1080;
      const targetHeight = 1080;
      const pixelRatio = 2;

      const dataUrl = await htmlToImage.toPng(cardRef.current, {
        width: targetWidth,
        height: targetHeight,
        canvasWidth: targetWidth * pixelRatio,
        canvasHeight: targetHeight * pixelRatio,
        pixelRatio: 1,
        style: {
          transform: `scale(${pixelRatio})`,
          transformOrigin: 'top left',
          width: `${targetWidth}px`,
          height: `${targetHeight}px`,
        },
      });

      const link = document.createElement('a');
      link.download = `${storeName.replace(/\s+/g, '-')}-launch.png`;
      link.href = dataUrl;
      link.click();

    } catch (error) {
      console.error('Oops, something went wrong!', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const modalContent = (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 pointer-events-none">
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="w-full h-full max-w-6xl bg-white/80 backdrop-blur-2xl border border-gray-200/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto"
        >
          <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-5 border-b border-gray-200/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200/80 rounded-full flex items-center justify-center">
                <Share2 className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Social Media Launch Kit</h2>
                <p className="text-sm text-gray-600">Create a beautiful announcement for your store.</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-gray-200/50 hover:bg-gray-300/60 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-px bg-gray-200/80 overflow-y-auto">
            <div className="col-span-2 bg-gray-50/80 flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12">
              <motion.div
                key={selectedTemplate.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full max-w-[500px] aspect-square"
              >
                <div ref={cardRef} className="w-full h-full">
                  <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border-2 border-white">
                    {selectedTemplate.preview(storeName)}
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="bg-white/80 flex flex-col p-4 sm:p-6 lg:p-8 overflow-y-auto">
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-gray-600" />
                    Choose a Template
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {templates.map((template) => (
                      <motion.button
                        key={template.id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedTemplate(template)}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                          selectedTemplate.id === template.id
                            ? 'border-blue-500 ring-4 ring-blue-200'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-full h-full scale-[0.25] origin-top-left" style={{ width: '400%', height: '400%' }}>
                          {template.preview(storeName)}
                        </div>
                        {selectedTemplate.id === template.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white"
                          >
                            <Check className="w-4 h-4 text-white" />
                          </motion.div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/30 p-2">
                          <p className="text-xs font-medium text-white text-center truncate">{template.name}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Download className="w-5 h-5 text-gray-600" />
                    Download & Share
                  </h3>
                  <motion.button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all hover:bg-gray-800 disabled:opacity-60"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isDownloading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        Download Image
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </motion.button>
                  <div className="flex items-center justify-center gap-4 pt-4 mt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">Perfect for:</div>
                    <Instagram className="w-5 h-5 text-gray-500" />
                    <Facebook className="w-5 h-5 text-gray-500" />
                    <Twitter className="w-5 h-5 text-gray-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );

  if (!isMounted) {
    return null;
  }

  return createPortal(modalContent, document.body);
}