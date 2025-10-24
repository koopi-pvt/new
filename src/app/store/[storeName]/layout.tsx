'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { StoreContext } from '@/contexts/StoreContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { StoreSkeletonLoader } from '@/components/ui/StoreSkeletonLoader';

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

      const ownerId = snapshot.docs[0].data().userId;
      if (ownerId) {
        const storeDocRef = doc(db, 'stores', ownerId);
        const storeDocSnap = await getDoc(storeDocRef);

        if (storeDocSnap.exists()) {
          // Combine store document data with store name from storeNames collection
          const storeNameData = snapshot.docs[0].data();
          setStoreData({
            ...storeDocSnap.data(),
            storeName: storeNameData.storeName
          } as StoreData);
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
    // Use skeleton loader for better UX
    const theme = storeData?.website?.theme || { 
      primaryColor: '#000000', 
      backgroundColor: '#ffffff' 
    };
    
    return (
      <ThemeProvider>
        <StoreSkeletonLoader 
          primaryColor={theme.primaryColor}
          backgroundColor={theme.backgroundColor}
        />
      </ThemeProvider>
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