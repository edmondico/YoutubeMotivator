'use client';

import { useState, useEffect } from 'react';
import { UserStats } from '@/types';

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

  useEffect(() => {
    const savedStats = localStorage.getItem('pokebim-user-stats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, []);

  const saveStats = (newStats: UserStats) => {
    setStats(newStats);
    localStorage.setItem('pokebim-user-stats', JSON.stringify(newStats));
  };

  const addXp = (xp: number) => {
    const newXp = stats.currentXp + xp;
    let newLevel = stats.level;
    let xpToNext = stats.xpToNextLevel;

    // Verificar si sube de nivel
    while (newXp >= xpToNext) {
      newLevel++;
      xpToNext = newLevel * 100; // Cada nivel requiere más XP
    }

    saveStats({
      ...stats,
      currentXp: newXp,
      level: newLevel,
      xpToNextLevel: xpToNext,
    });

    return newLevel > stats.level; // Retorna true si subió de nivel
  };

  const completeTask = (xpReward: number) => {
    const today = new Date().toDateString();
    const lastActivityDate = localStorage.getItem('pokebim-last-activity-date');
    
    // Actualizar contador de tareas diarias
    let dailyTasksCompleted = parseInt(localStorage.getItem('pokebim-daily-tasks-completed') || '0');
    
    if (lastActivityDate !== today) {
      // Es un nuevo día, resetear contador
      dailyTasksCompleted = 1;
      localStorage.setItem('pokebim-last-activity-date', today);
    } else {
      // Mismo día, incrementar contador
      dailyTasksCompleted += 1;
    }
    
    localStorage.setItem('pokebim-daily-tasks-completed', dailyTasksCompleted.toString());

    const newXp = stats.currentXp + xpReward;
    let newLevel = stats.level;
    let xpToNext = stats.xpToNextLevel;
    let completedTasksCount = stats.completedTasks + 1;

    // Verificar si sube de nivel
    while (newXp >= xpToNext) {
      newLevel++;
      xpToNext = newLevel * 100; // Cada nivel requiere más XP
    }

    const updatedStats = {
      ...stats,
      currentXp: newXp,
      level: newLevel,
      xpToNextLevel: xpToNext,
      completedTasks: completedTasksCount,
    };

    saveStats(updatedStats);
    return newLevel > stats.level; // Retorna true si subió de nivel
  };

  const updateStreak = () => {
    const today = new Date().toDateString();
    const lastActivity = localStorage.getItem('pokebim-last-activity');
    
    if (lastActivity === today) {
      return; // Ya se actualizó hoy
    }
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastActivity === yesterday.toDateString()) {
      // Continuó la racha
      saveStats({
        ...stats,
        streak: stats.streak + 1,
      });
    } else {
      // Se rompió la racha
      saveStats({
        ...stats,
        streak: 1,
      });
    }
    
    localStorage.setItem('pokebim-last-activity', today);
  };

  const addVideo = () => {
    saveStats({
      ...stats,
      totalVideosMade: stats.totalVideosMade + 1,
    });
    addXp(200); // Bonus XP por subir video
  };

  // Función para actualizar vistas diarias (simulación)
  const updateDailyViews = (views: number) => {
    localStorage.setItem('pokebim-daily-views', views.toString());
  };

  return {
    stats,
    addXp,
    completeTask,
    updateStreak,
    addVideo,
    updateDailyViews,
  };
};