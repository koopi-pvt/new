"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { uploadFile } from '@/lib/supabase';
import { Globe, Save, Eye, EyeOff, Palette, Type, Image as ImageIcon, ExternalLink, Upload, Trash2, Layout, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { motion } from 'framer-motion';
import { DraggableSection } from '@/components/dashboard/DraggableSection';
import { useToast } from '@/hooks/useToast';
import { TemplatePreview } from '@/components/dashboard/TemplatePreview';
import { templates } from '@/lib/templates';
import { InstallingAnimation } from '@/components/dashboard/InstallingAnimation';
import { PageLoader } from '@/components/ui/PageLoader';

export default function WebsitePage() {
  const { user, userProfile } = useAuth();
  const { ToastComponent, success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [hasProducts, setHasProducts] = useState(false);
  const [sectionOrder, setSectionOrder] = useState(['hero', 'about']);
  const [templateId, setTemplateId] = useState('classic');
  const [installingTemplate, setInstallingTemplate] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [initialState, setInitialState] = useState<any>(null);
  
  const [websiteEnabled, setWebsiteEnabled] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  
  // Hero section
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroCtaText, setHeroCtaText] = useState('Shop Now');
  const [heroBackgroundImage, setHeroBackgroundImage] = useState('');
  const [heroAlignment, setHeroAlignment] = useState<'left' | 'center'>('left');
  
  // Theme
  const [primaryColor, setPrimaryColor] = useState('#000000');
  const [accentColor, setAccentColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#000000');
  
  // Sections visibility
  const [showAbout, setShowAbout] = useState(true);
  const [aboutTitle, setAboutTitle] = useState('');
  const [aboutContent, setAboutContent] = useState('');
  
  // Footer
  const [footerText, setFooterText] = useState('');
  const [showPoweredBy, setShowPoweredBy] = useState(true);
  
  // Font
  const [fontFamily, setFontFamily] = useState('inter');

  useEffect(() => {
    if (userProfile) {
      fetchWebsiteSettings();
    }
  }, [userProfile]);

  const fetchWebsiteSettings = async () => {
    if (!user || !userProfile) return;

    try {
      // Set store name and logo from the user's profile (source of truth)
      setStoreName(userProfile.storeName || '');

      const storeDoc = await getDoc(doc(db, 'stores', user.uid));
      
      if (storeDoc.exists()) {
        const storeData = storeDoc.data();
        setHasProducts(storeData.hasProducts || false);
        
        const website = storeData.website || {};
        setWebsiteEnabled(website.enabled || false);
        
        // Hero - Use userProfile.storeName for defaults
        setHeroTitle(website.hero?.title || `Welcome to ${userProfile.storeName}`);
        setHeroSubtitle(website.hero?.subtitle || storeData.storeDescription || 'Discover amazing products');
        setHeroCtaText(website.hero?.ctaText || 'Shop Now');
        setHeroBackgroundImage(website.hero?.backgroundImage || '');
        setHeroAlignment(website.hero?.alignment || 'left');
        
        // Theme
        setPrimaryColor(website.theme?.primaryColor || '#000000');
        setAccentColor(website.theme?.accentColor || '#000000');
        setBackgroundColor(website.theme?.backgroundColor || '#ffffff');
        setTextColor(website.theme?.textColor || '#000000');
        setFontFamily(website.theme?.fontFamily || 'inter');
        
        // About - Use userProfile.storeName for defaults
        setShowAbout(website.about?.show !== false);
        setAboutTitle(website.about?.title || `About ${userProfile.storeName}`);
        setAboutContent(website.about?.content || storeData.storeDescription || '');
        
        // Footer
        setFooterText(website.footer?.text || '');
        setShowPoweredBy(website.footer?.showPoweredBy !== false);
        
        // Load section order
        if (website.sectionOrder && Array.isArray(website.sectionOrder)) {
          setSectionOrder(website.sectionOrder);
        } else {
          setSectionOrder(['hero', 'about']);
        }
        
        setTemplateId(website.templateId || 'classic');

       // Set initial state for dirty checking
       const websiteData = storeData.website || {};
       const fetchedState = {
         websiteEnabled: websiteData.enabled || false,
         logoUrl: userProfile.storeLogoUrl || '',
         heroTitle: websiteData.hero?.title || `Welcome to ${userProfile.storeName}`,
         heroSubtitle: websiteData.hero?.subtitle || storeData.storeDescription || 'Discover amazing products',
         heroCtaText: websiteData.hero?.ctaText || 'Shop Now',
         heroBackgroundImage: websiteData.hero?.backgroundImage || '',
         heroAlignment: websiteData.hero?.alignment || 'left',
         primaryColor: websiteData.theme?.primaryColor || '#000000',
         accentColor: websiteData.theme?.accentColor || '#000000',
         backgroundColor: websiteData.theme?.backgroundColor || '#ffffff',
         textColor: websiteData.theme?.textColor || '#000000',
         fontFamily: websiteData.theme?.fontFamily || 'inter',
         showAbout: websiteData.about?.show !== false,
         aboutTitle: websiteData.about?.title || `About ${userProfile.storeName}`,
         aboutContent: websiteData.about?.content || storeData.storeDescription || '',
         footerText: websiteData.footer?.text || '',
         showPoweredBy: websiteData.footer?.showPoweredBy !== false,
         sectionOrder: websiteData.sectionOrder && Array.isArray(websiteData.sectionOrder) ? websiteData.sectionOrder : ['hero', 'about'],
         templateId: websiteData.templateId || 'classic',
       };
       setInitialState(fetchedState);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching website settings:', err);
      error('Failed to load website settings');
      setLoading(false);
    }
  };

  // Check for unsaved changes
  useEffect(() => {
    if (!initialState) return;

    const currentState = {
      websiteEnabled,
      logoUrl: userProfile?.storeLogoUrl || '',
      heroTitle,
      heroSubtitle,
      heroCtaText,
      heroBackgroundImage,
      heroAlignment,
      primaryColor,
      accentColor,
      backgroundColor,
      textColor,
      fontFamily,
      showAbout,
      aboutTitle,
      aboutContent,
      footerText,
      showPoweredBy,
      sectionOrder,
      templateId,
    };

    if (JSON.stringify(initialState) !== JSON.stringify(currentState)) {
      setIsDirty(true);
    } else {
      setIsDirty(false);
    }
  }, [
    websiteEnabled, userProfile?.storeLogoUrl, heroTitle, heroSubtitle, heroCtaText, heroBackgroundImage,
    heroAlignment, primaryColor, accentColor, backgroundColor, textColor, fontFamily,
    showAbout, aboutTitle, aboutContent, footerText, showPoweredBy, sectionOrder,
    templateId, initialState
  ]);

  // Prompt user before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = ''; // For Chrome
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingLogo(true);
    try {
      const url = await uploadFile('logos', `stores/${user.uid}/logo/${file.name}`, file);

      // Also update the user's profile
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { storeLogoUrl: url });

      setLogoFile(file);
      success('Logo uploaded successfully!');
    } catch (err) {
      console.error('Error uploading logo:', err);
      error('Failed to upload logo. Please try again.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { storeLogoUrl: '' });
      } catch (err) {
        console.error('Error removing logo:', err);
        error('Failed to remove logo.');
      }
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const storeRef = doc(db, 'stores', user.uid);
      
      await updateDoc(storeRef, {
        website: {
          enabled: websiteEnabled,
          logo: userProfile?.storeLogoUrl || '',
          hero: {
            title: heroTitle,
            subtitle: heroSubtitle,
            ctaText: heroCtaText,
            backgroundImage: heroBackgroundImage,
            alignment: heroAlignment
          },
          theme: {
            primaryColor: primaryColor,
            accentColor: accentColor,
            backgroundColor: backgroundColor,
            textColor: textColor,
            fontFamily: fontFamily
          },
          about: {
            show: showAbout,
            title: aboutTitle,
            content: aboutContent
          },
          footer: {
            text: footerText,
            showPoweredBy: showPoweredBy
          },
          sectionOrder: sectionOrder,
          templateId: templateId
        },
        hasCustomizedStore: true
      });

      // Update user onboarding progress
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        'onboarding.customizedStore': true,
      });

      const currentState = {
        websiteEnabled,
        logoUrl: userProfile?.storeLogoUrl || '',
        heroTitle,
        heroSubtitle,
        heroCtaText,
        heroBackgroundImage,
        heroAlignment,
        primaryColor,
        accentColor,
        backgroundColor,
        textColor,
        fontFamily,
        showAbout,
        aboutTitle,
        aboutContent,
        footerText,
        showPoweredBy,
        sectionOrder,
        templateId,
      };
      setInitialState(currentState);
      success('Website settings saved successfully!');
    } catch (err) {
      console.error('Error saving website settings:', err);
      error('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...sectionOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newOrder.length) {
      return;
    }

    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    setSectionOrder(newOrder);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setSectionOrder((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  if (loading) {
    return (
      <PageLoader message="Loading website settings..." primaryColor="#000000" backgroundColor="#f1f1f1" />
    );
  }

  const storeUrl = userProfile?.storeName ? `/store/${userProfile.storeName}` : '#';

  const renderSection = (sectionKey: string) => {
    switch (sectionKey) {
      case 'hero':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Type className="w-5 h-5 text-gray-700" />
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Hero Section</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hero Title
                </label>
                <input
                  type="text"
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  placeholder="Welcome to your store"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hero Subtitle
                </label>
                <textarea
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  placeholder="Discover amazing products"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Call to Action Text
                </label>
                <input
                  type="text"
                  value={heroCtaText}
                  onChange={(e) => setHeroCtaText(e.target.value)}
                  placeholder="Shop Now"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Image URL (Optional)
                </label>
                <input
                  type="text"
                  value={heroBackgroundImage}
                  onChange={(e) => setHeroBackgroundImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Alignment
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setHeroAlignment('left')}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      heroAlignment === 'left'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Left
                  </button>
                  <button
                    onClick={() => setHeroAlignment('center')}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      heroAlignment === 'center'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Center
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'about':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layout className="w-5 h-5 text-gray-700" />
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">About Section</h2>
              </div>
              <button
                onClick={() => setShowAbout(!showAbout)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  showAbout
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {showAbout ? 'Visible' : 'Hidden'}
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section Title
                </label>
                <input
                  type="text"
                  value={aboutTitle}
                  onChange={(e) => setAboutTitle(e.target.value)}
                  placeholder="About Us"
                  disabled={!showAbout}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  value={aboutContent}
                  onChange={(e) => setAboutContent(e.target.value)}
                  placeholder="Tell your customers about your store..."
                  rows={4}
                  disabled={!showAbout}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm resize-none disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] relative overflow-hidden">
      {ToastComponent}
      {/* macOS-style background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      
      <div className="relative z-10 max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header - macOS style */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 backdrop-blur-xl bg-white/60 rounded-[20px] p-4 sm:p-5 border border-white/20 shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="group flex items-center justify-center w-9 h-9 rounded-full bg-black/5">
              <Globe className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-semibold text-gray-900 tracking-tight">Website Customization</h1>
              <p className="text-sm text-gray-600 mt-0.5 flex items-center gap-2">
                Design and manage your online storefront
                {isDirty && <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {websiteEnabled && storeName && (
              <Link
                href={storeUrl}
                target="_blank"
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white/80 rounded-full hover:bg-white hover:shadow-md active:scale-95 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                View Site
              </Link>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </motion.div>

        {/* Enable Website Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="backdrop-blur-2xl bg-white/70 rounded-[24px] border border-white/30 shadow-2xl p-6 sm:p-8 mb-6"
        >
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Store Website Status</h2>
              <p className="text-sm text-gray-600 mb-4">
                {hasProducts
                  ? 'Make your store accessible to customers with a custom website'
                  : 'Add at least one product before enabling your website'}
              </p>
              {websiteEnabled && storeName && (
                <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
                  <span>Your URL:</span>
                  <Link href={storeUrl} target="_blank" className="font-medium text-gray-900 hover:underline break-all">
                    {typeof window !== 'undefined' ? window.location.origin : ''}{storeUrl}
                  </Link>
                </div>
              )}
            </div>
            <button
              onClick={() => setWebsiteEnabled(!websiteEnabled)}
              disabled={!hasProducts}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all ${
                websiteEnabled
                  ? 'bg-green-500 text-white hover:bg-green-600 shadow-md'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {websiteEnabled ? (
                <>
                  <Eye className="w-4 h-4" />
                  Enabled
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4" />
                  Disabled
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Preview Section */}
        <div className="backdrop-blur-2xl bg-white/70 rounded-[24px] border border-white/30 shadow-2xl p-6 sm:p-8 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Live Preview</h2>
          <div className="border border-gray-200/50 rounded-xl overflow-hidden shadow-inner">
            <div
              className="p-6 sm:p-12"
              style={{
                backgroundColor: heroBackgroundImage ? 'transparent' : backgroundColor,
                backgroundImage: heroBackgroundImage ? `url(${heroBackgroundImage})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className={heroBackgroundImage ? 'bg-white/90 backdrop-blur-sm rounded-xl p-4 sm:p-8' : ''}>
                <h1 className="text-2xl sm:text-4xl font-bold mb-3" style={{ color: textColor }}>{heroTitle || 'Hero Title'}</h1>
                <p className="text-base sm:text-lg mb-6" style={{ color: textColor, opacity: 0.8 }}>{heroSubtitle || 'Hero subtitle goes here'}</p>
                <button
                  className="px-6 py-3 rounded-lg font-medium text-white shadow-md"
                  style={{ backgroundColor: primaryColor }}
                >
                  {heroCtaText || 'Shop Now'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Logo & Branding */}
            <div className="backdrop-blur-2xl bg-white/70 rounded-[24px] border border-white/30 shadow-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <ImageIcon className="w-6 h-6 text-gray-700" />
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Logo & Branding</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Store Logo</label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {userProfile?.storeLogoUrl ? (
                      <div className="relative group">
                        <img src={userProfile.storeLogoUrl} alt="Logo" className="h-16 object-contain bg-white/80 border border-gray-200 rounded-xl p-2 shadow-sm" />
                        <button onClick={handleRemoveLogo} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all transform scale-0 group-hover:scale-100">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="h-16 w-32 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-500 bg-white/50">No logo</div>
                    )}
                    <label className="cursor-pointer">
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" disabled={uploadingLogo} />
                      <div className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors flex items-center gap-2 shadow-md active:scale-95">
                        <Upload className="w-4 h-4" />
                        {uploadingLogo ? 'Uploading...' : 'Upload'}
                      </div>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Recommended: 200x60px, PNG or SVG</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
                  <div className="relative">
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                      className="w-full px-4 py-3 bg-white/80 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm appearance-none shadow-sm"
                    >
                      <option value="inter">Inter (Modern)</option>
                      <option value="system">System Default</option>
                      <option value="serif">Serif (Classic)</option>
                      <option value="mono">Monospace</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Sections */}
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
                {sectionOrder.map((sectionKey) => (
                  <DraggableSection key={sectionKey} id={sectionKey}>
                    {renderSection(sectionKey)}
                  </DraggableSection>
                ))}
              </SortableContext>
            </DndContext>
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            {/* Template Selection */}
            <div className="backdrop-blur-2xl bg-white/70 rounded-[24px] border border-white/30 shadow-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <Layout className="w-6 h-6 text-gray-700" />
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Templates</h2>
              </div>
              <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4">
                {installingTemplate && <InstallingAnimation />}
                {Object.keys(templates).map((id) => (
                  <TemplatePreview
                   key={id}
                   templateId={id as keyof typeof templates}
                   isSelected={templateId === id}
                   isLocked={false}
                   onClick={() => {
                     setInstallingTemplate(true);
                     setTimeout(() => {
                       setTemplateId(id);
                       const template = templates[id as keyof typeof templates];
                       setPrimaryColor(template.theme.primaryColor);
                       setAccentColor(template.theme.accentColor);
                       setBackgroundColor(template.theme.backgroundColor);
                       setTextColor(template.theme.textColor);
                       setFontFamily(template.theme.fontFamily);
                       setHeroTitle(template.hero.title);
                       setHeroSubtitle(template.hero.subtitle);
                       setHeroCtaText(template.hero.ctaText);
                       setHeroBackgroundImage(template.hero.backgroundImage);
                       setHeroAlignment(template.hero.alignment as 'left' | 'center');
                       setInstallingTemplate(false);
                     }, 1000);
                   }}
                 />
                ))}
              </div>
            </div>

            {/* Theme Settings */}
            <div className="backdrop-blur-2xl bg-white/70 rounded-[24px] border border-white/30 shadow-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <Palette className="w-6 h-6 text-gray-700" />
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Theme Colors</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-12 h-10 p-1 border border-gray-300 rounded-lg cursor-pointer bg-white/80" />
                    <input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="flex-1 px-3 py-2 bg-white/80 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs shadow-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-12 h-10 p-1 border border-gray-300 rounded-lg cursor-pointer bg-white/80" />
                    <input type="text" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="flex-1 px-3 py-2 bg-white/80 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs shadow-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="w-12 h-10 p-1 border border-gray-300 rounded-lg cursor-pointer bg-white/80" />
                    <input type="text" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="flex-1 px-3 py-2 bg-white/80 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs shadow-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-12 h-10 p-1 border border-gray-300 rounded-lg cursor-pointer bg-white/80" />
                    <input type="text" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="flex-1 px-3 py-2 bg-white/80 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs shadow-sm" />
                  </div>
                </div>
                <div className="mt-4 p-3 border border-gray-200/50 rounded-lg shadow-inner" style={{ backgroundColor: backgroundColor }}>
                  <p className="text-xs font-medium mb-2" style={{ color: textColor }}>Preview</p>
                  <div className="space-y-2">
                    <button className="w-full px-3 py-2 rounded-lg text-xs font-medium text-white shadow-sm" style={{ backgroundColor: primaryColor }}>Primary Button</button>
                    <button className="w-full px-3 py-2 rounded-lg text-xs font-medium text-white shadow-sm" style={{ backgroundColor: accentColor }}>Accent Button</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Settings */}
            <div className="backdrop-blur-2xl bg-white/70 rounded-[24px] border border-white/30 shadow-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <Layout className="w-6 h-6 text-gray-700" />
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Footer</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Custom Footer Text</label>
                  <input type="text" value={footerText} onChange={(e) => setFooterText(e.target.value)} placeholder="© 2025 Your Store" className="w-full px-4 py-3 bg-white/80 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm shadow-sm" />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Show "Powered by Koopi"</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showPoweredBy}
                      onChange={(e) => setShowPoweredBy(e.target.checked)}
                      disabled={userProfile?.subscription?.plan === 'free'}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-400 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500 shadow-inner peer-disabled:cursor-not-allowed"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}