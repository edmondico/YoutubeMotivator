-- Create youtube_channel_cache table
CREATE TABLE youtube_channel_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id VARCHAR NOT NULL,
  channel_name VARCHAR,
  subscriber_count BIGINT DEFAULT 0,
  video_count BIGINT DEFAULT 0,
  view_count BIGINT DEFAULT 0,
  custom_url VARCHAR,
  thumbnail_url TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, channel_id)
);

-- Create youtube_videos_cache table
CREATE TABLE youtube_videos_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id VARCHAR NOT NULL,
  video_id VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  description TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  view_count BIGINT DEFAULT 0,
  like_count BIGINT DEFAULT 0,
  comment_count BIGINT DEFAULT 0,
  duration VARCHAR,
  thumbnail_url TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, video_id)
);

-- Create youtube_analytics_cache table
CREATE TABLE youtube_analytics_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id VARCHAR NOT NULL,
  date DATE NOT NULL,
  views BIGINT DEFAULT 0,
  subscribers_gained INTEGER DEFAULT 0,
  subscribers_lost INTEGER DEFAULT 0,
  watch_time_minutes BIGINT DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, channel_id, date)
);

-- Enable RLS on all tables
ALTER TABLE youtube_channel_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_videos_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_analytics_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies for youtube_channel_cache
CREATE POLICY "Users can view their own channel cache" ON youtube_channel_cache
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own channel cache" ON youtube_channel_cache
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own channel cache" ON youtube_channel_cache
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own channel cache" ON youtube_channel_cache
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for youtube_videos_cache
CREATE POLICY "Users can view their own videos cache" ON youtube_videos_cache
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own videos cache" ON youtube_videos_cache
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own videos cache" ON youtube_videos_cache
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own videos cache" ON youtube_videos_cache
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for youtube_analytics_cache
CREATE POLICY "Users can view their own analytics cache" ON youtube_analytics_cache
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics cache" ON youtube_analytics_cache
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analytics cache" ON youtube_analytics_cache
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analytics cache" ON youtube_analytics_cache
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_youtube_channel_cache_user_id ON youtube_channel_cache(user_id);
CREATE INDEX idx_youtube_videos_cache_user_id ON youtube_videos_cache(user_id);
CREATE INDEX idx_youtube_videos_cache_published_at ON youtube_videos_cache(published_at DESC);
CREATE INDEX idx_youtube_analytics_cache_user_id ON youtube_analytics_cache(user_id);
CREATE INDEX idx_youtube_analytics_cache_date ON youtube_analytics_cache(date DESC);

-- Create updated_at triggers
CREATE TRIGGER update_youtube_channel_cache_updated_at BEFORE UPDATE ON youtube_channel_cache
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_youtube_videos_cache_updated_at BEFORE UPDATE ON youtube_videos_cache
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_youtube_analytics_cache_updated_at BEFORE UPDATE ON youtube_analytics_cache
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();