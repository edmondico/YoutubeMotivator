'use client';

import { useState, useEffect, useCallback } from 'react';
import { YouTubeStats } from '@/types';
import { useAppConfig } from './useAppConfig';
import { startOfWeek, format } from 'date-fns';

interface YouTubeAPIResponse {
  items: Array<{
    statistics: {
      subscriberCount: string;
      videoCount: string;
      viewCount: string;
    };
    snippet: {
      publishedAt: string;
      customUrl: string;
      title: string;
    };
  }>;
}

interface VideosAPIResponse {
  items: Array<{
    snippet: {
      publishedAt: string;
      title: string;
    };
    statistics: {
      viewCount: string;
    };
  }>;
}

export const useRealYouTubeStats = () => {
  const { config } = useAppConfig();
  const [stats, setStats] = useState<YouTubeStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const fetchChannelStats = useCallback(async (): Promise<YouTubeStats | null> => {
    console.log('Usando API Key:', config.apiKey);
    console.log('Usando Channel ID:', config.channelId);
    
    if (!config.apiKey || !config.channelId) {
      setError('Se requiere API Key y Channel ID para obtener datos reales de YouTube');
      return null;
    }

    try {
      setError(null);
      
      // Obtener estadísticas del canal
      const channelResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${config.channelId}&key=${config.apiKey}`
      );

      if (!channelResponse.ok) {
        if (channelResponse.status === 403) {
          throw new Error('API Key inválida o sin permisos para YouTube Data API v3');
        } else if (channelResponse.status === 404) {
          throw new Error('Channel ID no encontrado');
        } else {
          throw new Error(`Error ${channelResponse.status}: ${channelResponse.statusText}`);
        }
      }

      const channelData: YouTubeAPIResponse = await channelResponse.json();
      
      if (!channelData.items || channelData.items.length === 0) {
        throw new Error('Canal no encontrado con el Channel ID proporcionado');
      }

      const channelInfo = channelData.items[0];

      // Obtener videos recientes del canal
      const videosResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${config.channelId}&order=date&type=video&maxResults=1&key=${config.apiKey}`
      );

      if (!videosResponse.ok) {
        throw new Error(`Error obteniendo videos: ${videosResponse.status}`);
      }

      const videosData = await videosResponse.json();
      const recentVideos = videosData.items || [];

      // Obtener estadísticas del último video si existe
      let lastVideoSubGrowth = 0;
      if (recentVideos.length > 0) {
        const videoId = recentVideos[0].id?.videoId;
        if (videoId) {
          const videoStatsResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${config.apiKey}`
          );
          
          if (videoStatsResponse.ok) {
            const videoStatsData = await videoStatsResponse.json();
            if (videoStatsData.items && videoStatsData.items.length > 0) {
              const videoViews = parseInt(videoStatsData.items[0].statistics.viewCount || '0');
              // Estimación muy básica de suscriptores ganados por video (views/100)
              lastVideoSubGrowth = Math.floor(videoViews / 100);
            }
          }
        }
      }

      // Calcular estadísticas
      const subscriberCount = parseInt(channelInfo.statistics.subscriberCount);
      const totalViews = parseInt(channelInfo.statistics.viewCount);
      const videoCount = parseInt(channelInfo.statistics.videoCount);
      
      const lastVideoDate = recentVideos.length > 0 
        ? new Date(recentVideos[0].snippet.publishedAt)
        : new Date(channelInfo.snippet.publishedAt); // Fallback a la fecha de creación del canal
      
      const daysSinceLastVideo = Math.floor(
        (Date.now() - lastVideoDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Para crecimiento diario, necesitaríamos datos históricos
      // Por ahora calculamos una estimación basada en el total y la antigüedad del canal
      const channelAgeInDays = Math.floor(
        (Date.now() - new Date(channelInfo.snippet.publishedAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      const dailySubGrowth = channelAgeInDays > 0 ? Math.floor(subscriberCount / channelAgeInDays) : 0;

      // Lógica para el crecimiento semanal de suscriptores
      const weekStartId = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const lastWeekSubsKey = `pokebim-subs-start-of-week-${weekStartId}`;
      const subsAtStartOfWeek = parseInt(localStorage.getItem(lastWeekSubsKey) || '0');

      if (subsAtStartOfWeek === 0) {
        localStorage.setItem(lastWeekSubsKey, subscriberCount.toString());
      }
      
      const weeklySubGrowth = subsAtStartOfWeek > 0 ? subscriberCount - subsAtStartOfWeek : 0;

      const youtubeStats: YouTubeStats = {
        subscriberCount,
        lastVideoDate,
        daysSinceLastVideo,
        dailySubGrowth: Math.max(dailySubGrowth, 1), // Mínimo 1 para mostrar crecimiento
        lastVideoSubGrowth,
        totalViews,
        averageViewsPerVideo: videoCount > 0 ? Math.floor(totalViews / videoCount) : 0,
        channelId: config.channelId,
        customUrl: channelInfo.snippet.customUrl || `@${channelInfo.snippet.title?.replace(/\s+/g, '')}`,
        weeklySubGrowth,
      };

      // Persistir en localStorage con timestamp
      localStorage.setItem('pokebim-youtube-stats', JSON.stringify({
        stats: youtubeStats,
        timestamp: Date.now(),
        channelId: config.channelId,
        apiKey: config.apiKey.substring(0, 10) + '...' // Solo para verificación
      }));

      return youtubeStats;

    } catch (error) {
      console.error('Error fetching YouTube stats:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      return null;
    }
  }, [config.apiKey, config.channelId]);

  const refreshStats = useCallback(async () => {
    if (!config.apiKey || !config.channelId) {
      setError('Configura tu API Key y Channel ID en la sección de Configuración para ver datos reales');
      setStats(null);
      return;
    }

    setLoading(true);
    
    try {
      const newStats = await fetchChannelStats();
      if (newStats) {
        setStats(newStats);
        setLastFetch(new Date());
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al obtener estadísticas');
    } finally {
      setLoading(false);
    }
  }, [fetchChannelStats, config.apiKey, config.channelId]);

  // Cargar datos al montar el componente
  useEffect(() => {
    // Intentar cargar desde cache solo si coinciden las credenciales
    const cached = localStorage.getItem('pokebim-youtube-stats');
    if (cached && config.apiKey && config.channelId) {
      try {
        const { stats: cachedStats, timestamp, channelId, apiKey } = JSON.parse(cached);
        const isRecent = (Date.now() - timestamp) < 15 * 60 * 1000; // 15 minutos
        const credentialsMatch = channelId === config.channelId && apiKey === config.apiKey.substring(0, 10) + '...';
        
        if (isRecent && credentialsMatch) {
          setStats({
            ...cachedStats,
            lastVideoDate: new Date(cachedStats.lastVideoDate),
            daysSinceLastVideo: Math.floor((Date.now() - new Date(cachedStats.lastVideoDate).getTime()) / (1000 * 60 * 60 * 24))
          });
          setLastFetch(new Date(timestamp));
        }
      } catch (error) {
        console.error('Error loading cached stats:', error);
        localStorage.removeItem('pokebim-youtube-stats');
      }
    }

    // Obtener datos frescos
    refreshStats();
  }, [refreshStats]);

  // Auto-refresh cada 15 minutos si hay API key
  useEffect(() => {
    if (!config.apiKey || !config.channelId) return;

    const interval = setInterval(() => {
      if (lastFetch && (Date.now() - lastFetch.getTime()) > 15 * 60 * 1000) {
        refreshStats();
      }
    }, 60 * 1000); // Verificar cada minuto

    return () => clearInterval(interval);
  }, [lastFetch, refreshStats, config.apiKey, config.channelId]);

  const getMotivationalMessage = useCallback(() => {
    if (!stats) return "Configura tu API Key para ver estadísticas motivacionales";
    
    if (stats.daysSinceLastVideo === 0) {
      return "¡Acabas de subir un video! 🎉 ¡Sigue así!";
    } else if (stats.daysSinceLastVideo === 1) {
      return "Video subido ayer 👍 ¿Ya tienes ideas para el siguiente?";
    } else if (stats.daysSinceLastVideo < 3) {
      return `${stats.daysSinceLastVideo} días sin video 💭 ¡Es buen momento para crear!`;
    } else if (stats.daysSinceLastVideo < 7) {
      return `⏰ ${stats.daysSinceLastVideo} días sin video. ¡Tus fans te extrañan!`;
    } else if (stats.daysSinceLastVideo < 14) {
      return `😅 ${stats.daysSinceLastVideo} días... ¡Hora de volver a la acción!`;
    } else {
      return `🚨 ¡${stats.daysSinceLastVideo} días sin contenido! ¡Es momento de crear!`;
    }
  }, [stats]);

  const getProgressColor = useCallback(() => {
    if (!stats) return 'text-gray-500';
    if (stats.daysSinceLastVideo < 3) return 'text-green-600';
    if (stats.daysSinceLastVideo < 7) return 'text-yellow-600';
    return 'text-red-600';
  }, [stats]);

  const isConfigured = () => {
    return !!(config.apiKey && config.channelId);
  };

  return {
    stats,
    loading,
    error,
    lastFetch,
    refreshStats,
    getMotivationalMessage,
    getProgressColor,
    isConfigured,
  };
};