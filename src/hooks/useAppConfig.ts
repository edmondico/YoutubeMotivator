'use client';

import { useContext } from 'react';
import { ConfigContext } from '@/context/ConfigContext';

export const useAppConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useAppConfig must be used within a ConfigProvider');
  }
  return context;
};