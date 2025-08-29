'use client';

import { useState, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@/components/AuthProvider';

interface YouTubeDataSnapshot {
  channelId: string;
  subscriberCount: number;
  videoCount: number;
  totalViews: number;
  date: string;
  videos?: Array<{
    id: string;
    title: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    publishedAt: string;
  }>;
}

interface MilestoneData {
  type: 'subscribers' | 'videos' | 'views';
  value: number;
  previousValue: number;
  channelId: string;
}

export const useYouTubeDataPersistence = () => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const supabase = createClientComponentClient();

  // Save daily stats snapshot
  const saveDailyStats = useCallback(async (data: YouTubeDataSnapshot) => {
    if (!user || !data.channelId) return false;

    setSaving(true);
    setError(null);

    try {
      // Get previous day's data to calculate growth
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const { data: previousData } = await supabase
        .from('youtube_daily_stats')
        .select('subscriber_count, total_views')
        .eq('user_id', user.id)
        .eq('channel_id', data.channelId)
        .eq('date', yesterdayStr)
        .single();

      const subscribersGained = previousData 
        ? data.subscriberCount - Number(previousData.subscriber_count)
        : 0;

      const dailyViews = previousData
        ? data.totalViews - Number(previousData.total_views)
        : 0;

      // Count videos published today
      const todayStart = new Date(data.date);
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(data.date);
      todayEnd.setHours(23, 59, 59, 999);

      const videosPublishedToday = data.videos?.filter(video => {
        const publishedDate = new Date(video.publishedAt);
        return publishedDate >= todayStart && publishedDate <= todayEnd;
      }).length || 0;

      // Upsert daily stats
      const { error: upsertError } = await supabase
        .from('youtube_daily_stats')
        .upsert({
          user_id: user.id,
          channel_id: data.channelId,
          date: data.date,
          subscriber_count: data.subscriberCount,
          video_count: data.videoCount,
          total_views: data.totalViews,
          subscribers_gained: Math.max(0, subscribersGained),
          daily_views: Math.max(0, dailyViews),
          videos_published: videosPublishedToday
        });

      if (upsertError) throw upsertError;

      // Save video performance data for today's videos
      if (data.videos) {
        for (const video of data.videos) {
          await supabase
            .from('youtube_video_performance')
            .upsert({
              user_id: user.id,
              channel_id: data.channelId,
              video_id: video.id,
              date: data.date,
              view_count: video.viewCount,
              like_count: video.likeCount,
              comment_count: video.commentCount,
              // Estimate subscribers gained from this video (rough calculation)
              subscribers_gained_from_video: Math.floor(video.viewCount * 0.01)
            });
        }
      }

      return true;
    } catch (error: any) {
      console.error('Error saving daily stats:', error);
      setError(error.message || 'Error al guardar estadísticas diarias');
      return false;
    } finally {
      setSaving(false);
    }
  }, [user, supabase]);

  // Track API quota usage
  const trackAPIUsage = useCallback(async (quotaUsed: number = 100, callsCount: number = 1) => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: existing } = await supabase
        .from('youtube_api_quota_usage')
        .select('quota_used, api_calls_made')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      const currentQuota = existing ? Number(existing.quota_used) + quotaUsed : quotaUsed;
      const currentCalls = existing ? Number(existing.api_calls_made) + callsCount : callsCount;

      await supabase
        .from('youtube_api_quota_usage')
        .upsert({
          user_id: user.id,
          date: today,
          quota_used: currentQuota,
          api_calls_made: currentCalls,
          last_call_timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error tracking API usage:', error);
    }
  }, [user, supabase]);

  // Check for and save milestones
  const checkAndSaveMilestones = useCallback(async (data: MilestoneData[]) => {
    if (!user || !data.length) return;

    try {
      for (const milestone of data) {
        // Check if this milestone was already achieved
        const { data: existing } = await supabase
          .from('youtube_milestones')
          .select('id')
          .eq('user_id', user.id)
          .eq('channel_id', milestone.channelId)
          .eq('milestone_type', milestone.type)
          .eq('milestone_value', milestone.value)
          .single();

        if (!existing) {
          // Save new milestone
          await supabase
            .from('youtube_milestones')
            .insert({
              user_id: user.id,
              channel_id: milestone.channelId,
              milestone_type: milestone.type,
              milestone_value: milestone.value,
              previous_value: milestone.previousValue,
              achieved_at: new Date().toISOString()
            });
        }
      }
    } catch (error) {
      console.error('Error saving milestones:', error);
    }
  }, [user, supabase]);

  // Get subscriber growth history
  const getSubscriberGrowthHistory = useCallback(async (channelId: string, days: number = 30) => {
    if (!user || !channelId) return null;

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data, error } = await supabase
        .from('youtube_daily_stats')
        .select('date, subscriber_count, subscribers_gained, daily_views, videos_published')
        .eq('user_id', user.id)
        .eq('channel_id', channelId)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error getting growth history:', error);
      setError(error.message);
      return null;
    }
  }, [user, supabase]);

  // Get today's quota usage
  const getTodaysQuotaUsage = useCallback(async () => {
    if (!user) return null;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data } = await supabase
        .from('youtube_api_quota_usage')
        .select('quota_used, api_calls_made, last_call_timestamp')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      return data;
    } catch (error) {
      return null;
    }
  }, [user, supabase]);

  // Check if we should use cached data based on quota
  const shouldUseCachedData = useCallback(async (maxDailyQuota: number = 10000) => {
    const quotaUsage = await getTodaysQuotaUsage();
    if (!quotaUsage) return false;
    
    return Number(quotaUsage.quota_used) >= maxDailyQuota * 0.8; // Use cache when 80% quota used
  }, [getTodaysQuotaUsage]);

  return {
    saveDailyStats,
    trackAPIUsage,
    checkAndSaveMilestones,
    getSubscriberGrowthHistory,
    getTodaysQuotaUsage,
    shouldUseCachedData,
    saving,
    error
  };
};