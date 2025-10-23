'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { useBuyerAuth } from '@/contexts/BuyerAuthContext';
import { StoreHeader } from '@/components/store/StoreHeader';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase';
import { UniversalLoader } from '@/components/ui/UniversalLoader';
import { ButtonLoader } from '@/components/ui/ButtonLoader';

type Theme = {
  primaryColor: string;
  accentColor: string;
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: string;
};

type StoreData = {
  storeName: string;
  website?: {
    logo?: string;
    theme: Theme;
  };
};

export default function BuyerLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useBuyerAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [themeLoading, setThemeLoading] = useState(true);
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [storeNameFromUrl, setStoreNameFromUrl] = useState<string | undefined>(undefined);

  const returnUrl = searchParams.get('returnUrl') || '/';

  useEffect(() => {
    if (returnUrl) {
      const urlParts = returnUrl.split('/');
      if (urlParts.length >= 3 && urlParts[1] === 'store') {
        const name = urlParts[2];
        setStoreNameFromUrl(name);
        fetchStoreTheme(name);
      } else {
        setThemeLoading(false);
      }
    }
  }, [returnUrl]);

  const fetchStoreTheme = async (storeName: string) => {
    setThemeLoading(true);
    try {
      const storeNamesRef = collection(db, 'storeNames');
      const q = query(storeNamesRef, where('__name__', '==', storeName));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setThemeLoading(false);
        return;
      }

      const ownerId = snapshot.docs[0].data().ownerId;
      const storesRef = collection(db, 'stores');
      const storeQuery = query(storesRef, where('__name__', '==', ownerId));
      const storeSnapshot = await getDocs(storeQuery);

      if (!storeSnapshot.empty) {
        const data = storeSnapshot.docs[0].data();
        setStoreData({
          storeName: data.storeName,
          website: data.website
        });
      }
    } catch (error) {
      console.error("Error fetching store theme: ", error);
    } finally {
      setThemeLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email.trim() || !formData.password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      await signIn(formData.email, formData.password);
      router.push(returnUrl);
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else {
        setError('Failed to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const theme = storeData?.website?.theme || {
    primaryColor: '#000000',
    accentColor: '#000000',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    fontFamily: 'inter'
  };
  const storeName = storeData?.storeName;

  const getFontClass = (font: string) => {
    switch (font) {
      case 'serif': return 'font-serif';
      case 'mono': return 'font-mono';
      case 'system': return 'font-sans';
      default: return 'font-sans';
    }
  };

  if (themeLoading) {
    return (
      <UniversalLoader 
        fullscreen={true}
        size="lg"
        primaryColor={theme.primaryColor} 
        backgroundColor={theme.backgroundColor}
        message="Loading..."
      />
    );
  }

  return (
    <div
      className={`min-h-screen ${getFontClass(theme.fontFamily || 'inter')}`}
      style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}
    >
      <StoreHeader storeName={storeNameFromUrl} theme={theme} logo={storeData?.website?.logo} />
      <main className="flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="backdrop-blur-2xl bg-white/70 rounded-[24px] border border-white/30 shadow-2xl p-8 md:p-10"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2" style={{ color: theme.textColor }}>
                  Welcome Back
                </h2>
                <p style={{ color: theme.textColor, opacity: 0.7 }}>
                  Sign in to continue to {storeName || 'the store'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20"
                  >
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-500">{error}</p>
                  </motion.div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.textColor, opacity: 0.9 }}>
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: theme.textColor, opacity: 0.4 }} />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-white/80 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm placeholder:text-gray-400 shadow-sm"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.textColor, opacity: 0.9 }}>
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: theme.textColor, opacity: 0.4 }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-12 pr-12 py-3 bg-white/80 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm placeholder:text-gray-400 shadow-sm"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                      style={{ color: theme.textColor, opacity: 0.4 }}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-3.5 text-base font-semibold rounded-full transition-transform hover:scale-105 active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  style={{
                    backgroundColor: theme.primaryColor,
                    color: theme.backgroundColor
                  }}
                >
                  {loading ? (
                    <>
                      <ButtonLoader color={theme.backgroundColor} size="md" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm" style={{ color: theme.textColor, opacity: 0.7 }}>
                  Don't have an account?{' '}
                  <Link
                    href={`/buyer/register${returnUrl !== '/' ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`}
                    className="font-semibold hover:underline"
                    style={{ color: theme.primaryColor }}
                  >
                    Create one
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}