"use client";

import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { Sparkles, CheckCircle, AlertCircle } from 'lucide-react';

export default function InitPromoPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleInitPromo = async () => {
    setIsLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      const promoConfigRef = doc(db, 'promoConfig', 'earlyAccess');
      await setDoc(promoConfigRef, {
        isActive: true,
        totalSpots: 100,
        usedSpots: 0,
        promoName: 'Lifetime Pro Access',
      });
      setStatus('success');
      setMessage('Early access promotion has been successfully initialized!');
    } catch (error) {
      console.error('Error initializing promotion:', error);
      setStatus('error');
      setMessage('Failed to initialize promotion. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto text-center">
        <div className="backdrop-blur-2xl bg-white/70 rounded-[24px] border border-white/30 shadow-2xl p-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Initialize Pro Promotion</h1>
          <p className="text-gray-600 mb-6">
            Click the button below to create the 'earlyAccess' promotion in the database. This will enable the Pro offer popup for the first 100 users.
          </p>
          <button
            onClick={handleInitPromo}
            disabled={isLoading}
            className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all hover:bg-gray-800 disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Initializing...
              </>
            ) : (
              'Initialize Promotion'
            )}
          </button>

          {status !== 'idle' && (
            <div className={`mt-6 p-4 rounded-lg flex items-center gap-3 ${status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {status === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <p className="text-sm font-medium">{message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}