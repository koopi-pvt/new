'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export type BuyerProfile = {
  id: string;
  email: string;
  name: string;
  phone?: string;
  savedAddresses?: SavedAddress[];
  createdAt: string;
};

export type SavedAddress = {
  id: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
};

type BuyerAuthContextType = {
  buyer: FirebaseUser | null;
  buyerProfile: BuyerProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, phone?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateBuyerProfile: (data: Partial<BuyerProfile>) => Promise<void>;
  refreshBuyerProfile: () => Promise<void>;
};

const BuyerAuthContext = createContext<BuyerAuthContextType | undefined>(undefined);

// Using a separate auth instance pattern by managing buyer state separately
export const BuyerAuthProvider = ({ children }: { children: ReactNode }) => {
  const [buyer, setBuyer] = useState<FirebaseUser | null>(null);
  const [buyerProfile, setBuyerProfile] = useState<BuyerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if this user is a buyer by checking the buyers collection
        const buyerDoc = await getDoc(doc(db, 'buyers', user.uid));
        if (buyerDoc.exists()) {
          setBuyer(user);
          setBuyerProfile({ id: user.uid, ...buyerDoc.data() } as BuyerProfile);
        } else {
          setBuyer(null);
          setBuyerProfile(null);
        }
      } else {
        setBuyer(null);
        setBuyerProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string, phone?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create buyer profile in Firestore
      const buyerData: Omit<BuyerProfile, 'id'> = {
        email: user.email || email,
        name,
        phone: phone || '',
        savedAddresses: [],
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'buyers', user.uid), buyerData);
      setBuyerProfile({ id: user.uid, ...buyerData });
    } catch (error: any) {
      console.error('Error signing up:', error);
      throw new Error(error.message || 'Failed to create account');
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Verify this is a buyer account
      const buyerDoc = await getDoc(doc(db, 'buyers', user.uid));
      if (!buyerDoc.exists()) {
        await signOut(auth);
        throw new Error('This account is not a buyer account. Please use the correct login page.');
      }

      setBuyerProfile({ id: user.uid, ...buyerDoc.data() } as BuyerProfile);
    } catch (error: any) {
      console.error('Error signing in:', error);
      throw new Error(error.message || 'Failed to sign in');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setBuyer(null);
      setBuyerProfile(null);
    } catch (error: any) {
      console.error('Error signing out:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  };

  const updateBuyerProfile = async (data: Partial<BuyerProfile>) => {
    if (!buyer) throw new Error('No buyer logged in');

    try {
      await setDoc(doc(db, 'buyers', buyer.uid), data, { merge: true });
      setBuyerProfile((prev) => (prev ? { ...prev, ...data } : null));
    } catch (error: any) {
      console.error('Error updating profile:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  };

  const refreshBuyerProfile = async () => {
    if (!buyer) return;

    try {
      const buyerDoc = await getDoc(doc(db, 'buyers', buyer.uid));
      if (buyerDoc.exists()) {
        setBuyerProfile({ id: buyer.uid, ...buyerDoc.data() } as BuyerProfile);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  return (
    <BuyerAuthContext.Provider
      value={{
        buyer,
        buyerProfile,
        loading,
        signUp,
        signIn,
        logout,
        updateBuyerProfile,
        refreshBuyerProfile,
      }}
    >
      {children}
    </BuyerAuthContext.Provider>
  );
};

export const useBuyerAuth = () => {
  const context = useContext(BuyerAuthContext);
  if (context === undefined) {
    throw new Error('useBuyerAuth must be used within a BuyerAuthProvider');
  }
  return context;
};
