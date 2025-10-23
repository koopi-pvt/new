'use client';

import { useState, useEffect } from 'react';
import { useBuyerAuth } from '@/contexts/BuyerAuthContext';
import { useRouter } from 'next/navigation';
import { PageLoader } from '@/components/ui/PageLoader';
import { Bell, User, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import Link from 'next/link';

export default function BuyerSettingsPage() {
  const { buyer, buyerProfile, loading: authLoading } = useBuyerAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    emailOnNewMessage: true,
    emailOnOrderStatusChange: true,
    inAppNotifications: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    document.title = 'Settings - Koopi';
  }, []);

  useEffect(() => {
    if (!authLoading && !buyer) {
      router.push('/buyer/login');
    }
  }, [buyer, authLoading, router]);

  useEffect(() => {
    if (buyer) {
      loadSettings();
    }
  }, [buyer]);

  const loadSettings = async () => {
    if (!buyer) return;
    
    try {
      const buyerRef = doc(db, 'buyers', buyer.uid);
      const buyerDoc = await getDoc(buyerRef);
      
      if (buyerDoc.exists()) {
        const data = buyerDoc.data();
        if (data.notificationSettings) {
          setSettings(data.notificationSettings);
        }
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  const handleSave = async () => {
    if (!buyer) return;

    setIsSaving(true);
    setMessage('');

    try {
      const buyerRef = doc(db, 'buyers', buyer.uid);
      await updateDoc(buyerRef, {
        notificationSettings: settings,
      });
      setMessage('Notification settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving notification settings:', error);
      setMessage('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || !buyer) {
    return <PageLoader message="Loading settings..." primaryColor="#000000" backgroundColor="#f9fafb" />;
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f7] relative overflow-hidden p-4 sm:p-6 lg:p-8">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link 
            href="/buyer/orders" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium text-sm">Back to Orders</span>
          </Link>
          <div className="backdrop-blur-xl bg-white/60 rounded-[20px] p-4 sm:p-5 border border-white/20 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-black/5">
                <Bell className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">Settings</h1>
                <p className="text-sm text-gray-600 mt-0.5">Manage your preferences</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <div className="backdrop-blur-2xl bg-white/70 rounded-[24px] border border-white/30 shadow-2xl p-4">
              <nav className="space-y-1">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'text-gray-700 hover:bg-blue-500/10 hover:text-blue-600'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="backdrop-blur-2xl bg-white/70 rounded-[24px] border border-white/30 shadow-2xl p-8">
              {activeTab === 'profile' && <ProfileSettings buyer={buyerProfile} />}
              {activeTab === 'notifications' && (
                <NotificationsSettings
                  settings={settings}
                  isLoading={isLoading}
                  isSaving={isSaving}
                  message={message}
                  onToggle={handleToggle}
                  onSave={handleSave}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ProfileSettings = ({ buyer }: any) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input 
            type="text" 
            className="w-full px-4 py-3 bg-white/80 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" 
            value={buyer?.name || ''} 
            readOnly 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <input 
            type="email" 
            className="w-full px-4 py-3 bg-white/80 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" 
            value={buyer?.email || ''} 
            readOnly 
          />
        </div>
        <p className="text-sm text-gray-600">
          Profile editing is coming soon. Contact support if you need to update your information.
        </p>
      </div>
    </div>
  );
};

const NotificationsSettings = ({ settings, isLoading, isSaving, message, onToggle, onSave }: any) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Notification Preferences</h2>
      <p className="text-sm text-gray-600 mb-6">
        Manage how you receive notifications about your orders
      </p>

      <div className="space-y-6">
        {/* Email on New Message */}
        <div className="flex items-start justify-between pb-4 border-b border-gray-200">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Email on New Message</h3>
            <p className="text-sm text-gray-600">
              Get an email when a seller replies to your message
            </p>
          </div>
          <button
            onClick={() => onToggle('emailOnNewMessage')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.emailOnNewMessage ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.emailOnNewMessage ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Email on Order Status Change */}
        <div className="flex items-start justify-between pb-4 border-b border-gray-200">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Email on Order Status Change</h3>
            <p className="text-sm text-gray-600">
              Get an email when your order status is updated
            </p>
          </div>
          <button
            onClick={() => onToggle('emailOnOrderStatusChange')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.emailOnOrderStatusChange ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.emailOnOrderStatusChange ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {message && (
        <div className={`mt-6 p-4 rounded-lg ${
          message.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          <p className="text-sm font-medium">{message}</p>
        </div>
      )}

      <button
        onClick={onSave}
        disabled={isSaving}
        className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? 'Saving...' : 'Save Preferences'}
      </button>
    </div>
  );
};
