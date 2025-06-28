-- EdLingo Language Learning App Database Schema
-- This schema defines all tables needed for user progress, vocabulary, grammar lessons, chat history, and settings

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
-- Note: JWT secret is configured in Supabase dashboard, not via SQL

-- User Progress Table
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    current_level VARCHAR(10) DEFAULT 'beginner',
    total_xp INTEGER DEFAULT 0,
    daily_streak INTEGER DEFAULT 0,
    last_activity_date DATE DEFAULT CURRENT_DATE,
    lessons_completed INTEGER DEFAULT 0,
    vocabulary_learned INTEGER DEFAULT 0,
    grammar_mastered INTEGER DEFAULT 0,
    speaking_practice_minutes INTEGER DEFAULT 0,
    listening_practice_minutes INTEGER DEFAULT 0,
    reading_practice_minutes INTEGER DEFAULT 0,
    writing_practice_minutes INTEGER DEFAULT 0,
    achievements JSONB DEFAULT '[]'::jsonb,
    weekly_goals JSONB DEFAULT '{"lessons": 5, "vocabulary": 20, "practice_minutes": 60}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Vocabulary Table
CREATE TABLE IF NOT EXISTS vocabulary (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    word VARCHAR(255) NOT NULL,
    translation VARCHAR(255) NOT NULL,
    pronunciation VARCHAR(255),
    part_of_speech VARCHAR(50),
    level VARCHAR(10) DEFAULT 'beginner',
    category VARCHAR(100),
    example_sentence TEXT,
    example_translation TEXT,
    audio_url TEXT,
    image_url TEXT,
    difficulty_score INTEGER DEFAULT 1 CHECK (difficulty_score >= 1 AND difficulty_score <= 5),
    frequency_rank INTEGER,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Vocabulary Progress (tracks individual word learning)
CREATE TABLE IF NOT EXISTS user_vocabulary_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    vocabulary_id UUID REFERENCES vocabulary(id) ON DELETE CASCADE,
    mastery_level INTEGER DEFAULT 0 CHECK (mastery_level >= 0 AND mastery_level <= 5),
    times_reviewed INTEGER DEFAULT 0,
    times_correct INTEGER DEFAULT 0,
    last_reviewed TIMESTAMP WITH TIME ZONE,
    next_review TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, vocabulary_id)
);

-- Grammar Lessons Table
CREATE TABLE IF NOT EXISTS grammar_lessons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    level VARCHAR(10) DEFAULT 'beginner',
    lesson_order INTEGER NOT NULL,
    content JSONB NOT NULL, -- Stores lesson content, examples, exercises
    estimated_duration INTEGER DEFAULT 15, -- in minutes
    prerequisites UUID[], -- Array of lesson IDs that should be completed first
    learning_objectives TEXT[],
    tags TEXT[],
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Grammar Progress
CREATE TABLE IF NOT EXISTS user_grammar_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES grammar_lessons(id) ON DELETE CASCADE,
    completion_status VARCHAR(20) DEFAULT 'not_started' CHECK (completion_status IN ('not_started', 'in_progress', 'completed', 'mastered')),
    score INTEGER CHECK (score >= 0 AND score <= 100),
    time_spent INTEGER DEFAULT 0, -- in minutes
    attempts INTEGER DEFAULT 0,
    last_attempt TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- Chat History Table
CREATE TABLE IF NOT EXISTS chat_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID DEFAULT uuid_generate_v4(),
    message_type VARCHAR(20) NOT NULL CHECK (message_type IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb, -- For storing additional data like corrections, suggestions
    language_detected VARCHAR(10),
    confidence_score FLOAT CHECK (confidence_score >= 0 AND confidence_score <= 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    target_language VARCHAR(10) DEFAULT 'spanish',
    native_language VARCHAR(10) DEFAULT 'english',
    difficulty_preference VARCHAR(20) DEFAULT 'adaptive',
    daily_goal_minutes INTEGER DEFAULT 30,
    notification_preferences JSONB DEFAULT '{"daily_reminder": true, "streak_reminder": true, "achievement_alerts": true}'::jsonb,
    theme VARCHAR(20) DEFAULT 'light',
    font_size VARCHAR(10) DEFAULT 'medium',
    audio_enabled BOOLEAN DEFAULT true,
    auto_play_audio BOOLEAN DEFAULT false,
    speech_rate FLOAT DEFAULT 1.0 CHECK (speech_rate >= 0.5 AND speech_rate <= 2.0),
    practice_preferences JSONB DEFAULT '{"vocabulary": true, "grammar": true, "speaking": true, "listening": true}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Learning Sessions Table (tracks individual study sessions)
CREATE TABLE IF NOT EXISTS learning_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_type VARCHAR(50) NOT NULL, -- 'vocabulary', 'grammar', 'conversation', 'mixed'
    duration_minutes INTEGER NOT NULL,
    xp_earned INTEGER DEFAULT 0,
    activities_completed INTEGER DEFAULT 0,
    accuracy_percentage FLOAT CHECK (accuracy_percentage >= 0 AND accuracy_percentage <= 100),
    session_data JSONB DEFAULT '{}'::jsonb, -- Detailed session metrics
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Achievements Table
CREATE TABLE IF NOT EXISTS achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon VARCHAR(255),
    category VARCHAR(50), -- 'streak', 'vocabulary', 'grammar', 'practice', 'social'
    criteria JSONB NOT NULL, -- Conditions for earning the achievement
    xp_reward INTEGER DEFAULT 0,
    rarity VARCHAR(20) DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Achievements (junction table)
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_level ON vocabulary(level);
CREATE INDEX IF NOT EXISTS idx_vocabulary_category ON vocabulary(category);
CREATE INDEX IF NOT EXISTS idx_user_vocabulary_progress_user_id ON user_vocabulary_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_vocabulary_progress_next_review ON user_vocabulary_progress(next_review);
CREATE INDEX IF NOT EXISTS idx_grammar_lessons_level ON grammar_lessons(level);
CREATE INDEX IF NOT EXISTS idx_grammar_lessons_order ON grammar_lessons(lesson_order);
CREATE INDEX IF NOT EXISTS idx_user_grammar_progress_user_id ON user_grammar_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_session_id ON chat_history(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON chat_history(created_at);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_user_id ON learning_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_started_at ON learning_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);

-- Row Level Security (RLS) Policies
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_vocabulary_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_grammar_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_progress
CREATE POLICY "Users can view own progress" ON user_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON user_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON user_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_vocabulary_progress
CREATE POLICY "Users can view own vocabulary progress" ON user_vocabulary_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own vocabulary progress" ON user_vocabulary_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vocabulary progress" ON user_vocabulary_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_grammar_progress
CREATE POLICY "Users can view own grammar progress" ON user_grammar_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own grammar progress" ON user_grammar_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own grammar progress" ON user_grammar_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for chat_history
CREATE POLICY "Users can view own chat history" ON chat_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat messages" ON chat_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat history" ON chat_history
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_settings
CREATE POLICY "Users can view own settings" ON user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for learning_sessions
CREATE POLICY "Users can view own learning sessions" ON learning_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own learning sessions" ON learning_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view own achievements" ON user_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON user_achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public read access for vocabulary, grammar_lessons, and achievements
CREATE POLICY "Public read access for vocabulary" ON vocabulary
    FOR SELECT USING (true);

CREATE POLICY "Public read access for grammar lessons" ON grammar_lessons
    FOR SELECT USING (is_published = true);

CREATE POLICY "Public read access for achievements" ON achievements
    FOR SELECT USING (is_active = true);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vocabulary_updated_at BEFORE UPDATE ON vocabulary
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_vocabulary_progress_updated_at BEFORE UPDATE ON user_vocabulary_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grammar_lessons_updated_at BEFORE UPDATE ON grammar_lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_grammar_progress_updated_at BEFORE UPDATE ON user_grammar_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate XP based on activity
CREATE OR REPLACE FUNCTION calculate_xp_reward(
    activity_type VARCHAR,
    difficulty INTEGER DEFAULT 1,
    accuracy FLOAT DEFAULT 1.0
)
RETURNS INTEGER AS $$
BEGIN
    CASE activity_type
        WHEN 'vocabulary_learned' THEN
            RETURN FLOOR(10 * difficulty * accuracy);
        WHEN 'grammar_completed' THEN
            RETURN FLOOR(20 * difficulty * accuracy);
        WHEN 'conversation_practice' THEN
            RETURN FLOOR(15 * accuracy);
        WHEN 'daily_streak' THEN
            RETURN 5;
        ELSE
            RETURN 1;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to update user progress after activities
CREATE OR REPLACE FUNCTION update_user_progress_after_activity()
RETURNS TRIGGER AS $$
DECLARE
    xp_reward INTEGER;
BEGIN
    -- Calculate XP reward based on the activity
    IF TG_TABLE_NAME = 'user_vocabulary_progress' AND NEW.mastery_level > OLD.mastery_level THEN
        xp_reward := calculate_xp_reward('vocabulary_learned', NEW.mastery_level, 1.0);
        
        UPDATE user_progress 
        SET 
            total_xp = total_xp + xp_reward,
            vocabulary_learned = vocabulary_learned + 1,
            last_activity_date = CURRENT_DATE,
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
        
    ELSIF TG_TABLE_NAME = 'user_grammar_progress' AND NEW.completion_status = 'completed' AND OLD.completion_status != 'completed' THEN
        xp_reward := calculate_xp_reward('grammar_completed', 1, COALESCE(NEW.score, 100) / 100.0);
        
        UPDATE user_progress 
        SET 
            total_xp = total_xp + xp_reward,
            lessons_completed = lessons_completed + 1,
            grammar_mastered = grammar_mastered + 1,
            last_activity_date = CURRENT_DATE,
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic progress updates
CREATE TRIGGER update_progress_after_vocabulary AFTER UPDATE ON user_vocabulary_progress
    FOR EACH ROW EXECUTE FUNCTION update_user_progress_after_activity();

CREATE TRIGGER update_progress_after_grammar AFTER UPDATE ON user_grammar_progress
    FOR EACH ROW EXECUTE FUNCTION update_user_progress_after_activity();

-- Insert some sample data for testing
INSERT INTO vocabulary (word, translation, pronunciation, part_of_speech, level, category, example_sentence, example_translation) VALUES
('hola', 'hello', 'OH-lah', 'interjection', 'beginner', 'greetings', 'Hola, ¿cómo estás?', 'Hello, how are you?'),
('gracias', 'thank you', 'GRAH-see-ahs', 'interjection', 'beginner', 'politeness', 'Gracias por tu ayuda.', 'Thank you for your help.'),
('agua', 'water', 'AH-gwah', 'noun', 'beginner', 'food_drink', 'Necesito un vaso de agua.', 'I need a glass of water.'),
('casa', 'house', 'KAH-sah', 'noun', 'beginner', 'home', 'Mi casa es grande.', 'My house is big.'),
('comer', 'to eat', 'koh-MEHR', 'verb', 'beginner', 'actions', 'Me gusta comer pizza.', 'I like to eat pizza.')
ON CONFLICT DO NOTHING;

INSERT INTO grammar_lessons (title, description, level, lesson_order, content) VALUES
('Basic Greetings', 'Learn how to greet people in Spanish', 'beginner', 1, '{"sections": [{"title": "Common Greetings", "content": "Hola - Hello\nBuenos días - Good morning\nBuenas tardes - Good afternoon\nBuenas noches - Good evening/night"}], "exercises": [{"type": "multiple_choice", "question": "How do you say hello in Spanish?", "options": ["Hola", "Adiós", "Gracias", "Por favor"], "correct": 0}]}'),
('Present Tense - Ser vs Estar', 'Understanding the difference between ser and estar', 'beginner', 2, '{"sections": [{"title": "Ser vs Estar", "content": "Both ser and estar mean to be, but they are used differently:\nSer: permanent characteristics\nEstar: temporary states and locations"}], "exercises": [{"type": "fill_blank", "question": "Yo ___ estudiante. (I am a student)", "answer": "soy"}]}')
ON CONFLICT DO NOTHING;

INSERT INTO achievements (name, description, icon, category, criteria, xp_reward, rarity) VALUES
('First Steps', 'Complete your first lesson', '🎯', 'progress', '{"lessons_completed": 1}', 50, 'common'),
('Vocabulary Master', 'Learn 50 new words', '📚', 'vocabulary', '{"vocabulary_learned": 50}', 200, 'rare'),
('Week Warrior', 'Maintain a 7-day streak', '🔥', 'streak', '{"daily_streak": 7}', 150, 'rare'),
('Grammar Guru', 'Complete 10 grammar lessons', '📖', 'grammar', '{"grammar_mastered": 10}', 300, 'epic')
ON CONFLICT DO NOTHING;