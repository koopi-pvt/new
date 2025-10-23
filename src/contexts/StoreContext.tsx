'use client';

import React, { createContext, useContext } from 'react';

import { StoreData } from '@/types';

type StoreContextType = {
  storeData: StoreData | null;
  loading: boolean;
};

export const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};