'use client';

import { useState, useEffect } from 'react';
import { YouTubeStats } from '@/types';

// Datos simulados para PokeBim (se pueden actualizar con API real más adelante)
const MOCK_DATA: YouTubeStats = {
  subscriberCount: 1250,
  lastVideoDate: new Date('2024-01-20'), // Ejemplo: hace 7 días
  daysSinceLastVideo: 7,
  dailySubGrowth: 5,
  lastVideoSubGrowth: 45,
  totalViews: 125000,
  averageViewsPerVideo: 2500,
  channelId: 'UCi22Ce1p-tDw6e7_WfsjPFg',
  customUrl: '@PokeBim',
  weeklySubGrowth: 35,
  videoCount: 50,
};

export const useYouTubeStats = () => {
  const [stats, setStats] = useState<YouTubeStats>(MOCK_DATA);
  const [loading, setLoading] = useState(false);

  // Simular actualización de datos cada hora
  useEffect(() => {
    const updateStats = () => {
      const now = new Date();
      const daysSince = Math.floor((now.getTime() - stats.lastVideoDate.getTime()) / (1000 * 60 * 60 * 24));
      
      setStats(prevStats => ({
        ...prevStats,
        daysSinceLastVideo: daysSince,
        // Simular crecimiento diario aleatorio
        subscriberCount: prevStats.subscriberCount + Math.floor(Math.random() * 10),
        dailySubGrowth: Math.floor(Math.random() * 10) + 1,
      }));
    };

    const interval = setInterval(updateStats, 60000); // Actualizar cada minuto para demo
    return () => clearInterval(interval);
  }, [stats.lastVideoDate]);

  const refreshStats = async () => {
    setLoading(true);
    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // En una implementación real, aquí harías la llamada a la API de YouTube
    const updatedStats = {
      ...stats,
      subscriberCount: stats.subscriberCount + Math.floor(Math.random() * 20),
      dailySubGrowth: Math.floor(Math.random() * 15) + 1,
    };
    
    setStats(updatedStats);
    setLoading(false);
  };

  const markVideoUploaded = () => {
    const now = new Date();
    const newStats = {
      ...stats,
      lastVideoDate: now,
      daysSinceLastVideo: 0,
      lastVideoSubGrowth: Math.floor(Math.random() * 100) + 20, // Simular ganancia de subs por video
    };
    setStats(newStats);
  };

  const getMotivationalMessage = () => {
    if (stats.daysSinceLastVideo === 0) {
      return "¡Acabas de subir un video! 🎉 ¡Sigue así!";
    } else if (stats.daysSinceLastVideo < 3) {
      return "¡Vas muy bien! 💪 Mantén el ritmo.";
    } else if (stats.daysSinceLastVideo < 7) {
      return `Llevas ${stats.daysSinceLastVideo} días sin subir. ⏰ ¡Es hora de crear!`;
    } else if (stats.daysSinceLastVideo < 14) {
      return `😅 ${stats.daysSinceLastVideo} días... ¡Tus subs te extrañan!`;
    } else {
      return `🚨 ¡ALERTA! ${stats.daysSinceLastVideo} días sin contenido. ¡Tus fans necesitan a PokeBim!`;
    }
  };

  const getProgressColor = () => {
    if (stats.daysSinceLastVideo < 3) return 'text-green-600';
    if (stats.daysSinceLastVideo < 7) return 'text-yellow-600';
    return 'text-red-600';
  };

  return {
    stats,
    loading,
    refreshStats,
    markVideoUploaded,
    getMotivationalMessage,
    getProgressColor,
  };
};