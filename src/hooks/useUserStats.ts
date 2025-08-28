'use client';

import { useState, useEffect } from 'react';
import { UserStats } from '@/types';
import { createClient } from '@/utils/supabase/client';

const INITIAL_STATS: UserStats = {
  level: 1,
  currentXp: 0,
  xpToNextLevel: 100,
  completedTasks: 0,
  streak: 0,
  totalVideosMade: 0,
};

export const useUserStats = () => {
  const [stats, setStats] = useState<UserStats>(INITIAL_STATS);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setStats(INITIAL_STATS);
        return;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading user stats:', error);
        return;
      }

      if (!data) {
        await createUserProfile(user.id);
        setStats(INITIAL_STATS);
        return;
      }

      setStats({
        level: data.level || 1,
        currentXp: data.current_xp || 0,
        xpToNextLevel: data.xp_to_next_level || 100,
        completedTasks: data.completed_tasks || 0,
        streak: data.streak || 0,
        totalVideosMade: data.total_videos_made || 0,
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const createUserProfile = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .insert([{
          id: userId,
          level: 1,
          current_xp: 0,
          xp_to_next_level: 100,
          completed_tasks: 0,
          streak: 0,
          total_videos_made: 0,
        }]);

      if (error) {
        console.error('Error creating user profile:', error);
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  };

  const saveStats = async (newStats: UserStats) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({
          level: newStats.level,
          current_xp: newStats.currentXp,
          xp_to_next_level: newStats.xpToNextLevel,
          completed_tasks: newStats.completedTasks,
          streak: newStats.streak,
          total_videos_made: newStats.totalVideosMade,
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating user stats:', error);
        return;
      }

      setStats(newStats);
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  };

  const addXp = async (xp: number) => {
    const newXp = stats.currentXp + xp;
    let newLevel = stats.level;
    let xpToNext = stats.xpToNextLevel;

    while (newXp >= xpToNext) {
      newLevel++;
      xpToNext = newLevel * 100;
    }

    const newStats = {
      ...stats,
      currentXp: newXp,
      level: newLevel,
      xpToNextLevel: xpToNext,
    };

    await saveStats(newStats);
    return newLevel > stats.level;
  };

  const completeTask = async (xpReward: number) => {
    const newXp = stats.currentXp + xpReward;
    let newLevel = stats.level;
    let xpToNext = stats.xpToNextLevel;
    let completedTasksCount = stats.completedTasks + 1;

    while (newXp >= xpToNext) {
      newLevel++;
      xpToNext = newLevel * 100;
    }

    const updatedStats = {
      ...stats,
      currentXp: newXp,
      level: newLevel,
      xpToNextLevel: xpToNext,
      completedTasks: completedTasksCount,
    };

    await saveStats(updatedStats);
    return newLevel > stats.level;
  };

  const updateStreak = async (streak?: number) => {
    const updatedStats = {
      ...stats,
      streak: streak !== undefined ? streak : stats.streak + 1,
    };

    await saveStats(updatedStats);
  };

  const addVideo = async () => {
    const updatedStats = {
      ...stats,
      totalVideosMade: stats.totalVideosMade + 1,
    };
    
    await saveStats(updatedStats);
    await addXp(200);
  };

  return {
    stats,
    loading,
    addXp,
    completeTask,
    updateStreak,
    addVideo,
    loadUserStats,
  };
};