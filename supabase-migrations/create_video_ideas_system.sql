-- ========================================
-- SISTEMA DE BANCO DE IDEAS PARA VIDEOS
-- ========================================

-- Create idea_groups table for customizable groups
CREATE TABLE IF NOT EXISTS idea_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color for the group
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, name)
);

-- Create video_ideas table
CREATE TABLE IF NOT EXISTS video_ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id UUID REFERENCES idea_groups(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  score INTEGER DEFAULT 5 CHECK (score >= 1 AND score <= 10), -- 1 (worst) to 10 (best)
  tags TEXT[], -- Array of tags like ['pokemon', 'cards', 'review']
  notes TEXT, -- Additional notes or script ideas
  status VARCHAR(20) DEFAULT 'idea' CHECK (status IN ('idea', 'scripting', 'filming', 'editing', 'uploaded')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  estimated_duration INTEGER, -- Estimated video duration in minutes
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE -- When video was actually uploaded
);

-- Enable RLS on new tables
ALTER TABLE idea_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_ideas ENABLE ROW LEVEL SECURITY;

-- RLS Policies for idea_groups
CREATE POLICY "Users can view their own idea groups" ON idea_groups
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own idea groups" ON idea_groups
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own idea groups" ON idea_groups
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own idea groups" ON idea_groups
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for video_ideas  
CREATE POLICY "Users can view their own video ideas" ON video_ideas
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own video ideas" ON video_ideas
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own video ideas" ON video_ideas
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own video ideas" ON video_ideas
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_idea_groups_user_sort ON idea_groups(user_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_video_ideas_user_group ON video_ideas(user_id, group_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_video_ideas_score ON video_ideas(user_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_video_ideas_status ON video_ideas(user_id, status);

-- Create updated_at triggers
CREATE TRIGGER update_idea_groups_updated_at 
    BEFORE UPDATE ON idea_groups
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_video_ideas_updated_at 
    BEFORE UPDATE ON video_ideas
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert default groups for new users
-- Note: This will be done programmatically for the current user
-- INSERT INTO idea_groups (user_id, name, description, color, sort_order) VALUES
-- (auth.uid(), 'Bangers', 'Ideas que van a ser éxito seguro', '#10B981', 1),
-- (auth.uid(), 'Buenos', 'Ideas sólidas, buen potencial', '#3B82F6', 2), 
-- (auth.uid(), 'Mid', 'Ideas normales, para rellenar', '#6B7280', 3);

-- Verification queries
SELECT 'Video Ideas System: Tablas creadas correctamente! ✅' AS status;

-- Show created tables
SELECT 
    schemaname, 
    tablename, 
    tableowner 
FROM pg_tables 
WHERE tablename IN ('idea_groups', 'video_ideas') 
ORDER BY tablename;