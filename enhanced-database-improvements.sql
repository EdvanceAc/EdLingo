-- Enhanced Database Improvements for EdLingo
-- Additional optimizations and best practices
-- Run this AFTER complete-database-fix.sql

-- Enable better error reporting
SET client_min_messages = NOTICE;

-- Step 1: Add data validation constraints to user_progress
DO $$
BEGIN
    -- Add check constraints for positive values
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'user_progress_positive_values'
    ) THEN
        ALTER TABLE user_progress 
        ADD CONSTRAINT user_progress_positive_values 
        CHECK (
            total_xp >= 0 AND 
            current_streak >= 0 AND 
            longest_streak >= 0 AND 
            lessons_completed >= 0 AND 
            daily_goal > 0 AND 
            daily_progress >= 0
        );
        RAISE NOTICE 'Added positive values constraint to user_progress';
    END IF;
    
    -- Add logical constraint: current_streak <= longest_streak
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'user_progress_streak_logic'
    ) THEN
        ALTER TABLE user_progress 
        ADD CONSTRAINT user_progress_streak_logic 
        CHECK (current_streak <= longest_streak);
        RAISE NOTICE 'Added streak logic constraint to user_progress';
    END IF;
    
    -- Add constraint: daily_progress <= daily_goal (reasonable assumption)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'user_progress_daily_logic'
    ) THEN
        ALTER TABLE user_progress 
        ADD CONSTRAINT user_progress_daily_logic 
        CHECK (daily_progress <= daily_goal * 2); -- Allow some flexibility
        RAISE NOTICE 'Added daily progress constraint to user_progress';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error adding constraints: %', SQLERRM;
END$$;

-- Step 2: Create audit trigger for user_progress updates
CREATE OR REPLACE FUNCTION update_user_progress_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    
    -- Auto-update longest_streak if current_streak is higher
    IF NEW.current_streak > NEW.longest_streak THEN
        NEW.longest_streak = NEW.current_streak;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'user_progress_update_trigger'
    ) THEN
        CREATE TRIGGER user_progress_update_trigger
            BEFORE UPDATE ON user_progress
            FOR EACH ROW
            EXECUTE FUNCTION update_user_progress_timestamp();
        RAISE NOTICE 'Created update trigger for user_progress';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating trigger: %', SQLERRM;
END$$;

-- Step 3: Create similar trigger for user_settings
CREATE OR REPLACE FUNCTION update_user_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'user_settings_update_trigger'
    ) THEN
        CREATE TRIGGER user_settings_update_trigger
            BEFORE UPDATE ON user_settings
            FOR EACH ROW
            EXECUTE FUNCTION update_user_settings_timestamp();
        RAISE NOTICE 'Created update trigger for user_settings';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating user_settings trigger: %', SQLERRM;
END$$;

-- Step 4: Add composite indexes for common query patterns
DO $$
BEGIN
    -- Index for leaderboard queries (total_xp DESC)
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_progress_leaderboard') THEN
        CREATE INDEX idx_user_progress_leaderboard ON user_progress(total_xp DESC, current_streak DESC);
        RAISE NOTICE 'Created leaderboard index';
    END IF;
    
    -- Index for streak calculations
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_progress_streaks') THEN
        CREATE INDEX idx_user_progress_streaks ON user_progress(current_streak, longest_streak);
        RAISE NOTICE 'Created streaks index';
    END IF;
    
    -- Index for daily goal tracking
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_progress_daily') THEN
        CREATE INDEX idx_user_progress_daily ON user_progress(daily_progress, daily_goal, "lastStudyDate");
        RAISE NOTICE 'Created daily progress index';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating composite indexes: %', SQLERRM;
END$$;

-- Step 5: Create helpful views for common queries (with error handling)
DO $$
BEGIN
    -- Check if user_progress table exists and has required columns
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_progress') THEN
        -- Check if all required columns exist
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'user_progress' 
            AND column_name IN ('user_id', 'total_xp', 'current_streak', 'longest_streak', 
                               'lessons_completed', 'daily_goal', 'daily_progress', 
                               'lastStudyDate', 'created_at', 'updated_at')
            GROUP BY table_name
            HAVING COUNT(*) = 10
        ) THEN
            -- Create the view
            EXECUTE '
            CREATE OR REPLACE VIEW user_progress_summary AS
            SELECT 
                user_id,
                total_xp,
                current_streak,
                longest_streak,
                lessons_completed,
                daily_goal,
                daily_progress,
                ROUND((daily_progress::DECIMAL / NULLIF(daily_goal, 0)) * 100, 2) as daily_completion_percentage,
                CASE 
                    WHEN daily_progress >= daily_goal THEN ''Goal Met''
                    WHEN daily_progress >= daily_goal * 0.8 THEN ''Almost There''
                    WHEN daily_progress >= daily_goal * 0.5 THEN ''Halfway''
                    ELSE ''Getting Started''
                END as daily_status,
                "lastStudyDate",
                CASE 
                    WHEN "lastStudyDate"::DATE = CURRENT_DATE THEN ''Today''
                    WHEN "lastStudyDate"::DATE = CURRENT_DATE - INTERVAL ''1 day'' THEN ''Yesterday''
                    ELSE EXTRACT(DAY FROM CURRENT_DATE - "lastStudyDate"::DATE) || '' days ago''
                END as last_study_relative,
                created_at,
                updated_at
            FROM user_progress';
            RAISE NOTICE 'Created user_progress_summary view';
        ELSE
            RAISE NOTICE 'Cannot create view: user_progress table missing required columns';
        END IF;
    ELSE
        RAISE NOTICE 'Cannot create view: user_progress table does not exist';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating user_progress_summary view: %', SQLERRM;
END$$;

-- Step 6: Create function to safely update user progress (with table existence check)
DO $$
BEGIN
    -- Only create function if user_progress table exists with required columns
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_progress') THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'user_progress' 
            AND column_name IN ('user_id', 'total_xp', 'current_streak', 'longest_streak', 
                               'lessons_completed', 'daily_goal', 'daily_progress', 
                               'lastStudyDate', 'updated_at')
            GROUP BY table_name
            HAVING COUNT(*) = 9
        ) THEN
            EXECUTE '
            CREATE OR REPLACE FUNCTION update_user_progress_safe(
                p_user_id UUID,
                p_xp_gained INTEGER DEFAULT 0,
                p_lessons_increment INTEGER DEFAULT 0,
                p_daily_progress_increment INTEGER DEFAULT 0
            )
            RETURNS BOOLEAN AS $func$
            DECLARE
                current_date_only DATE := CURRENT_DATE;
                last_study_date_only DATE;
                new_streak INTEGER;
            BEGIN
                -- Check if user exists
                IF NOT EXISTS (SELECT 1 FROM user_progress WHERE user_id = p_user_id) THEN
                    RAISE NOTICE ''User % does not exist in user_progress'', p_user_id;
                    RETURN FALSE;
                END IF;
                
                -- Get current last study date
                SELECT "lastStudyDate"::DATE INTO last_study_date_only
                FROM user_progress 
                WHERE user_id = p_user_id;
                
                -- Calculate new streak
                IF last_study_date_only = current_date_only THEN
                    -- Same day, keep current streak
                    SELECT current_streak INTO new_streak FROM user_progress WHERE user_id = p_user_id;
                ELSIF last_study_date_only = current_date_only - INTERVAL ''1 day'' THEN
                    -- Consecutive day, increment streak
                    SELECT current_streak + 1 INTO new_streak FROM user_progress WHERE user_id = p_user_id;
                ELSE
                    -- Streak broken, reset to 1
                    new_streak := 1;
                END IF;
                
                -- Update the record
                UPDATE user_progress SET
                    total_xp = total_xp + p_xp_gained,
                    lessons_completed = lessons_completed + p_lessons_increment,
                    daily_progress = CASE 
                        WHEN "lastStudyDate"::DATE = current_date_only THEN daily_progress + p_daily_progress_increment
                        ELSE p_daily_progress_increment  -- Reset daily progress for new day
                    END,
                    current_streak = new_streak,
                    longest_streak = GREATEST(longest_streak, new_streak),
                    "lastStudyDate" = NOW(),
                    updated_at = NOW()
                WHERE user_id = p_user_id;
                
                RETURN FOUND;
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE NOTICE ''Error updating user progress: %'', SQLERRM;
                    RETURN FALSE;
            END;
            $func$ LANGUAGE plpgsql';
            RAISE NOTICE 'Created update_user_progress_safe function';
        ELSE
            RAISE NOTICE 'Cannot create function: user_progress table missing required columns';
        END IF;
    ELSE
        RAISE NOTICE 'Cannot create function: user_progress table does not exist';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating update_user_progress_safe function: %', SQLERRM;
END$$;

-- Step 7: Create function to reset daily progress (with table existence check)
DO $$
BEGIN
    -- Only create function if user_progress table exists with required columns
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_progress') THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'user_progress' 
            AND column_name IN ('daily_progress', 'lastStudyDate', 'updated_at')
            GROUP BY table_name
            HAVING COUNT(*) = 3
        ) THEN
            EXECUTE '
            CREATE OR REPLACE FUNCTION reset_daily_progress()
            RETURNS INTEGER AS $func$
            DECLARE
                reset_count INTEGER;
            BEGIN
                UPDATE user_progress 
                SET daily_progress = 0,
                    updated_at = NOW()
                WHERE "lastStudyDate"::DATE < CURRENT_DATE;
                
                GET DIAGNOSTICS reset_count = ROW_COUNT;
                RETURN reset_count;
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE NOTICE ''Error resetting daily progress: %'', SQLERRM;
                    RETURN 0;
            END;
            $func$ LANGUAGE plpgsql';
            RAISE NOTICE 'Created reset_daily_progress function';
        ELSE
            RAISE NOTICE 'Cannot create function: user_progress table missing required columns';
        END IF;
    ELSE
        RAISE NOTICE 'Cannot create function: user_progress table does not exist';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating reset_daily_progress function: %', SQLERRM;
END$$;

-- Step 8: Show summary of improvements
SELECT 
    'Enhanced database improvements completed!' as status,
    'Added constraints, triggers, indexes, views, and utility functions' as summary,
    NOW() as completed_at;

-- Show all constraints
SELECT 
    'Constraints Added' as category,
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name IN ('user_progress', 'user_settings')
  AND constraint_type IN ('CHECK', 'FOREIGN KEY')
ORDER BY table_name, constraint_name;

-- Show all indexes
SELECT 
    'Indexes Created' as category,
    tablename,
    indexname
FROM pg_indexes 
WHERE tablename IN ('user_progress', 'user_settings')
  AND indexname NOT LIKE '%_pkey'
ORDER BY tablename, indexname;

-- Show all functions created
SELECT 
    'Functions Created' as category,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name IN (
    'update_user_progress_timestamp',
    'update_user_settings_timestamp', 
    'update_user_progress_safe',
    'reset_daily_progress'
)
ORDER BY routine_name;