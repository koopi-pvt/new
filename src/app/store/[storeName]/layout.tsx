'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { StoreContext } from '@/contexts/StoreContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { UniversalLoader } from '@/components/ui/UniversalLoader';

import { StoreData } from '@/types';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const storeName = params.storeName as string;
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (storeName) {
      fetchStoreData();
    }
  }, [storeName]);

  const fetchStoreData = async () => {
    setLoading(true);
    try {
      const storeNamesRef = collection(db, 'storeNames');
      const q = query(storeNamesRef, where('__name__', '==', storeName));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setStoreData(null);
        return;
      }

      const ownerId = snapshot.docs[0].data().ownerId;
      if (ownerId) {
        const storeDocRef = doc(db, 'stores', ownerId);
        const storeDocSnap = await getDoc(storeDocRef);

        if (storeDocSnap.exists()) {
          setStoreData(storeDocSnap.data() as StoreData);
        } else {
          setStoreData(null);
        }
      } else {
        setStoreData(null);
      }
    } catch (error) {
      console.error("Error fetching store data: ", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    // Use theme-aware loading if we have storeData, otherwise use defaults
    const theme = storeData?.website?.theme || { 
      primaryColor: '#000000', 
      backgroundColor: '#ffffff' 
    };
    
    return (
      <UniversalLoader 
        size="lg"
        primaryColor={theme.primaryColor}
        backgroundColor={theme.backgroundColor}
        fullscreen={true}
        message="Loading store..."
      />
    );
  }

  return (
    <ThemeProvider>
      <StoreContext.Provider value={{ storeData, loading }}>
        {children}
      </StoreContext.Provider>
    </ThemeProvider>
  );
}