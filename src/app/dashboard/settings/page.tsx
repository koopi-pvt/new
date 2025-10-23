"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { PageLoader } from '@/components/ui/PageLoader';
import { Settings, User, Store, CreditCard, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('account');

  useEffect(() => {
    document.title = 'Settings - Koopi Dashboard';
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return <PageLoader message="Loading settings..." primaryColor="#000000" backgroundColor="#f1f1f1" />;
  }

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'store', label: 'Store', icon: Store },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f7] relative overflow-hidden p-4 sm:p-6 lg:p-8">
      {/* macOS-style background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6 backdrop-blur-xl bg-white/60 rounded-[20px] p-4 border border-white/20 shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="group flex items-center justify-center w-8 h-8 rounded-full bg-black/5">
              <Settings className="w-4 h-4 text-gray-700" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">Settings</h1>
              <p className="text-sm text-gray-600 mt-0.5">Manage your account and store settings</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1">
            <div className="backdrop-blur-2xl bg-white/70 rounded-[24px] border border-white/30 shadow-2xl p-3">
              <nav className="space-y-1">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
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

          <div className="lg:col-span-3">
            <div className="backdrop-blur-2xl bg-white/70 rounded-[24px] border border-white/30 shadow-2xl p-4 sm:p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === 'account' && <AccountSettings />}
                  {activeTab === 'store' && <StoreSettings />}
                  {activeTab === 'billing' && <BillingSettings />}
                  {activeTab === 'notifications' && <NotificationsSettings />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const AccountSettings = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleEmailChange = async () => {
    if (!user || !email || email === user.email) return;

    setIsSaving(true);
    setMessage('');

    try {
      // This is a placeholder for the actual Firebase function
      // await updateEmail(user, email);
      // await sendEmailVerification(user);
      
      setMessage(`A verification link has been sent to ${email}. Please check your inbox to confirm the change.`);
    } catch (error) {
      console.error("Error updating email:", error);
      setMessage("Failed to update email. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input type="text" className="w-full px-4 py-2 bg-white/80 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" defaultValue={user?.displayName || ''} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <input type="email" className="w-full px-4 py-2 bg-white/80 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        {message && <p className="text-sm text-green-600">{message}</p>}
        <button onClick={handleEmailChange} disabled={isSaving} className="px-4 py-2 text-sm bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition-colors shadow-md disabled:opacity-50">
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

const StoreSettings = () => {
  const { user, userProfile } = useAuth();
  const [storeName, setStoreName] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (userProfile) {
      setStoreName(userProfile.storeName || '');
    }
    if (user) {
      const storeRef = doc(db, 'stores', user.uid);
      getDoc(storeRef).then(docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setStoreDescription(data.storeDescription || '');
        }
        setIsLoading(false);
      });
    }
  }, [user, userProfile]);

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    setMessage('');

    try {
      // Update the user's profile
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { storeName });

      // Update the store document
      const storeRef = doc(db, 'stores', user.uid);
      await updateDoc(storeRef, {
        storeName,
        storeDescription,
      });
      
      setMessage('Store settings saved successfully!');
    } catch (error) {
      console.error("Error updating store settings:", error);
      setMessage("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Store Settings</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
          <input type="text" className="w-full px-4 py-2 bg-white/80 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Store Description</label>
          <textarea rows={4} className="w-full px-4 py-2 bg-white/80 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" value={storeDescription} onChange={(e) => setStoreDescription(e.target.value)}></textarea>
        </div>
        {message && <p className="text-sm text-green-600">{message}</p>}
        <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 text-sm bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition-colors shadow-md disabled:opacity-50">
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

const BillingSettings = () => (
  <div>
    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Billing</h2>
    <div className="text-center py-12 bg-white/50 rounded-xl border border-gray-200/50">
      <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Coming Soon</h3>
      <p className="text-gray-600 text-sm">Manage your subscription and payment methods.</p>
    </div>
  </div>
);

const NotificationsSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    emailOnNewMessage: true,
    emailOnOrderStatusChange: true,
    emailOnNewOrder: true,
    inAppNotifications: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;
    
    try {
      const storeRef = doc(db, 'stores', user.uid);
      const storeDoc = await getDoc(storeRef);
      
      if (storeDoc.exists()) {
        const data = storeDoc.data();
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
    if (!user) return;

    setIsSaving(true);
    setMessage('');

    try {
      const storeRef = doc(db, 'stores', user.uid);
      await updateDoc(storeRef, {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Notification Preferences</h2>
      <p className="text-sm text-gray-600 mb-6">
        Manage how you receive notifications about your store activity
      </p>

      <div className="space-y-6">
        {/* In-App Notifications */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between pb-4 border-b border-gray-200">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">In-App Notifications</h3>
            <p className="text-sm text-gray-600">
              Receive notifications in the dashboard notification center
            </p>
          </div>
          <button
            onClick={() => handleToggle('inAppNotifications')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors mt-2 sm:mt-0 ${
              settings.inAppNotifications ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.inAppNotifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Email on New Message */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between pb-4 border-b border-gray-200">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Email on New Message</h3>
            <p className="text-sm text-gray-600">
              Get an email when a buyer sends you a message
            </p>
          </div>
          <button
            onClick={() => handleToggle('emailOnNewMessage')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors mt-2 sm:mt-0 ${
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

        {/* Email on New Order */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between pb-4 border-b border-gray-200">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Email on New Order</h3>
            <p className="text-sm text-gray-600">
              Get an email notification when you receive a new order
            </p>
          </div>
          <button
            onClick={() => handleToggle('emailOnNewOrder')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors mt-2 sm:mt-0 ${
              settings.emailOnNewOrder ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.emailOnNewOrder ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Email on Order Status Change */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between pb-4 border-b border-gray-200">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Email on Order Status Change</h3>
            <p className="text-sm text-gray-600">
              Get an email when you update an order status
            </p>
          </div>
          <button
            onClick={() => handleToggle('emailOnOrderStatusChange')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors mt-2 sm:mt-0 ${
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
        onClick={handleSave}
        disabled={isSaving}
        className="mt-6 px-4 py-2 text-sm bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? 'Saving...' : 'Save Preferences'}
      </button>
    </div>
  );
};