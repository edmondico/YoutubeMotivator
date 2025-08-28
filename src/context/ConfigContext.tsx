'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';
import { AppConfig, UserGoals } from '@/types';
import { createClient } from '@/utils/supabase/client';

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
  dailyViewsTarget: 1000,
  subscribersTarget: 10000,
  subscribersTargetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  weeklySubscribersTarget: 100,
  videosPerWeek: 3,
  dailyTasksTarget: 5,
  streakTarget: 30,
};

const DEFAULT_CONFIG: AppConfig = {
  channelName: 'PokeBim',
  channelId: 'UCi22Ce1p-tDw6e7_WfsjPFg',
  apiKey: process.env.NEXT_PUBLIC_YT_API_KEY || '',
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
  const supabase = createClient();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setConfig(DEFAULT_CONFIG);
        setLoading(false);
        return;
      }

      const [profileResult, goalsResult, configResult] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('id', user.id).single(),
        supabase.from('user_goals').select('*').eq('user_id', user.id).single(),
        supabase.from('app_config').select('*').eq('user_id', user.id).single(),
      ]);

      let loadedConfig: AppConfig = { ...DEFAULT_CONFIG };

      if (profileResult.data) {
        loadedConfig.channelId = profileResult.data.channel_id || DEFAULT_CONFIG.channelId;
        loadedConfig.channelName = profileResult.data.channel_name || DEFAULT_CONFIG.channelName;
        loadedConfig.apiKey = profileResult.data.api_key || DEFAULT_CONFIG.apiKey;
      }

      if (goalsResult.data) {
        loadedConfig.goals = {
          id: goalsResult.data.id,
          dailyViewsTarget: goalsResult.data.daily_views_target || DEFAULT_GOALS.dailyViewsTarget,
          subscribersTarget: goalsResult.data.subscribers_target || DEFAULT_GOALS.subscribersTarget,
          subscribersTargetDate: goalsResult.data.subscribers_target_date ? 
            new Date(goalsResult.data.subscribers_target_date) : DEFAULT_GOALS.subscribersTargetDate,
          weeklySubscribersTarget: goalsResult.data.weekly_subscribers_target || DEFAULT_GOALS.weeklySubscribersTarget,
          videosPerWeek: goalsResult.data.videos_per_week || DEFAULT_GOALS.videosPerWeek,
          dailyTasksTarget: goalsResult.data.daily_tasks_target || DEFAULT_GOALS.dailyTasksTarget,
          streakTarget: goalsResult.data.streak_target || DEFAULT_GOALS.streakTarget,
        };
      }

      if (configResult.data) {
        loadedConfig.notifications = {
          enabled: configResult.data.notifications_enabled ?? DEFAULT_CONFIG.notifications.enabled,
          reminderTimes: configResult.data.reminder_times || DEFAULT_CONFIG.notifications.reminderTimes,
          taskReminders: configResult.data.task_reminders ?? DEFAULT_CONFIG.notifications.taskReminders,
          youtubeReminders: configResult.data.youtube_reminders ?? DEFAULT_CONFIG.notifications.youtubeReminders,
        };
        loadedConfig.theme = {
          primaryColor: configResult.data.primary_color || DEFAULT_CONFIG.theme.primaryColor,
          darkMode: configResult.data.dark_mode ?? DEFAULT_CONFIG.theme.darkMode,
        };
      }

      setConfig(loadedConfig);
    } catch (error) {
      console.error('Error loading config:', error);
      setConfig(DEFAULT_CONFIG);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (updates: Partial<AppConfig>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const newConfig = { ...config, ...updates };
      if (updates.theme) {
        newConfig.theme = { ...config.theme, ...updates.theme };
      }

      if (updates.channelId !== undefined || updates.channelName !== undefined || updates.apiKey !== undefined) {
        await supabase
          .from('user_profiles')
          .upsert({
            id: user.id,
            channel_id: updates.channelId || config.channelId,
            channel_name: updates.channelName || config.channelName,
            api_key: updates.apiKey || config.apiKey,
          });
      }

      if (updates.notifications || updates.theme) {
        await supabase
          .from('app_config')
          .upsert({
            user_id: user.id,
            notifications_enabled: updates.notifications?.enabled ?? config.notifications.enabled,
            reminder_times: updates.notifications?.reminderTimes || config.notifications.reminderTimes,
            task_reminders: updates.notifications?.taskReminders ?? config.notifications.taskReminders,
            youtube_reminders: updates.notifications?.youtubeReminders ?? config.notifications.youtubeReminders,
            primary_color: updates.theme?.primaryColor || config.theme.primaryColor,
            dark_mode: updates.theme?.darkMode ?? config.theme.darkMode,
          });
      }

      setConfig(newConfig);
    } catch (error) {
      console.error('Error updating config:', error);
    }
  };

  const updateGoals = async (updates: Partial<UserGoals>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const newGoals = { ...config.goals, ...updates };

      await supabase
        .from('user_goals')
        .upsert({
          user_id: user.id,
          daily_views_target: newGoals.dailyViewsTarget,
          subscribers_target: newGoals.subscribersTarget,
          subscribers_target_date: newGoals.subscribersTargetDate.toISOString(),
          weekly_subscribers_target: newGoals.weeklySubscribersTarget,
          videos_per_week: newGoals.videosPerWeek,
          daily_tasks_target: newGoals.dailyTasksTarget,
          streak_target: newGoals.streakTarget,
        });

      setConfig(prev => ({ ...prev, goals: newGoals }));
    } catch (error) {
      console.error('Error updating goals:', error);
    }
  };

  const resetConfig = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      await Promise.all([
        supabase.from('user_profiles').delete().eq('id', user.id),
        supabase.from('user_goals').delete().eq('user_id', user.id),
        supabase.from('app_config').delete().eq('user_id', user.id),
      ]);

      setConfig(DEFAULT_CONFIG);
    } catch (error) {
      console.error('Error resetting config:', error);
    }
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