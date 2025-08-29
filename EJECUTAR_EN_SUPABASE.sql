-- ========================================
-- SCRIPT COMPLETO PARA POKEBIM MOTIVATOR
-- Ejecutar en Supabase Dashboard > SQL Editor
-- ========================================

-- PASO 1: Crear las tablas de historial de YouTube
-- ================================================

-- Create youtube_daily_stats table for historical data tracking
CREATE TABLE IF NOT EXISTS youtube_daily_stats (
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
CREATE TABLE IF NOT EXISTS youtube_video_performance (
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
CREATE TABLE IF NOT EXISTS youtube_api_quota_usage (
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
CREATE TABLE IF NOT EXISTS youtube_milestones (
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

-- PASO 2: Configurar Row Level Security (RLS)
-- ===========================================

-- Enable RLS on all new tables
ALTER TABLE youtube_daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_video_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_api_quota_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_milestones ENABLE ROW LEVEL SECURITY;

-- PASO 3: Crear políticas de RLS para youtube_daily_stats
-- ======================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own daily stats" ON youtube_daily_stats;
DROP POLICY IF EXISTS "Users can insert their own daily stats" ON youtube_daily_stats;
DROP POLICY IF EXISTS "Users can update their own daily stats" ON youtube_daily_stats;
DROP POLICY IF EXISTS "Users can delete their own daily stats" ON youtube_daily_stats;

-- Create new policies
CREATE POLICY "Users can view their own daily stats" ON youtube_daily_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily stats" ON youtube_daily_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily stats" ON youtube_daily_stats
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily stats" ON youtube_daily_stats
    FOR DELETE USING (auth.uid() = user_id);

-- PASO 4: Crear políticas de RLS para youtube_video_performance
-- ============================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own video performance" ON youtube_video_performance;
DROP POLICY IF EXISTS "Users can insert their own video performance" ON youtube_video_performance;
DROP POLICY IF EXISTS "Users can update their own video performance" ON youtube_video_performance;
DROP POLICY IF EXISTS "Users can delete their own video performance" ON youtube_video_performance;

-- Create new policies
CREATE POLICY "Users can view their own video performance" ON youtube_video_performance
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own video performance" ON youtube_video_performance
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own video performance" ON youtube_video_performance
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own video performance" ON youtube_video_performance
    FOR DELETE USING (auth.uid() = user_id);

-- PASO 5: Crear políticas de RLS para youtube_api_quota_usage
-- ==========================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own quota usage" ON youtube_api_quota_usage;
DROP POLICY IF EXISTS "Users can insert their own quota usage" ON youtube_api_quota_usage;
DROP POLICY IF EXISTS "Users can update their own quota usage" ON youtube_api_quota_usage;
DROP POLICY IF EXISTS "Users can delete their own quota usage" ON youtube_api_quota_usage;

-- Create new policies
CREATE POLICY "Users can view their own quota usage" ON youtube_api_quota_usage
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quota usage" ON youtube_api_quota_usage
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quota usage" ON youtube_api_quota_usage
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quota usage" ON youtube_api_quota_usage
    FOR DELETE USING (auth.uid() = user_id);

-- PASO 6: Crear políticas de RLS para youtube_milestones
-- ======================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own milestones" ON youtube_milestones;
DROP POLICY IF EXISTS "Users can insert their own milestones" ON youtube_milestones;
DROP POLICY IF EXISTS "Users can update their own milestones" ON youtube_milestones;
DROP POLICY IF EXISTS "Users can delete their own milestones" ON youtube_milestones;

-- Create new policies
CREATE POLICY "Users can view their own milestones" ON youtube_milestones
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own milestones" ON youtube_milestones
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own milestones" ON youtube_milestones
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own milestones" ON youtube_milestones
    FOR DELETE USING (auth.uid() = user_id);

-- PASO 7: Crear índices para optimizar performance
-- ================================================

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_youtube_daily_stats_user_channel_date ON youtube_daily_stats(user_id, channel_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_youtube_video_performance_user_video_date ON youtube_video_performance(user_id, video_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_youtube_api_quota_usage_user_date ON youtube_api_quota_usage(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_youtube_milestones_user_channel ON youtube_milestones(user_id, channel_id, achieved_at DESC);

-- PASO 8: Crear triggers para actualizar updated_at automáticamente
-- =================================================================

-- Create updated_at triggers using the existing handle_updated_at function
-- Note: This assumes public.handle_updated_at() function already exists from previous migrations

DO $$
BEGIN
    -- Check if trigger exists before creating
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_youtube_daily_stats_updated_at') THEN
        CREATE TRIGGER update_youtube_daily_stats_updated_at 
            BEFORE UPDATE ON youtube_daily_stats
            FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_youtube_video_performance_updated_at') THEN
        CREATE TRIGGER update_youtube_video_performance_updated_at 
            BEFORE UPDATE ON youtube_video_performance
            FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_youtube_api_quota_usage_updated_at') THEN
        CREATE TRIGGER update_youtube_api_quota_usage_updated_at 
            BEFORE UPDATE ON youtube_api_quota_usage
            FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_youtube_milestones_updated_at') THEN
        CREATE TRIGGER update_youtube_milestones_updated_at 
            BEFORE UPDATE ON youtube_milestones
            FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    END IF;
END $$;

-- PASO 9: Verificar que todo se creó correctamente
-- ================================================

-- Verificar que las tablas se crearon
SELECT 
    schemaname, 
    tablename, 
    tableowner 
FROM pg_tables 
WHERE tablename IN (
    'youtube_daily_stats', 
    'youtube_video_performance', 
    'youtube_api_quota_usage', 
    'youtube_milestones'
) 
ORDER BY tablename;

-- Verificar que los índices se crearon
SELECT 
    indexname, 
    tablename 
FROM pg_indexes 
WHERE tablename IN (
    'youtube_daily_stats', 
    'youtube_video_performance', 
    'youtube_api_quota_usage', 
    'youtube_milestones'
) 
ORDER BY tablename, indexname;

-- FINAL: Mensaje de confirmación
-- ==============================
SELECT 'PokeBim Motivator: Sistema de persistencia de datos YouTube instalado correctamente! ✅' AS status;