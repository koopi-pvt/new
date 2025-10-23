'use client';

import React, { useState, useEffect } from 'react';
import { Package, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

type ImageGalleryProps = {
  images: string[];
  productName: string;
};

export function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isSlideshowActive, setIsSlideshowActive] = useState(true);
  const [panning, setPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isSlideshowActive) {
      const interval = setInterval(() => {
        setSelectedImage(prev => (prev + 1) % images.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [images.length, isSlideshowActive]);

  const handlePrev = () => {
    setSelectedImage(prev => (prev - 1 + images.length) % images.length);
    setIsSlideshowActive(false);
  };

  const handleNext = () => {
    setSelectedImage(prev => (prev + 1) % images.length);
    setIsSlideshowActive(false);
  };

  const handleThumbnailClick = (idx: number) => {
    setSelectedImage(idx);
    setIsSlideshowActive(false);
    setZoom(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (zoom > 1) {
      setPanning(true);
      setPanStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (panning) {
      const x = e.clientX - panStart.x;
      const y = e.clientY - panStart.y;
      setPanPosition({ x, y });
    }
  };

  const handleMouseUp = () => {
    setPanning(false);
  };

  const handleMouseLeave = () => {
    setPanning(false);
  };

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-white/50 rounded-xl flex items-center justify-center border border-gray-200/50">
        <Package className="w-24 h-24 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-square bg-white/50 rounded-xl overflow-hidden border border-gray-200/50 shadow-inner">
        <img
          src={images[selectedImage]}
          alt={productName}
          className={`w-full h-full object-cover transition-transform duration-300 ${panning ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{ transform: `scale(${zoom}) translate(${panPosition.x}px, ${panPosition.y}px)` }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        />
        {images.length > 1 && (
          <>
            <button onClick={handlePrev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button onClick={handleNext} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-colors">
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
        <div className="absolute top-2 right-2 flex gap-2">
          <button onClick={() => setZoom(z => Math.min(z + 0.2, 3))} className="bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-colors">
            <ZoomIn className="w-6 h-6" />
          </button>
          <button onClick={() => setZoom(z => Math.max(z - 0.2, 1))} className="bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-colors">
            <ZoomOut className="w-6 h-6" />
          </button>
        </div>
      </div>
      
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-3">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => handleThumbnailClick(idx)}
              className={`aspect-square bg-white/50 rounded-lg overflow-hidden border-2 transition-all ${
                selectedImage === idx ? 'border-blue-500 ring-2 ring-blue-500/50' : 'border-transparent hover:border-gray-300/50'
              }`}
            >
              <img src={img} alt={`${productName} ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}