'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@/components/AuthProvider';
import { YouTubeStats } from '@/types';
import { useYouTubeDataPersistence } from './useYouTubeDataPersistence';

interface CachedYouTubeData {
  channel: {
    id: string;
    name: string;
    subscriberCount: number;
    videoCount: number;
    viewCount: number;
    customUrl: string;
    thumbnailUrl?: string;
    lastUpdated: string;
  } | null;
  videos: Array<{
    id: string;
    title: string;
    publishedAt: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    thumbnailUrl?: string;
  }>;
  lastApiCall: string | null;
  isFromCache: boolean;
}

export const useCachedYouTubeStats = (channelId?: string) => {
  const [data, setData] = useState<CachedYouTubeData>({
    channel: null,
    videos: [],
    lastApiCall: null,
    isFromCache: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  const { user } = useAuth();
  const supabase = createClientComponentClient();
  const { 
    saveDailyStats, 
    trackAPIUsage, 
    checkAndSaveMilestones,
    shouldUseCachedData,
    getTodaysQuotaUsage
  } = useYouTubeDataPersistence();

  // Check if we should make an API call (max once per 2 hours, but also consider quota)
  const shouldCallApi = async (lastUpdated: string | null) => {
    if (!lastUpdated) return true;
    
    // Check if we're close to quota limit
    const useCache = await shouldUseCachedData();
    if (useCache) {
      console.log('Using cached data due to quota limitations');
      setQuotaExceeded(true);
      return false;
    }
    
    const lastCall = new Date(lastUpdated);
    const now = new Date();
    const hoursSinceLastCall = (now.getTime() - lastCall.getTime()) / (1000 * 60 * 60);
    return hoursSinceLastCall >= 2; // Only call API once every 2 hours
  };

  const fetchFromCache = async () => {
    if (!user || !channelId) return null;

    try {
      // Get channel data from cache
      const { data: channelCache } = await supabase
        .from('youtube_channel_cache')
        .select('*')
        .eq('user_id', user.id)
        .eq('channel_id', channelId)
        .single();

      // Get recent videos from cache (last 10)
      const { data: videosCache } = await supabase
        .from('youtube_videos_cache')
        .select('*')
        .eq('user_id', user.id)
        .eq('channel_id', channelId)
        .order('published_at', { ascending: false })
        .limit(10);

      return {
        channel: channelCache ? {
          id: channelCache.channel_id,
          name: channelCache.channel_name || '',
          subscriberCount: Number(channelCache.subscriber_count) || 0,
          videoCount: Number(channelCache.video_count) || 0,
          viewCount: Number(channelCache.view_count) || 0,
          customUrl: channelCache.custom_url || '',
          thumbnailUrl: channelCache.thumbnail_url,
          lastUpdated: channelCache.last_updated
        } : null,
        videos: videosCache?.map(v => ({
          id: v.video_id,
          title: v.title,
          publishedAt: v.published_at,
          viewCount: Number(v.view_count) || 0,
          likeCount: Number(v.like_count) || 0,
          commentCount: Number(v.comment_count) || 0,
          thumbnailUrl: v.thumbnail_url
        })) || [],
        lastApiCall: channelCache?.last_updated || null,
        isFromCache: true
      };
    } catch (error) {
      console.error('Error fetching from cache:', error);
      return null;
    }
  };

  const fetchFromYouTubeAPI = async () => {
    if (!channelId || !user) return null;

    const apiKey = process.env.NEXT_PUBLIC_YT_API_KEY;
    if (!apiKey) {
      throw new Error('API Key de YouTube no configurada');
    }

    try {
      // Fetch channel data
      const channelResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`
      );

      if (channelResponse.status === 403) {
        const errorData = await channelResponse.json();
        if (errorData.error?.message?.includes('quota')) {
          setQuotaExceeded(true);
          throw new Error('Quota de API excedida');
        }
      }

      if (!channelResponse.ok) {
        throw new Error('Error obteniendo datos del canal');
      }

      const channelData = await channelResponse.json();
      const channel = channelData.items?.[0];

      if (!channel) {
        throw new Error('Canal no encontrado');
      }

      // Fetch recent videos
      const videosResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=10&key=${apiKey}`
      );

      let videos: any[] = [];
      if (videosResponse.ok) {
        const videosData = await videosResponse.json();
        const videoIds = videosData.items?.map((item: any) => item.id.videoId).join(',');

        if (videoIds) {
          // Get video statistics
          const statsResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${videoIds}&key=${apiKey}`
          );

          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            videos = videosData.items.map((item: any) => {
              const stats = statsData.items?.find((s: any) => s.id === item.id.videoId);
              return {
                id: item.id.videoId,
                title: item.snippet.title,
                publishedAt: item.snippet.publishedAt,
                viewCount: Number(stats?.statistics?.viewCount) || 0,
                likeCount: Number(stats?.statistics?.likeCount) || 0,
                commentCount: Number(stats?.statistics?.commentCount) || 0,
                thumbnailUrl: item.snippet.thumbnails?.medium?.url
              };
            });
          }
        }
      }

      const channelResult = {
        id: channel.id,
        name: channel.snippet.title,
        subscriberCount: Number(channel.statistics.subscriberCount) || 0,
        videoCount: Number(channel.statistics.videoCount) || 0,
        viewCount: Number(channel.statistics.viewCount) || 0,
        customUrl: channel.snippet.customUrl || '',
        thumbnailUrl: channel.snippet.thumbnails?.medium?.url,
        lastUpdated: new Date().toISOString()
      };

      // Cache the results
      await cacheResults(channelResult, videos);

      // Track API usage
      await trackAPIUsage(100, 3); // Approximate quota usage for channel + videos + stats calls

      // Save daily stats for historical tracking
      const today = new Date().toISOString().split('T')[0];
      await saveDailyStats({
        channelId: channel.id,
        subscriberCount: channelResult.subscriberCount,
        videoCount: channelResult.videoCount,
        totalViews: channelResult.viewCount,
        date: today,
        videos: videos
      });

      // Check for milestones (every 1000 subs, 100 videos, 1M views)
      const milestones = [];
      const subMilestones = [1000, 5000, 10000, 50000, 100000, 500000, 1000000];
      const viewMilestones = [1000000, 5000000, 10000000, 50000000, 100000000];
      const videoMilestones = [10, 50, 100, 500, 1000];

      for (const milestone of subMilestones) {
        if (channelResult.subscriberCount >= milestone) {
          milestones.push({
            type: 'subscribers' as const,
            value: milestone,
            previousValue: 0,
            channelId: channel.id
          });
        }
      }

      for (const milestone of viewMilestones) {
        if (channelResult.viewCount >= milestone) {
          milestones.push({
            type: 'views' as const,
            value: milestone,
            previousValue: 0,
            channelId: channel.id
          });
        }
      }

      for (const milestone of videoMilestones) {
        if (channelResult.videoCount >= milestone) {
          milestones.push({
            type: 'videos' as const,
            value: milestone,
            previousValue: 0,
            channelId: channel.id
          });
        }
      }

      if (milestones.length > 0) {
        await checkAndSaveMilestones(milestones);
      }

      return {
        channel: channelResult,
        videos,
        lastApiCall: new Date().toISOString(),
        isFromCache: false
      };

    } catch (error) {
      console.error('YouTube API Error:', error);
      throw error;
    }
  };

  const cacheResults = async (channel: any, videos: any[]) => {
    if (!user) return;

    try {
      // Cache channel data
      await supabase
        .from('youtube_channel_cache')
        .upsert({
          user_id: user.id,
          channel_id: channel.id,
          channel_name: channel.name,
          subscriber_count: channel.subscriberCount,
          video_count: channel.videoCount,
          view_count: channel.viewCount,
          custom_url: channel.customUrl,
          thumbnail_url: channel.thumbnailUrl
        });

      // Cache videos data
      for (const video of videos) {
        await supabase
          .from('youtube_videos_cache')
          .upsert({
            user_id: user.id,
            channel_id: channel.id,
            video_id: video.id,
            title: video.title,
            published_at: video.publishedAt,
            view_count: video.viewCount,
            like_count: video.likeCount,
            comment_count: video.commentCount,
            thumbnail_url: video.thumbnailUrl
          });
      }
    } catch (error) {
      console.error('Error caching data:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!channelId || !user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // First, try to get cached data
        const cachedData = await fetchFromCache();
        
        if (cachedData && cachedData.channel) {
          setData(cachedData);

          // Check if we need to refresh from API
          if (await shouldCallApi(cachedData.lastApiCall)) {
            try {
              const freshData = await fetchFromYouTubeAPI();
              if (freshData) {
                setData(freshData);
              }
            } catch (apiError) {
              // If API fails, keep using cached data
              console.log('API failed, using cached data:', apiError);
              setQuotaExceeded(true);
            }
          }
        } else {
          // No cached data, try API
          try {
            const freshData = await fetchFromYouTubeAPI();
            if (freshData) {
              setData(freshData);
            }
          } catch (apiError) {
            setError('No se pudieron obtener datos de YouTube. Configura tu canal en la sección de Configuración.');
            setQuotaExceeded(true);
          }
        }
      } catch (error: any) {
        setError(error.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [channelId, user?.id]); // Fixed: only depend on user.id, not the whole user object

  const refresh = async () => {
    if (!channelId || !user || loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const freshData = await fetchFromYouTubeAPI();
      if (freshData) {
        setData(freshData);
      }
    } catch (apiError: any) {
      setError(apiError.message || 'Error al actualizar datos');
      setQuotaExceeded(true);
      
      // Try to get cached data as fallback
      const cachedData = await fetchFromCache();
      if (cachedData && cachedData.channel) {
        setData(cachedData);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    quotaExceeded,
    refresh
  };
};