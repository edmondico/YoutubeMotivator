'use client';

import { useState, useEffect } from 'react';
import { startOfWeek, format } from 'date-fns';
import { es } from 'date-fns/locale';

interface WeeklyVideoStats {
  videosThisWeek: number;
  weeklyGoal: number;
  currentWeekId: string;
  uploadDates: Date[];
  streakWeeks: number;
  totalWeeksWithGoal: number;
  weeksMeetingGoal: number;
}

const INITIAL_STATS: WeeklyVideoStats = {
  videosThisWeek: 0,
  weeklyGoal: 2,
  currentWeekId: '',
  uploadDates: [],
  streakWeeks: 0,
  totalWeeksWithGoal: 0,
  weeksMeetingGoal: 0,
};

export const useWeeklyVideoTracker = () => {
  const [stats, setStats] = useState<WeeklyVideoStats>(INITIAL_STATS);

  const getCurrentWeekId = () => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday start
    return format(weekStart, 'yyyy-MM-dd', { locale: es });
  };

  const loadStats = () => {
    const saved = localStorage.getItem('pokebim-weekly-videos');
    if (saved) {
      const parsedStats = JSON.parse(saved);
      // Convert date strings back to Date objects
      parsedStats.uploadDates = parsedStats.uploadDates.map((date: string) => new Date(date));
      
      const currentWeekId = getCurrentWeekId();
      
      // If it's a new week, reset weekly counter but keep other stats
      if (parsedStats.currentWeekId !== currentWeekId) {
        const wasGoalMet = parsedStats.videosThisWeek >= parsedStats.weeklyGoal;
        
        setStats({
          ...parsedStats,
          videosThisWeek: 0,
          currentWeekId,
          totalWeeksWithGoal: parsedStats.totalWeeksWithGoal + (parsedStats.weeklyGoal > 0 ? 1 : 0),
          weeksMeetingGoal: parsedStats.weeksMeetingGoal + (wasGoalMet ? 1 : 0),
          streakWeeks: wasGoalMet ? parsedStats.streakWeeks + 1 : 0,
        });
      } else {
        setStats(parsedStats);
      }
    } else {
      const currentWeekId = getCurrentWeekId();
      setStats({ ...INITIAL_STATS, currentWeekId });
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const saveStats = (newStats: WeeklyVideoStats) => {
    setStats(newStats);
    localStorage.setItem('pokebim-weekly-videos', JSON.stringify(newStats));
  };

  const addVideoThisWeek = () => {
    const now = new Date();
    const currentWeekId = getCurrentWeekId();
    
    const newStats = {
      ...stats,
      videosThisWeek: stats.videosThisWeek + 1,
      currentWeekId,
      uploadDates: [...stats.uploadDates, now],
    };

    saveStats(newStats);
  };

  const setWeeklyGoal = (goal: number) => {
    const newStats = {
      ...stats,
      weeklyGoal: Math.max(0, goal),
    };

    saveStats(newStats);
  };

  const getWeeklyProgress = () => {
    return stats.weeklyGoal > 0 ? (stats.videosThisWeek / stats.weeklyGoal) * 100 : 0;
  };

  const getSuccessRate = () => {
    return stats.totalWeeksWithGoal > 0 
      ? Math.round((stats.weeksMeetingGoal / stats.totalWeeksWithGoal) * 100)
      : 0;
  };

  const getRecentUploads = (days: number = 7) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return stats.uploadDates.filter(date => date >= cutoffDate);
  };

  const getMotivationalMessage = () => {
    const progress = getWeeklyProgress();
    const remaining = stats.weeklyGoal - stats.videosThisWeek;
    
    if (progress >= 100) {
      return {
        message: "¡Increíble! Has cumplido tu meta semanal 🎉",
        color: "text-green-600",
        emoji: "🏆"
      };
    } else if (progress >= 75) {
      return {
        message: `¡Casi lo logras! Solo ${remaining} video${remaining > 1 ? 's' : ''} más`,
        color: "text-blue-600",
        emoji: "💪"
      };
    } else if (progress >= 50) {
      return {
        message: `¡Buen ritmo! Te faltan ${remaining} videos esta semana`,
        color: "text-orange-600",
        emoji: "🔥"
      };
    } else if (stats.videosThisWeek > 0) {
      return {
        message: `¡Gran comienzo! Sigue así, faltan ${remaining} videos`,
        color: "text-yellow-600",
        emoji: "⭐"
      };
    } else {
      return {
        message: `¡Es hora de empezar! ${stats.weeklyGoal} videos esta semana`,
        color: "text-gray-600",
        emoji: "🚀"
      };
    }
  };

  return {
    weeklyStats: {
      ...stats,
      successRate: getSuccessRate() // Añadimos el valor calculado al objeto
    },
    weeklyGoal: stats.weeklyGoal,
    addVideoThisWeek,
    setWeeklyGoal,
    getWeeklyProgress,
    getSuccessRate,
    getRecentUploads,
    getMotivationalMessage,
    loadStats, // Export for manual refresh if needed
  };
};