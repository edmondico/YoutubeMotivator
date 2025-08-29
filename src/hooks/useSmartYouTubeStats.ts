'use client';

import { useState, useEffect, useCallback } from 'react';
import { YouTubeStats } from '@/types';
import { useYouTubeDataPersistence } from './useYouTubeDataPersistence';
import { useRealYouTubeStats } from './useRealYouTubeStats';
import { useCachedYouTubeStats } from './useCachedYouTubeStats';
import { useAuth } from '@/components/AuthProvider';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface SmartYouTubeData {
  stats: YouTubeStats | null;
  dataSource: 'api' | 'cache' | 'historical';
  loading: boolean;
  error: string | null;
  quotaExceeded: boolean;
  lastUpdated: Date | null;
}

export const useSmartYouTubeStats = (channelId?: string) => {
  const [smartData, setSmartData] = useState<SmartYouTubeData>({
    stats: null,
    dataSource: 'cache',
    loading: true,
    error: null,
    quotaExceeded: false,
    lastUpdated: null
  });

  const { user } = useAuth();
  const supabase = createClientComponentClient();
  
  // Hooks para diferentes fuentes de datos
  const { 
    stats: realStatsData, 
    error: realStatsError, 
    lastFetch: realStatsLastFetch, 
    isConfigured: isRealStatsConfigured
  } = useRealYouTubeStats();
  const { 
    data: cachedStatsData
  } = useCachedYouTubeStats(channelId);

  const { 
    getSubscriberGrowthHistory, 
    shouldUseCachedData 
  } = useYouTubeDataPersistence();

  // Obtener datos históricos más recientes de la BD
  const getLatestHistoricalData = useCallback(async (): Promise<YouTubeStats | null> => {
    if (!user || !channelId) return null;

    try {
      // Obtener los datos más recientes de daily_stats
      const { data: latestStats } = await supabase
        .from('youtube_daily_stats')
        .select('*')
        .eq('user_id', user.id)
        .eq('channel_id', channelId)
        .order('date', { ascending: false })
        .limit(1)
        .single();

      if (!latestStats) return null;

      // Obtener el video más reciente desde la cache
      const { data: latestVideo } = await supabase
        .from('youtube_videos_cache')
        .select('published_at')
        .eq('user_id', user.id)
        .eq('channel_id', channelId)
        .order('published_at', { ascending: false })
        .limit(1)
        .single();

      const lastVideoDate = latestVideo 
        ? new Date(latestVideo.published_at)
        : new Date(latestStats.date);

      const daysSinceLastVideo = Math.floor(
        (Date.now() - lastVideoDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Obtener datos de la semana actual para weekly growth
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
      const weekStart = startOfWeek.toISOString().split('T')[0];

      const { data: weeklyData } = await supabase
        .from('youtube_daily_stats')
        .select('subscriber_count')
        .eq('user_id', user.id)
        .eq('channel_id', channelId)
        .eq('date', weekStart)
        .single();

      const weeklySubGrowth = weeklyData 
        ? Number(latestStats.subscriber_count) - Number(weeklyData.subscriber_count)
        : 0;

      return {
        subscriberCount: Number(latestStats.subscriber_count),
        lastVideoDate,
        daysSinceLastVideo,
        dailySubGrowth: Number(latestStats.subscribers_gained || 0),
        lastVideoSubGrowth: 0, // Would need video-specific tracking
        totalViews: Number(latestStats.total_views),
        averageViewsPerVideo: Number(latestStats.video_count) > 0 
          ? Math.floor(Number(latestStats.total_views) / Number(latestStats.video_count))
          : 0,
        channelId: latestStats.channel_id,
        customUrl: `@Channel${channelId.slice(-6)}`, // Fallback custom URL
        weeklySubGrowth: Math.max(0, weeklySubGrowth),
      };

    } catch (error) {
      console.error('Error getting historical data:', error);
      return null;
    }
  }, [user, channelId, supabase]);

  // Check if data is fresh (less than 2 hours old)
  const isDataFresh = useCallback((lastUpdated: Date | null) => {
    if (!lastUpdated) return false;
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
    return lastUpdated > twoHoursAgo;
  }, []);

  // Función principal para obtener datos de la mejor fuente disponible
  const fetchSmartData = useCallback(async () => {
    if (!user || !channelId) {
      setSmartData({
        stats: null,
        dataSource: 'cache',
        loading: false,
        error: 'Usuario no autenticado o canal no configurado',
        quotaExceeded: false,
        lastUpdated: null
      });
      return;
    }

    setSmartData(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Primero, intentar datos en caché si son frescos (menos de 2 horas)
      if (cachedStatsData.channel) {
        const cachedChannel = cachedStatsData.channel;
        const lastUpdatedTime = new Date(cachedChannel.lastUpdated);
        
        if (isDataFresh(lastUpdatedTime)) {
          const stats: YouTubeStats = {
            subscriberCount: cachedChannel.subscriberCount,
            lastVideoDate: cachedStatsData.videos.length > 0 
              ? new Date(cachedStatsData.videos[0].publishedAt)
              : new Date(cachedChannel.lastUpdated),
            daysSinceLastVideo: cachedStatsData.videos.length > 0
              ? Math.floor((Date.now() - new Date(cachedStatsData.videos[0].publishedAt).getTime()) / (1000 * 60 * 60 * 24))
              : Math.floor((Date.now() - new Date(cachedChannel.lastUpdated).getTime()) / (1000 * 60 * 60 * 24)),
            dailySubGrowth: 0, // Will be calculated from historical data
            lastVideoSubGrowth: 0,
            totalViews: cachedChannel.viewCount,
            averageViewsPerVideo: cachedChannel.videoCount > 0 
              ? Math.floor(cachedChannel.viewCount / cachedChannel.videoCount)
              : 0,
            channelId: cachedChannel.id,
            customUrl: cachedChannel.customUrl || '',
            weeklySubGrowth: 0, // Will be calculated from historical data
          };

          console.log('Using fresh cached data (less than 2 hours old)');
          setSmartData({
            stats,
            dataSource: 'cache',
            loading: false,
            error: null,
            quotaExceeded: false,
            lastUpdated: lastUpdatedTime
          });
          return;
        }
      }

      // Si los datos del caché no son frescos, verificar quota antes de llamar API
      const isQuotaExceeded = await shouldUseCachedData();
      
      if (isQuotaExceeded) {
        console.log('Quota exceeded, using stored data');
        setSmartData(prev => ({ ...prev, quotaExceeded: true }));
        
        // Intentar datos históricos si no hay caché fresco
        const historicalData = await getLatestHistoricalData();
        if (historicalData) {
          setSmartData({
            stats: historicalData,
            dataSource: 'historical',
            loading: false,
            error: null,
            quotaExceeded: true,
            lastUpdated: new Date()
          });
          return;
        }

        // Si hay caché viejo, usarlo como último recurso
        if (cachedStatsData.channel) {
          const cachedChannel = cachedStatsData.channel;
          const stats: YouTubeStats = {
            subscriberCount: cachedChannel.subscriberCount,
            lastVideoDate: cachedStatsData.videos.length > 0 
              ? new Date(cachedStatsData.videos[0].publishedAt)
              : new Date(cachedChannel.lastUpdated),
            daysSinceLastVideo: cachedStatsData.videos.length > 0
              ? Math.floor((Date.now() - new Date(cachedStatsData.videos[0].publishedAt).getTime()) / (1000 * 60 * 60 * 24))
              : Math.floor((Date.now() - new Date(cachedChannel.lastUpdated).getTime()) / (1000 * 60 * 60 * 24)),
            dailySubGrowth: 0,
            lastVideoSubGrowth: 0,
            totalViews: cachedChannel.viewCount,
            averageViewsPerVideo: cachedChannel.videoCount > 0 
              ? Math.floor(cachedChannel.viewCount / cachedChannel.videoCount)
              : 0,
            channelId: cachedChannel.id,
            customUrl: cachedChannel.customUrl || '',
            weeklySubGrowth: 0,
          };

          console.log('Using old cached data due to quota limits');
          setSmartData({
            stats,
            dataSource: 'cache',
            loading: false,
            error: 'Quota excedida - usando datos guardados',
            quotaExceeded: true,
            lastUpdated: new Date(cachedChannel.lastUpdated)
          });
          return;
        }

        // Sin datos disponibles
        setSmartData({
          stats: null,
          dataSource: 'cache',
          loading: false,
          error: 'Quota API excedida y no hay datos guardados disponibles',
          quotaExceeded: true,
          lastUpdated: null
        });
        return;
      }

      // Si tenemos quota disponible, usar API real
      if (isRealStatsConfigured() && realStatsData) {
        setSmartData({
          stats: realStatsData,
          dataSource: 'api',
          loading: false,
          error: realStatsError,
          quotaExceeded: false,
          lastUpdated: realStatsLastFetch
        });
        return;
      }

      // Si la API no está configurada, intentar caché o históricos
      const historicalData = await getLatestHistoricalData();
      if (historicalData) {
        setSmartData({
          stats: historicalData,
          dataSource: 'historical',
          loading: false,
          error: 'API no configurada - usando datos históricos',
          quotaExceeded: false,
          lastUpdated: new Date()
        });
        return;
      }

      // Sin datos disponibles
      setSmartData({
        stats: null,
        dataSource: 'cache',
        loading: false,
        error: 'No hay datos disponibles. Configure su API Key en Configuración.',
        quotaExceeded: false,
        lastUpdated: null
      });

    } catch (error: unknown) {
      console.error('Error fetching smart data:', error);
      setSmartData({
        stats: null,
        dataSource: 'cache',
        loading: false,
        error: error instanceof Error ? error.message : 'Error obteniendo datos',
        quotaExceeded: false,
        lastUpdated: null
      });
    }
  }, [
    user,
    channelId,
    cachedStatsData,
    getLatestHistoricalData,
    isDataFresh,
    isRealStatsConfigured,
    realStatsData,
    realStatsError,
    realStatsLastFetch,
    shouldUseCachedData
  ]);

  // Cargar datos al montar
  useEffect(() => {
    fetchSmartData();
  }, [fetchSmartData]);

  // Auto-refresh cada 15 minutos
  useEffect(() => {
    const interval = setInterval(fetchSmartData, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchSmartData]);

  const refresh = useCallback(() => {
    fetchSmartData();
  }, [fetchSmartData]);

  const getMotivationalMessage = useCallback(() => {
    if (!smartData.stats) {
      return smartData.error || "Configure su canal para ver estadísticas";
    }
    
    const stats = smartData.stats;
    
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
  }, [smartData]);

  const getProgressColor = useCallback(() => {
    if (!smartData.stats) return 'text-gray-500';
    if (smartData.stats.daysSinceLastVideo < 3) return 'text-green-600';
    if (smartData.stats.daysSinceLastVideo < 7) return 'text-yellow-600';
    return 'text-red-600';
  }, [smartData]);

  return {
    ...smartData,
    refresh,
    getMotivationalMessage,
    getProgressColor,
    isConfigured: () => isRealStatsConfigured(),
    getSubscriberGrowthHistory: (days?: number) => getSubscriberGrowthHistory(channelId || '', days),
  };
};