-- Complete Database Fix for EdLingo
-- Run this in Supabase SQL Editor
-- This will fix foreign key constraints and create the default user properly

-- Step 1: Clean up any invalid records
DELETE FROM user_progress WHERE user_id IS NULL;

-- Step 2: Check if users table exists and create default user
-- This will create the user in the users table if it exists
-- If users table doesn't exist, this will fail silently
DO $$
BEGIN
    -- Try to insert into users table
    INSERT INTO users (id, email, username, created_at, updated_at)
    VALUES (
        '00000000-0000-0000-0000-000000000000',
        'default@edlingo.app',
        'default_user',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;
EXCEPTION
    WHEN undefined_table THEN
        -- Users table doesn't exist, that's okay
        RAISE NOTICE 'Users table does not exist, skipping user creation';
    WHEN OTHERS THEN
        -- Other error, log it but continue
        RAISE NOTICE 'Error creating user: %', SQLERRM;
END$$;

-- Step 3: Ensure user_progress table has all required columns
-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Add daily_progress column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_progress' AND column_name = 'daily_progress') THEN
        ALTER TABLE user_progress ADD COLUMN daily_progress INTEGER DEFAULT 0;
    END IF;
    
    -- Add daily_goal column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_progress' AND column_name = 'daily_goal') THEN
        ALTER TABLE user_progress ADD COLUMN daily_goal INTEGER DEFAULT 50;
    END IF;
    
    -- Add current_streak column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_progress' AND column_name = 'current_streak') THEN
        ALTER TABLE user_progress ADD COLUMN current_streak INTEGER DEFAULT 0;
    END IF;
    
    -- Add longest_streak column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_progress' AND column_name = 'longest_streak') THEN
        ALTER TABLE user_progress ADD COLUMN longest_streak INTEGER DEFAULT 0;
    END IF;
    
    -- Add lessons_completed column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_progress' AND column_name = 'lessons_completed') THEN
        ALTER TABLE user_progress ADD COLUMN lessons_completed INTEGER DEFAULT 0;
    END IF;
    
    -- Add lastStudyDate column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_progress' AND column_name = 'lastStudyDate') THEN
        ALTER TABLE user_progress ADD COLUMN "lastStudyDate" TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add total_xp column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_progress' AND column_name = 'total_xp') THEN
        ALTER TABLE user_progress ADD COLUMN total_xp INTEGER DEFAULT 0;
    END IF;
END$$;

-- Step 3.5: Create user_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_settings (
    user_id UUID PRIMARY KEY,
    theme VARCHAR(20) DEFAULT 'light',
    language VARCHAR(10) DEFAULT 'en',
    notifications BOOLEAN DEFAULT true,
    sound_effects BOOLEAN DEFAULT true,
    daily_reminder BOOLEAN DEFAULT true,
    reminder_time TIME DEFAULT '09:00:00',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Update existing records to have default values for new columns
UPDATE user_progress SET 
    daily_progress = COALESCE(daily_progress, 0),
    daily_goal = COALESCE(daily_goal, 50),
    current_streak = COALESCE(current_streak, 0),
    longest_streak = COALESCE(longest_streak, 0),
    lessons_completed = COALESCE(lessons_completed, 0),
    updated_at = NOW()
WHERE daily_progress IS NULL 
   OR daily_goal IS NULL 
   OR current_streak IS NULL 
   OR longest_streak IS NULL 
   OR lessons_completed IS NULL;

-- Step 5: Create or update the default user progress
-- This uses UPSERT to either insert or update
INSERT INTO user_progress (
    user_id, 
    total_xp, 
    current_streak, 
    longest_streak,
    lessons_completed, 
    daily_goal, 
    daily_progress,
    created_at, 
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    0,
    0,
    0,
    0,
    50,
    0,
    NOW(),
    NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
    daily_goal = COALESCE(user_progress.daily_goal, 50),
    daily_progress = COALESCE(user_progress.daily_progress, 0),
    current_streak = COALESCE(user_progress.current_streak, 0),
    longest_streak = COALESCE(user_progress.longest_streak, 0),
    lessons_completed = COALESCE(user_progress.lessons_completed, 0),
    updated_at = NOW();

-- Step 6: Verify the setup
SELECT 
    'Database setup verification' as status,
    user_id,
    total_xp,
    current_streak,
    longest_streak,
    lessons_completed,
    daily_goal,
    daily_progress,
    created_at,
    updated_at
FROM user_progress 
WHERE user_id = '00000000-0000-0000-0000-000000000000';

-- Step 7: Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_progress'
ORDER BY ordinal_position;

-- Success message
SELECT 'Database fix completed successfully! Default user created/updated.' as result;