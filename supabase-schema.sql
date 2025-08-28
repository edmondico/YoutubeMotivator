-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    channel_id TEXT,
    channel_name TEXT,
    api_key TEXT,
    level INTEGER DEFAULT 1,
    current_xp INTEGER DEFAULT 0,
    xp_to_next_level INTEGER DEFAULT 100,
    completed_tasks INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    total_videos_made INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_goals table
CREATE TABLE public.user_goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    daily_views_target INTEGER DEFAULT 1000,
    subscribers_target INTEGER DEFAULT 10000,
    subscribers_target_date TIMESTAMP WITH TIME ZONE,
    weekly_subscribers_target INTEGER DEFAULT 100,
    videos_per_week INTEGER DEFAULT 3,
    daily_tasks_target INTEGER DEFAULT 5,
    streak_target INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create app_config table
CREATE TABLE public.app_config (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    notifications_enabled BOOLEAN DEFAULT true,
    reminder_times TEXT[] DEFAULT ARRAY['09:00', '18:00'],
    task_reminders BOOLEAN DEFAULT true,
    youtube_reminders BOOLEAN DEFAULT true,
    primary_color TEXT DEFAULT '#3B82F6',
    dark_mode BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE public.tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    status TEXT CHECK (status IN ('pending', 'in-progress', 'completed')) DEFAULT 'pending',
    estimated_duration INTEGER NOT NULL, -- in minutes
    actual_duration INTEGER, -- in minutes
    due_date TIMESTAMP WITH TIME ZONE,
    scheduled_date TIMESTAMP WITH TIME ZONE,
    category TEXT CHECK (category IN ('video-creation', 'editing', 'research', 'marketing', 'other')) DEFAULT 'other',
    xp_reward INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create weekly_goals table
CREATE TABLE public.weekly_goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    target_videos INTEGER DEFAULT 3,
    current_videos INTEGER DEFAULT 0,
    xp_reward INTEGER DEFAULT 100,
    is_completed BOOLEAN DEFAULT false,
    week_start TIMESTAMP WITH TIME ZONE NOT NULL,
    week_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create youtube_stats table
CREATE TABLE public.youtube_stats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    channel_id TEXT NOT NULL,
    custom_url TEXT,
    subscriber_count INTEGER DEFAULT 0,
    last_video_date TIMESTAMP WITH TIME ZONE,
    days_since_last_video INTEGER DEFAULT 0,
    daily_sub_growth INTEGER DEFAULT 0,
    last_video_sub_growth INTEGER DEFAULT 0,
    total_views BIGINT DEFAULT 0,
    average_views_per_video INTEGER DEFAULT 0,
    weekly_sub_growth INTEGER DEFAULT 0,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create achievements table
CREATE TABLE public.achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    category TEXT CHECK (category IN ('tasks', 'youtube', 'general')) DEFAULT 'general',
    unlocked BOOLEAN DEFAULT false,
    unlocked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_tasks_scheduled_date ON public.tasks(scheduled_date);
CREATE INDEX idx_weekly_goals_user_id ON public.weekly_goals(user_id);
CREATE INDEX idx_weekly_goals_week ON public.weekly_goals(week_start, week_end);
CREATE INDEX idx_youtube_stats_user_id ON public.youtube_stats(user_id);
CREATE INDEX idx_youtube_stats_recorded_at ON public.youtube_stats(recorded_at);
CREATE INDEX idx_achievements_user_id ON public.achievements(user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.youtube_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- User profiles
CREATE POLICY "Users can view their own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- User goals
CREATE POLICY "Users can manage their own goals" ON public.user_goals
    FOR ALL USING (auth.uid() = user_id);

-- App config
CREATE POLICY "Users can manage their own config" ON public.app_config
    FOR ALL USING (auth.uid() = user_id);

-- Tasks
CREATE POLICY "Users can manage their own tasks" ON public.tasks
    FOR ALL USING (auth.uid() = user_id);

-- Weekly goals
CREATE POLICY "Users can manage their own weekly goals" ON public.weekly_goals
    FOR ALL USING (auth.uid() = user_id);

-- YouTube stats
CREATE POLICY "Users can manage their own YouTube stats" ON public.youtube_stats
    FOR ALL USING (auth.uid() = user_id);

-- Achievements
CREATE POLICY "Users can manage their own achievements" ON public.achievements
    FOR ALL USING (auth.uid() = user_id);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER trigger_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_user_goals_updated_at
    BEFORE UPDATE ON public.user_goals
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_app_config_updated_at
    BEFORE UPDATE ON public.app_config
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_weekly_goals_updated_at
    BEFORE UPDATE ON public.weekly_goals
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_youtube_stats_updated_at
    BEFORE UPDATE ON public.youtube_stats
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_achievements_updated_at
    BEFORE UPDATE ON public.achievements
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();