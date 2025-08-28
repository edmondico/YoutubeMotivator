'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppConfig } from './useAppConfig';

interface VideoStats {
  id: string;
  title: string;
  publishedAt: Date;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  duration: string;
  thumbnailUrl: string;
}

interface AdvancedYouTubeStats {
  // Estadísticas de videos recientes
  last3Videos: VideoStats[];
  averageViewsLast3Videos: number;
  bestPerformingVideoThisMonth: VideoStats | null;
  
  // Tendencias y crecimiento
  weeklyGrowthRate: number;
  monthlyGrowthRate: number;
  avgVideoDurationMinutes: number;
  
  // Engagement
  avgEngagementRate: number; // (likes + comments) / views
  avgCommentsPerVideo: number;
  avgLikesPerVideo: number;
  
  // Frecuencia de subida
  videosThisWeek: number;
  videosThisMonth: number;
  avgVideosPerWeek: number;
  
  // Performance insights
  trendingDirection: 'up' | 'down' | 'stable';
  consistencyScore: number; // 0-100 based on upload frequency
}

export const useAdvancedYouTubeStats = () => {
  const { config } = useAppConfig();
  const [stats, setStats] = useState<AdvancedYouTubeStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAdvancedStats = useCallback(async () => {
    if (!config.apiKey || !config.channelId) {
      setError('Se requiere API Key y Channel ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Obtener videos recientes (últimos 20 para cálculos)
      const videosResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${config.channelId}&order=date&type=video&maxResults=20&key=${config.apiKey}`
      );

      if (!videosResponse.ok) throw new Error('Error obteniendo videos');

      const videosData = await videosResponse.json();
      const recentVideos = videosData.items || [];

      if (recentVideos.length === 0) {
        throw new Error('No se encontraron videos en el canal');
      }

      // 2. Obtener estadísticas detalladas para cada video
      const videoIds = recentVideos.slice(0, 10).map((v: any) => v.id.videoId).join(',');
      const detailsResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails,snippet&id=${videoIds}&key=${config.apiKey}`
      );

      if (!detailsResponse.ok) throw new Error('Error obteniendo detalles de videos');

      const detailsData = await detailsResponse.json();
      const videoDetails = detailsData.items || [];

      // 3. Procesar estadísticas
      const processedVideos: VideoStats[] = videoDetails.map((video: any) => ({
        id: video.id,
        title: video.snippet.title,
        publishedAt: new Date(video.snippet.publishedAt),
        viewCount: parseInt(video.statistics.viewCount || '0'),
        likeCount: parseInt(video.statistics.likeCount || '0'),
        commentCount: parseInt(video.statistics.commentCount || '0'),
        duration: video.contentDetails.duration,
        thumbnailUrl: video.snippet.thumbnails.medium?.url || '',
      }));

      // 4. Calcular estadísticas avanzadas
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const last3Videos = processedVideos.slice(0, 3);
      const averageViewsLast3Videos = last3Videos.length > 0 
        ? Math.round(last3Videos.reduce((sum, video) => sum + video.viewCount, 0) / last3Videos.length)
        : 0;

      const videosThisWeek = processedVideos.filter(video => video.publishedAt >= oneWeekAgo).length;
      const videosThisMonth = processedVideos.filter(video => video.publishedAt >= oneMonthAgo).length;
      
      const totalViews = processedVideos.reduce((sum, video) => sum + video.viewCount, 0);
      const totalLikes = processedVideos.reduce((sum, video) => sum + video.likeCount, 0);
      const totalComments = processedVideos.reduce((sum, video) => sum + video.commentCount, 0);

      const avgEngagementRate = totalViews > 0 
        ? Math.round(((totalLikes + totalComments) / totalViews) * 100 * 100) / 100
        : 0;

      const avgCommentsPerVideo = processedVideos.length > 0 
        ? Math.round(totalComments / processedVideos.length)
        : 0;

      const avgLikesPerVideo = processedVideos.length > 0 
        ? Math.round(totalLikes / processedVideos.length)
        : 0;

      // Encontrar el mejor video del mes
      const videosThisMonthData = processedVideos.filter(video => video.publishedAt >= oneMonthAgo);
      const bestPerformingVideoThisMonth = videosThisMonthData.length > 0 
        ? videosThisMonthData.reduce((best, current) => 
            current.viewCount > best.viewCount ? current : best
          )
        : null;

      // Calcular tendencia basada en views de videos recientes vs antiguos
      const recentAvg = last3Videos.length > 0 
        ? last3Videos.reduce((sum, v) => sum + v.viewCount, 0) / last3Videos.length
        : 0;
      const olderAvg = processedVideos.slice(3, 6).length > 0
        ? processedVideos.slice(3, 6).reduce((sum, v) => sum + v.viewCount, 0) / processedVideos.slice(3, 6).length
        : recentAvg;

      let trendingDirection: 'up' | 'down' | 'stable' = 'stable';
      if (recentAvg > olderAvg * 1.1) trendingDirection = 'up';
      else if (recentAvg < olderAvg * 0.9) trendingDirection = 'down';

      // Calcular score de consistencia basado en frecuencia de subida
      const avgVideosPerWeek = videosThisMonth / 4.3; // 4.3 weeks per month average
      const consistencyScore = Math.min(100, Math.round((avgVideosPerWeek / 2) * 100)); // Base: 2 videos/week = 100%

      // Duración promedio (convertir ISO 8601 a minutos)
      const parseDuration = (duration: string): number => {
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (!match) return 0;
        const hours = parseInt(match[1] || '0');
        const minutes = parseInt(match[2] || '0');
        const seconds = parseInt(match[3] || '0');
        return hours * 60 + minutes + Math.round(seconds / 60);
      };

      const durations = processedVideos
        .map(video => parseDuration(video.duration))
        .filter(duration => duration > 0);
      
      const avgVideoDurationMinutes = durations.length > 0
        ? Math.round(durations.reduce((sum, duration) => sum + duration, 0) / durations.length)
        : 0;

      const advancedStats: AdvancedYouTubeStats = {
        last3Videos,
        averageViewsLast3Videos,
        bestPerformingVideoThisMonth,
        weeklyGrowthRate: videosThisWeek * 7, // Approximate weekly views growth
        monthlyGrowthRate: videosThisMonth * 30, // Approximate monthly views growth
        avgVideoDurationMinutes,
        avgEngagementRate,
        avgCommentsPerVideo,
        avgLikesPerVideo,
        videosThisWeek,
        videosThisMonth,
        avgVideosPerWeek,
        trendingDirection,
        consistencyScore,
      };

      setStats(advancedStats);

    } catch (error) {
      console.error('Error fetching advanced stats:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [config.apiKey, config.channelId]);

  const isConfigured = () => {
    return !!(config.apiKey && config.channelId);
  };

  useEffect(() => {
    if (isConfigured()) {
      fetchAdvancedStats();
    }
  }, [fetchAdvancedStats]);

  return {
    stats,
    loading,
    error,
    refreshStats: fetchAdvancedStats,
    isConfigured,
  };
};