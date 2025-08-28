'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';
import { AppConfig, UserGoals } from '@/types';

// Define the shape of the context data
interface ConfigContextType {
  config: AppConfig;
  loading: boolean;
  updateConfig: (updates: Partial<AppConfig>) => void;
  updateGoals: (updates: Partial<UserGoals>) => void;
  resetConfig: () => void;
}

// Default values for config
const DEFAULT_GOALS: UserGoals = {
  id: 'default-goals',
  weeklyViewsTarget: 1000,
  weeklySubscribersTarget: 2000,
  subscribersTargetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  videosPerWeek: 2,
  dailyTasksTarget: 3,
  streakTarget: 30,
};

const DEFAULT_CONFIG: AppConfig = {
  channelName: 'PokeBim',
  channelId: 'UCi22Ce1p-tDw6e7_WfsjPFg',
  apiKey: 'AIzaSyAB5zx_P4RHKSjJd-i_vMdM7I1wZwQH4Ic',
  goals: DEFAULT_GOALS,
  notifications: {
    enabled: true,
    reminderTimes: ['09:00', '18:00'],
    taskReminders: true,
    youtubeReminders: true,
  },
  theme: {
    primaryColor: '#3b82f6',
    darkMode: false,
  },
};

// Create the context with a default value
export const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

// Create the provider component
export const ConfigProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedConfig = localStorage.getItem('pokebim-config');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        if (parsedConfig.goals && parsedConfig.goals.subscribersTargetDate) {
          parsedConfig.goals.subscribersTargetDate = new Date(parsedConfig.goals.subscribersTargetDate);
        }
        // Merge saved config with defaults to prevent missing fields
        setConfig(prev => ({ ...prev, ...parsedConfig }));
      } catch (error) {
        console.error('Error parsing config:', error);
      }
    }
    setLoading(false);
  }, []);

  const updateConfig = (updates: Partial<AppConfig>) => {
    const newConfig = { ...config, ...updates };
    if (updates.theme) {
        newConfig.theme = { ...config.theme, ...updates.theme };
    }
    setConfig(newConfig);
    localStorage.setItem('pokebim-config', JSON.stringify(newConfig));
  };

  const updateGoals = (updates: Partial<UserGoals>) => {
    const newGoals = { ...config.goals, ...updates };
    updateConfig({ goals: newGoals });
  };

  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG);
    localStorage.setItem('pokebim-config', JSON.stringify(DEFAULT_CONFIG));
  };

  const value = {
    config,
    loading,
    updateConfig,
    updateGoals,
    resetConfig,
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
};