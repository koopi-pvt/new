"use client";
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { db, storage } from '@/firebase';
import { collection, addDoc, doc, updateDoc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, X, Upload, ArrowRight, ArrowLeft, Package, DollarSign, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { VariantEditor } from '@/components/dashboard/VariantEditor';
import { ReviewManagement } from '@/components/dashboard/ReviewManagement';
import { RelatedProductSelector } from '@/components/dashboard/RelatedProductSelector';
import { PageLoader } from '@/components/ui/PageLoader';

const AddProductPage = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from'); // 'dashboard' or 'products'
  
  const [currentStep, setCurrentStep] = useState(1);
  const [productType, setProductType] = useState('');
  
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Active');
  const [type, setType] = useState('');
  const [vendor, setVendor] = useState('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('100.00');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [inventoryTracked, setInventoryTracked] = useState(false);
  const [chargeTax, setChargeTax] = useState(true);
  const [variants, setVariants] = useState<{ name: string; options: { value: string }[] }[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<string[]>([]);
  const [variantStock, setVariantStock] = useState<{ [key: string]: number }>({});
  
  // Media states
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Celebration state
  const [showCelebration, setShowCelebration] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  // Set page title
  useEffect(() => {
    document.title = 'Add Product - Koopi Dashboard';
  }, []);

  // Fetch product type from user's onboarding
  useEffect(() => {
    const fetchProductType = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const savedProductType = userData.onboarding?.productType || 'physical';
          setProductType(savedProductType);
        }
      }
    };
    fetchProductType();
  }, [user]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Set window size for confetti
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });

      const handleResize = () => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight
        });
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    if (inventoryTracked && variants.length > 0) {
      const totalStock = Object.values(variantStock).reduce((acc, stock) => acc + stock, 0);
      setQuantity(totalStock.toString());
    }
  }, [variantStock, inventoryTracked, variants]);

  const getCategoriesForType = () => {
    if (productType === 'digital') {
      return [
        { value: 'ebooks', label: 'E-books' },
        { value: 'courses', label: 'Online Courses' },
        { value: 'software', label: 'Software' },
        { value: 'templates', label: 'Templates' },
        { value: 'music', label: 'Music & Audio' },
        { value: 'graphics', label: 'Graphics & Design' },
      ];
    } else if (productType === 'services') {
      return [
        { value: 'consulting', label: 'Consulting' },
        { value: 'coaching', label: 'Coaching' },
        { value: 'design', label: 'Design Services' },
        { value: 'development', label: 'Development' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'other', label: 'Other Services' },
      ];
    } else {
      return [
        { value: 'fashion', label: 'Fashion & Apparel' },
        { value: 'electronics', label: 'Electronics' },
        { value: 'home', label: 'Home & Garden' },
        { value: 'art', label: 'Art & Crafts' },
        { value: 'toys', label: 'Toys & Games' },
        { value: 'other', label: 'Other' },
      ];
    }
  };

  const getVariantCombinations = () => {
    if (variants.length === 0) return [];

    const combinations = variants.reduce((acc, variant) => {
      if (acc.length === 0) {
        return variant.options.map(option => ({ [variant.name]: option.value }));
      }
      return acc.flatMap(combination =>
        variant.options.map(option => ({ ...combination, [variant.name]: option.value }))
      );
    }, [] as { [key: string]: string }[]);

    return combinations;
  };

  const handleVariantStockChange = (variantKey: string, value: string) => {
    setVariantStock(prev => ({ ...prev, [variantKey]: parseInt(value) || 0 }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  const processFiles = (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const nonImageFiles = files.filter(file => !file.type.startsWith('image/'));

    if (nonImageFiles.length > 0) {
      alert(`Only image files are accepted. The following files were ignored: ${nonImageFiles.map(f => f.name).join(', ')}`);
    }
    
    if (imageFiles.length > 0) {
      setMediaFiles(prev => [...prev, ...imageFiles]);
      
      imageFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setMediaPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadMedia = async (): Promise<string[]> => {
    if (mediaFiles.length === 0) return [];
    
    const uploadedUrls: string[] = [];
    const totalFiles = mediaFiles.length;
    
    for (let i = 0; i < mediaFiles.length; i++) {
      const file = mediaFiles[i];
      try {
        const storageRef = ref(storage, `products/${user?.uid}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        uploadedUrls.push(url);
        
        // Update progress
        setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
        throw new Error(`Failed to upload ${file.name}. Please check CORS configuration.`);
      }
    }
    
    return uploadedUrls;
  };

  const handleNext = () => {
    if (currentStep === 1 && !title.trim()) {
      alert('Please enter a product title');
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSave = async () => {
    if (!user) {
      alert('Authentication error. Please refresh and try again.');
      return;
    }
    
    if (!title.trim()) {
      alert('Please enter a product title');
      return;
    }

    // Validate category is required
    if (!category) {
      alert('Please select a category for your product');
      return;
    }

    // Validate description minimum word count
    const descriptionWords = description.trim().split(/\s+/).filter(word => word.length > 0);
    if (descriptionWords.length < 20) {
      alert(`Description must be at least 20 words. Currently: ${descriptionWords.length} words`);
      return;
    }

    // Validate minimum 4 tags
    const tagList = tags.split(',').map(tag => tag.trim()).filter(Boolean);
    if (tagList.length < 4) {
      alert(`Please add at least 4 tags. Currently: ${tagList.length} tags`);
      return;
    }

    // Validate minimum price
    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue < 100) {
      alert('Price must be at least LKR 100.00');
      return;
    }

    setSaving(true);

    try {
      // No subscription limit - everything is free!
      
      const storeRef = doc(db, 'stores', user.uid);
      const storeDoc = await getDoc(storeRef);
      const isFirstProduct = !storeDoc.exists() || !storeDoc.data()?.hasProducts;
      
      let mediaUrls: string[] = [];
      if (mediaFiles.length > 0) {
        setUploading(true);
        mediaUrls = await uploadMedia();
        setUploading(false);
      }

      const productData = {
        name: title,
        title,
        description,
        status,
        type: type || (productType === 'digital' ? 'Digital Product' : productType === 'services' ? 'Service' : 'Physical Product'),
        vendor: vendor || '',
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        category: category || '',
        price: parseFloat(price) || 0,
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        inventory: inventoryTracked ? parseInt(quantity) || 0 : 999999,
        quantity: inventoryTracked ? parseInt(quantity) || 0 : 999999,
        inventoryTracked,
        chargeTax,
        images: mediaUrls, // Renamed from mediaUrls for consistency
        mediaUrls, // Keep for backward compatibility
        storeId: user.uid,
        userId: user.uid,
        productType: productType,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        variants: variants,
        relatedProducts,
        variantStock,
        averageRating: 0,
        reviewCount: 0,
      };

      await addDoc(collection(db, 'products'), productData);

      // Increment product count for the user
      if (userProfile?.subscription) {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          'subscription.productCount': userProfile.subscription.productCount + 1,
          'onboarding.addedFirstProduct': true,
        });
      }

      if (storeDoc.exists()) {
        await updateDoc(storeRef, {
          hasProducts: true,
          updatedAt: serverTimestamp()
        });
      } else {
        await setDoc(storeRef, {
          hasProducts: true,
          hasCustomizedStore: false,
          hasPaymentSetup: false,
          userId: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      if (isFirstProduct) {
        setShowCelebration(true);
        setTimeout(() => {
          setShowCelebration(false);
          // Redirect based on where they came from
          if (from === 'dashboard') {
            router.push('/dashboard');
          } else {
            router.push('/dashboard/products');
          }
        }, 3000);
      } else {
        if (from === 'dashboard') {
          router.push('/dashboard');
        } else {
          router.push('/dashboard/products');
        }
      }
      
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product: ' + (error as Error).message);
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  if (authLoading) {
    return <PageLoader message="Loading..." primaryColor="#000000" backgroundColor="#f1f1f1" />;
  }

  if (!user) {
    return null;
  }

  const steps = [
    { id: 1, title: 'Basic Info', icon: Package },
    { id: 2, title: 'Media & Inventory', icon: ImageIcon },
    { id: 3, title: 'Pricing', icon: DollarSign },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f7] relative overflow-hidden">
      {/* macOS-style background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      
      {showCelebration && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}
      
      <div className="relative z-10 max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header - macOS style */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6 backdrop-blur-xl bg-white/60 rounded-[20px] p-4 sm:p-5 border border-white/20 shadow-lg"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href={from === 'dashboard' ? '/dashboard' : '/dashboard/products'}
              className="group flex items-center justify-center w-9 h-9 rounded-full bg-black/5 hover:bg-black/10 active:scale-95 transition-all duration-150"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-3xl font-semibold text-gray-900 tracking-tight">Add New Product</h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">Create and customize your product listing</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              'Save Product'
            )}
          </button>
        </motion.div>

        {/* Progress Steps - macOS style */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between max-w-3xl mx-auto backdrop-blur-xl bg-white/60 rounded-[20px] border border-white/20 shadow-lg p-4 sm:p-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center w-full">
                  <motion.div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      currentStep > step.id
                        ? 'bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                        : currentStep === step.id
                        ? 'bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.4)]'
                        : 'bg-gray-200'
                    }`}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <step.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${
                      currentStep >= step.id
                        ? 'text-white'
                        : 'text-gray-400'
                    }`} />
                  </motion.div>
                  <div className="mt-2 text-center">
                    <p className={`text-xs font-medium transition-colors ${
                      currentStep >= step.id
                        ? 'text-gray-900'
                        : 'text-gray-400'
                    }`}>
                      <span className="hidden sm:inline">{step.title}</span>
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 sm:mx-4 rounded-full transition-all duration-300 ${
                    currentStep > step.id
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Form Content - macOS glassmorphism */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="backdrop-blur-2xl bg-white/70 rounded-[24px] border border-white/30 shadow-2xl p-6 sm:p-10"
        >
          <AnimatePresence mode="wait">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-7"
              >
                <div className="pb-5">
                  <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-1">Basic Information</h2>
                  <p className="text-sm sm:text-base text-gray-600">Tell us about your product to get started</p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Premium Cotton T-Shirt"
                      className="w-full px-4 py-3.5 bg-white/80 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm placeholder:text-gray-400 shadow-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={5}
                      className="w-full px-4 py-3.5 bg-white/80 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm resize-none placeholder:text-gray-400 shadow-sm"
                      placeholder="Describe your product in detail... Tell customers what makes it special!"
                    />
                    <p className="text-xs text-gray-500 mt-1.5">
                      Minimum 20 words required. Current: {description.trim().split(/\s+/).filter(word => word.length > 0).length} words
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full px-4 py-3.5 bg-white/80 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm appearance-none shadow-sm"
                        >
                          <option value="">Select a category</option>
                          {getCategoriesForType().map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-4 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tags <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="summer, cotton, casual, comfortable"
                        className="w-full px-4 py-3.5 bg-white/80 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm placeholder:text-gray-400 shadow-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1.5">
                        Minimum 4 tags required (comma-separated). Current: {tags.split(',').map(tag => tag.trim()).filter(Boolean).length} tags
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Media & Inventory */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-7"
              >
                {/* Product Images Section */}
                <div>
                  <div className="pb-5 mb-6">
                    <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-1">Product Images</h2>
                    <p className="text-sm sm:text-base text-gray-600">Upload high-quality images to showcase your product</p>
                  </div>

                  {mediaPreviews.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-5">
                      {mediaPreviews.map((preview, index) => (
                        <motion.div 
                          key={index} 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative group"
                        >
                          <div className="relative aspect-square rounded-2xl overflow-hidden bg-white/80 border border-gray-200 group-hover:shadow-lg transition-all">
                            <img 
                              src={preview} 
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]" />
                          </div>
                          <button
                            onClick={() => removeMedia(index)}
                            className="absolute -top-1.5 -right-1.5 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          {index === 0 && (
                            <span className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2.5 py-1 rounded-full font-medium shadow-md">
                              Main
                            </span>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                  
                  <div
                    className={`relative border-2 border-dashed rounded-2xl p-10 transition-all duration-300 overflow-hidden ${
                      isDragging 
                        ? 'border-blue-500 bg-blue-50/50 scale-[1.01]' 
                        : 'border-gray-300 hover:border-gray-400 bg-white/50'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center justify-center text-center relative z-10">
                      <motion.div 
                        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg"
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Upload className="w-8 h-8 text-white" />
                      </motion.div>
                      <div className="mb-2">
                        <label
                          htmlFor="file-upload"
                          className="text-blue-600 hover:text-blue-700 font-semibold text-base cursor-pointer transition-colors"
                        >
                          Click to upload
                        </label>
                        <span className="text-base text-gray-600"> or drag and drop</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        PNG, JPG, GIF up to 10MB
                      </p>
                      <p className="text-xs text-gray-400 mt-1.5">
                        First image will be the main product image
                      </p>
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Variants Section */}
                <div className="pt-7 border-t border-gray-200/50">
                  <div className="mb-5">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-1">Product Variants</h2>
                    <p className="text-gray-600">Add options like size, color, or material (optional)</p>
                  </div>
                  <VariantEditor variants={variants} onChange={setVariants} />
                </div>

                {/* Track Inventory Section - Moved from Step 3 */}
                {productType !== 'digital' && (
                  <div className="pt-7 border-t border-gray-200/50">
                    <div className="bg-gradient-to-br from-green-50/50 to-white/50 p-5 rounded-2xl border border-green-200/50 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <label className="text-sm font-medium text-gray-900">Track Inventory</label>
                          <p className="text-xs text-gray-500 mt-0.5">Monitor stock levels for this product</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={inventoryTracked}
                            onChange={(e) => setInventoryTracked(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-400 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500 shadow-inner"></div>
                        </label>
                      </div>
                      
                      <AnimatePresence>
                        {inventoryTracked && variants.length === 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <label className="block text-sm font-medium text-gray-700 mb-2 mt-3">
                              Quantity in Stock
                            </label>
                            <input
                              type="number"
                              value={quantity}
                              onChange={(e) => setQuantity(e.target.value)}
                              className="w-full px-4 py-3.5 bg-white/80 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base font-medium"
                              placeholder="0"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* Variant Stock Section - Now appears AFTER Track Inventory as separate section */}
                <AnimatePresence>
                  {inventoryTracked && variants.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="pt-7 border-t border-gray-200/50"
                    >
                      <div className="mb-5">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-1">Variant Stock Levels</h2>
                        <p className="text-gray-600">Set stock quantity for each variant combination</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {getVariantCombinations().map((combination, index) => {
                          const variantKey = Object.values(combination).join(' / ');
                          return (
                            <div key={`${variantKey}-${index}`} className="bg-white/80 p-4 rounded-xl border border-gray-200 shadow-sm">
                              <label className="block text-sm font-medium text-gray-900 mb-2">{variantKey}</label>
                              <input
                                type="number"
                                value={variantStock[variantKey] || ''}
                                onChange={(e) => handleVariantStockChange(variantKey, e.target.value)}
                                placeholder="0"
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Step 3: Pricing */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-7"
              >
                <div className="pb-5">
                  <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-1">Pricing</h2>
                  <p className="text-sm sm:text-base text-gray-600">Set your product pricing</p>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="bg-gradient-to-br from-blue-50/50 to-white/50 p-5 rounded-2xl border border-blue-200/50 shadow-sm">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-3.5 text-gray-600 text-base font-medium">LKR</span>
                        <input
                          type="number"
                          step="0.01"
                          min="100"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          className="w-full pl-16 pr-4 py-3.5 bg-white/80 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base font-medium"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1.5">Minimum: LKR 100.00</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50/50 to-white/50 p-5 rounded-2xl border border-purple-200/50 shadow-sm">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Compare at Price
                        <span className="ml-2 text-xs text-gray-400 font-normal">(Optional)</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-3.5 text-gray-600 text-base font-medium">LKR</span>
                        <input
                          type="number"
                          step="0.01"
                          value={compareAtPrice}
                          onChange={(e) => setCompareAtPrice(e.target.value)}
                          placeholder="Original price"
                          className="w-full pl-16 pr-4 py-3.5 bg-white/80 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base placeholder:text-gray-400"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1.5">Show savings to customers</p>
                    </div>
                  </div>

                  {/* Inventory Summary - Show read-only info if tracking is enabled */}
                  {inventoryTracked && (
                    <div className="bg-gradient-to-br from-green-50/50 to-white/50 p-5 rounded-2xl border border-green-200/50 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-900">Inventory Tracking</label>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {variants.length > 0 
                              ? `Stock configured for ${getVariantCombinations().length} variant${getVariantCombinations().length !== 1 ? 's' : ''}`
                              : `${quantity || 0} items in stock`
                            }
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-green-600">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                          <span className="text-sm font-medium">Active</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3 p-4 bg-white/50 rounded-xl border border-gray-200">
                    <input 
                      type="checkbox" 
                      checked={chargeTax}
                      onChange={(e) => setChargeTax(e.target.checked)}
                      className="w-4 h-4 rounded mt-0.5 text-blue-600 focus:ring-blue-500"
                      id="tax"
                    />
                    <label htmlFor="tax" className="text-sm text-gray-700 cursor-pointer">
                      <span className="font-medium block">Charge tax on this product</span>
                      <span className="text-xs text-gray-500">Tax will be calculated based on customer location</span>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons - macOS style */}
          <div className="flex gap-3 mt-8 pt-6">
            {currentStep > 1 && (
              <motion.button
                type="button"
                onClick={handlePrev}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-gray-700 bg-white/80 border border-gray-300 rounded-full hover:bg-white hover:shadow-md active:scale-95 transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </motion.button>
            )}
            {currentStep < 3 ? (
              <motion.button
                type="button"
                onClick={handleNext}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-full shadow-md hover:shadow-lg active:scale-95 transition-all"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button
                onClick={handleSave}
                disabled={saving}
                whileHover={{ scale: saving ? 1 : 1.01 }}
                whileTap={{ scale: saving ? 1 : 0.97 }}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md hover:shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving Product...
                  </>
                ) : (
                  <>
                    <Package className="w-4 h-4" />
                    Save Product
                  </>
                )}
              </motion.button>
            )}
          </div>
        </motion.div>
        
        {/* Mobile Save Button */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="sm:hidden fixed bottom-0 left-0 right-0 p-4 backdrop-blur-xl bg-white/90 border-t border-gray-200/50 shadow-lg z-50"
        >
          <button 
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm font-medium shadow-md active:scale-95 transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              'Save Product'
            )}
          </button>
        </motion.div>

        {/* Reviews - macOS style */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="backdrop-blur-2xl bg-white/70 rounded-[24px] border border-white/30 shadow-2xl p-6 sm:p-10 mt-6"
        >
          <div className="pb-5 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-1">Customer Reviews</h2>
            <p className="text-gray-600">Manage customer reviews and ratings for this product</p>
          </div>
          <ReviewManagement reviews={[]} onApprove={() => {}} onDelete={() => {}} />
        </motion.div>

        {/* Related Products - macOS style */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="backdrop-blur-2xl bg-white/70 rounded-[24px] border border-white/30 shadow-2xl p-6 sm:p-10 mt-6 mb-24 sm:mb-6"
        >
          <div className="pb-5 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-1">Related Products</h2>
            <p className="text-gray-600">Select products to recommend alongside this item</p>
          </div>
          <RelatedProductSelector selectedProducts={relatedProducts} onChange={setRelatedProducts} />
        </motion.div>
      </div>
      
      {/* Upload Progress Modal - macOS style */}
      <AnimatePresence>
        {uploading && (
          <>
            {/* Backdrop with macOS blur */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-xl flex items-center justify-center z-[100] p-4"
            >
              {/* Modal */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="backdrop-blur-2xl bg-white/90 rounded-[28px] shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-white/20 p-10 max-w-md w-full mx-4"
              >
                <div className="text-center">
                  {/* Animated Icon */}
                  <div className="relative inline-block mb-6">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.05, 1],
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="w-24 h-24 rounded-[24px] bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 flex items-center justify-center shadow-2xl shadow-blue-500/40"
                    >
                      <Upload className="w-12 h-12 text-white" />
                    </motion.div>
                    
                    {/* Pulsing rings */}
                    <motion.div
                      animate={{ 
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 0, 0.5]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeOut"
                      }}
                      className="absolute inset-0 rounded-[24px] border-2 border-blue-500"
                    />
                  </div>
                  
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">Uploading Images</h3>
                  <p className="text-sm text-gray-600 mb-7">Please wait while we process your files...</p>
                  
                  {/* Progress Bar - macOS style */}
                  <div className="relative w-full h-2 bg-gray-200/80 rounded-full overflow-hidden mb-4 shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 rounded-full relative"
                    >
                      {/* Shimmer effect */}
                      <motion.div
                        animate={{ x: [-100, 200] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-20"
                      />
                    </motion.div>
                  </div>
                  
                  {/* Progress Text */}
                  <div className="flex items-center justify-between text-sm px-1">
                    <span className="text-gray-600 font-medium">{uploadProgress}%</span>
                    <span className="text-gray-900 font-semibold">{mediaFiles.length} file{mediaFiles.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddProductPage;
