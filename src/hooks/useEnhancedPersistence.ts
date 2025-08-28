'use client';

import { useEffect, useCallback } from 'react';

interface PersistenceConfig {
  key: string;
  version: number;
  compress?: boolean;
  ttl?: number; // Time to live in milliseconds
}

export const useEnhancedPersistence = <T>(
  data: T,
  config: PersistenceConfig
) => {
  const { key, version, compress = false, ttl } = config;

  // Save data with metadata
  const saveData = useCallback((dataToSave: T) => {
    try {
      const metadata = {
        data: dataToSave,
        version,
        timestamp: Date.now(),
        ttl: ttl ? Date.now() + ttl : null,
      };

      let serialized = JSON.stringify(metadata);
      
      if (compress && typeof window !== 'undefined') {
        // Simple compression using built-in methods
        serialized = btoa(serialized);
      }

      localStorage.setItem(key, serialized);
      
      // Also create a backup
      localStorage.setItem(`${key}_backup`, serialized);
      
      // Clean old versions
      cleanOldVersions();
      
    } catch (error) {
      console.error(`Error saving to localStorage (${key}):`, error);
    }
  }, [key, version, ttl, compress]);

  // Load data with validation
  const loadData = useCallback((): T | null => {
    try {
      let stored = localStorage.getItem(key);
      
      if (!stored) {
        // Try backup
        stored = localStorage.getItem(`${key}_backup`);
      }
      
      if (!stored) return null;

      if (compress && typeof window !== 'undefined') {
        try {
          stored = atob(stored);
        } catch (error) {
          console.error('Error decompressing data:', error);
          return null;
        }
      }

      const metadata = JSON.parse(stored);
      
      // Check version compatibility
      if (metadata.version !== version) {
        console.warn(`Version mismatch for ${key}: stored=${metadata.version}, expected=${version}`);
        // Could implement migration logic here
        return null;
      }

      // Check TTL
      if (metadata.ttl && Date.now() > metadata.ttl) {
        console.log(`Data expired for ${key}`);
        localStorage.removeItem(key);
        localStorage.removeItem(`${key}_backup`);
        return null;
      }

      return metadata.data;
    } catch (error) {
      console.error(`Error loading from localStorage (${key}):`, error);
      return null;
    }
  }, [key, version, compress]);

  // Clean old versions
  const cleanOldVersions = useCallback(() => {
    try {
      Object.keys(localStorage).forEach(storageKey => {
        if (storageKey.startsWith(key) && storageKey !== key && storageKey !== `${key}_backup`) {
          localStorage.removeItem(storageKey);
        }
      });
    } catch (error) {
      console.error('Error cleaning old versions:', error);
    }
  }, [key]);

  // Export data for backup
  const exportData = useCallback(() => {
    const exportObj = {
      key,
      version,
      data,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
    };
    
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${key}-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }, [key, version, data]);

  // Import data from backup
  const importData = useCallback((file: File): Promise<T> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const importedData = JSON.parse(event.target?.result as string);
          
          if (importedData.key !== key) {
            throw new Error('Key mismatch in backup file');
          }
          
          if (importedData.version !== version) {
            console.warn(`Version mismatch: backup=${importedData.version}, current=${version}`);
          }
          
          resolve(importedData.data);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsText(file);
    });
  }, [key, version]);

  // Get storage info
  const getStorageInfo = useCallback(() => {
    try {
      const stored = localStorage.getItem(key);
      const backup = localStorage.getItem(`${key}_backup`);
      
      return {
        hasData: !!stored,
        hasBackup: !!backup,
        size: stored ? new Blob([stored]).size : 0,
        backupSize: backup ? new Blob([backup]).size : 0,
        lastModified: stored ? JSON.parse(stored).timestamp : null,
      };
    } catch (error) {
      return {
        hasData: false,
        hasBackup: false,
        size: 0,
        backupSize: 0,
        lastModified: null,
      };
    }
  }, [key]);

  // Clear all data
  const clearData = useCallback(() => {
    localStorage.removeItem(key);
    localStorage.removeItem(`${key}_backup`);
    cleanOldVersions();
  }, [key, cleanOldVersions]);

  // Auto-save when data changes
  useEffect(() => {
    if (data !== null && data !== undefined) {
      saveData(data);
    }
  }, [data, saveData]);

  // Periodic cleanup
  useEffect(() => {
    const cleanup = setInterval(() => {
      cleanOldVersions();
    }, 24 * 60 * 60 * 1000); // Daily cleanup

    return () => clearInterval(cleanup);
  }, [cleanOldVersions]);

  return {
    loadData,
    saveData,
    exportData,
    importData,
    clearData,
    getStorageInfo,
  };
};