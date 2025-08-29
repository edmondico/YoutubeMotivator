-- Create youtube_daily_stats table for historical data tracking
CREATE TABLE youtube_daily_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id VARCHAR NOT NULL,
  date DATE NOT NULL,
  subscriber_count BIGINT DEFAULT 0,
  video_count BIGINT DEFAULT 0,
  total_views BIGINT DEFAULT 0,
  subscribers_gained INTEGER DEFAULT 0,
  subscribers_lost INTEGER DEFAULT 0,
  daily_views BIGINT DEFAULT 0,
  videos_published INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, channel_id, date)
);

-- Create youtube_video_performance table for detailed video tracking
CREATE TABLE youtube_video_performance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id VARCHAR NOT NULL,
  video_id VARCHAR NOT NULL,
  date DATE NOT NULL,
  view_count BIGINT DEFAULT 0,
  like_count BIGINT DEFAULT 0,
  comment_count BIGINT DEFAULT 0,
  estimated_minutes_watched BIGINT DEFAULT 0,
  subscribers_gained_from_video INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, video_id, date)
);

-- Create youtube_api_quota_usage table to track API usage
CREATE TABLE youtube_api_quota_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  quota_used INTEGER DEFAULT 0,
  api_calls_made INTEGER DEFAULT 0,
  last_call_timestamp TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, date)
);

-- Create youtube_milestones table to track subscriber milestones
CREATE TABLE youtube_milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id VARCHAR NOT NULL,
  milestone_type VARCHAR NOT NULL CHECK (milestone_type IN ('subscribers', 'videos', 'views')),
  milestone_value BIGINT NOT NULL,
  achieved_at TIMESTAMP WITH TIME ZONE NOT NULL,
  previous_value BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, channel_id, milestone_type, milestone_value)
);

-- Enable RLS on all new tables
ALTER TABLE youtube_daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_video_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_api_quota_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_milestones ENABLE ROW LEVEL SECURITY;

-- RLS Policies for youtube_daily_stats
CREATE POLICY "Users can view their own daily stats" ON youtube_daily_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily stats" ON youtube_daily_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily stats" ON youtube_daily_stats
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily stats" ON youtube_daily_stats
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for youtube_video_performance
CREATE POLICY "Users can view their own video performance" ON youtube_video_performance
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own video performance" ON youtube_video_performance
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own video performance" ON youtube_video_performance
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own video performance" ON youtube_video_performance
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for youtube_api_quota_usage
CREATE POLICY "Users can view their own quota usage" ON youtube_api_quota_usage
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quota usage" ON youtube_api_quota_usage
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quota usage" ON youtube_api_quota_usage
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quota usage" ON youtube_api_quota_usage
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for youtube_milestones
CREATE POLICY "Users can view their own milestones" ON youtube_milestones
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own milestones" ON youtube_milestones
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own milestones" ON youtube_milestones
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own milestones" ON youtube_milestones
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_youtube_daily_stats_user_channel_date ON youtube_daily_stats(user_id, channel_id, date DESC);
CREATE INDEX idx_youtube_video_performance_user_video_date ON youtube_video_performance(user_id, video_id, date DESC);
CREATE INDEX idx_youtube_api_quota_usage_user_date ON youtube_api_quota_usage(user_id, date DESC);
CREATE INDEX idx_youtube_milestones_user_channel ON youtube_milestones(user_id, channel_id, achieved_at DESC);

-- Create updated_at triggers using the existing function
CREATE TRIGGER update_youtube_daily_stats_updated_at 
    BEFORE UPDATE ON youtube_daily_stats
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_youtube_video_performance_updated_at 
    BEFORE UPDATE ON youtube_video_performance
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_youtube_api_quota_usage_updated_at 
    BEFORE UPDATE ON youtube_api_quota_usage
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_youtube_milestones_updated_at 
    BEFORE UPDATE ON youtube_milestones
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();