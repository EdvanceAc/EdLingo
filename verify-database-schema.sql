-- DATABASE SCHEMA VERIFICATION SCRIPT
-- Run this after schema-first-database-fix.sql to verify everything is working

-- Check if all required tables exist
DO $$
DECLARE
    table_exists BOOLEAN;
BEGIN
    RAISE NOTICE '=== DATABASE SCHEMA VERIFICATION ===';
    
    -- Check users table
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'users'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '✓ users table: EXISTS';
    ELSE
        RAISE NOTICE '✗ users table: MISSING';
    END IF;
    
    -- Check user_progress table
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'user_progress'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '✓ user_progress table: EXISTS';
    ELSE
        RAISE NOTICE '✗ user_progress table: MISSING';
    END IF;
    
    -- Check user_settings table
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'user_settings'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '✓ user_settings table: EXISTS';
    ELSE
        RAISE NOTICE '✗ user_settings table: MISSING';
    END IF;
END$$;

-- Check if all required columns exist in user_progress
DO $$
DECLARE
    column_exists BOOLEAN;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== USER_PROGRESS COLUMNS VERIFICATION ===';
    
    -- Check each required column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_progress' AND column_name = 'user_id'
    ) INTO column_exists;
    RAISE NOTICE CASE WHEN column_exists THEN '✓' ELSE '✗' END || ' user_id column';
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_progress' AND column_name = 'total_xp'
    ) INTO column_exists;
    RAISE NOTICE CASE WHEN column_exists THEN '✓' ELSE '✗' END || ' total_xp column';
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_progress' AND column_name = 'current_streak'
    ) INTO column_exists;
    RAISE NOTICE CASE WHEN column_exists THEN '✓' ELSE '✗' END || ' current_streak column';
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_progress' AND column_name = 'longest_streak'
    ) INTO column_exists;
    RAISE NOTICE CASE WHEN column_exists THEN '✓' ELSE '✗' END || ' longest_streak column';
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_progress' AND column_name = 'lessons_completed'
    ) INTO column_exists;
    RAISE NOTICE CASE WHEN column_exists THEN '✓' ELSE '✗' END || ' lessons_completed column';
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_progress' AND column_name = 'daily_goal'
    ) INTO column_exists;
    RAISE NOTICE CASE WHEN column_exists THEN '✓' ELSE '✗' END || ' daily_goal column';
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_progress' AND column_name = 'daily_progress'
    ) INTO column_exists;
    RAISE NOTICE CASE WHEN column_exists THEN '✓' ELSE '✗' END || ' daily_progress column';
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_progress' AND column_name = 'lastStudyDate'
    ) INTO column_exists;
    RAISE NOTICE CASE WHEN column_exists THEN '✓' ELSE '✗' END || ' lastStudyDate column';
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_progress' AND column_name = 'created_at'
    ) INTO column_exists;
    RAISE NOTICE CASE WHEN column_exists THEN '✓' ELSE '✗' END || ' created_at column';
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_progress' AND column_name = 'updated_at'
    ) INTO column_exists;
    RAISE NOTICE CASE WHEN column_exists THEN '✓' ELSE '✗' END || ' updated_at column';
END$$;

-- Check foreign key constraints
DO $$
DECLARE
    constraint_exists BOOLEAN;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== FOREIGN KEY CONSTRAINTS VERIFICATION ===';
    
    -- Check user_progress foreign key
    SELECT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_progress_user_id_fkey'
        AND table_name = 'user_progress'
    ) INTO constraint_exists;
    RAISE NOTICE CASE WHEN constraint_exists THEN '✓' ELSE '✗' END || ' user_progress_user_id_fkey constraint';
    
    -- Check user_settings foreign key
    SELECT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_settings_user_id_fkey'
        AND table_name = 'user_settings'
    ) INTO constraint_exists;
    RAISE NOTICE CASE WHEN constraint_exists THEN '✓' ELSE '✗' END || ' user_settings_user_id_fkey constraint';
END$$;

-- Check default user and data
DO $$
DECLARE
    user_count INTEGER;
    progress_count INTEGER;
    settings_count INTEGER;
    default_user_exists BOOLEAN;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== DATA VERIFICATION ===';
    
    -- Count records
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO progress_count FROM user_progress;
    SELECT COUNT(*) INTO settings_count FROM user_settings;
    
    RAISE NOTICE 'Total users: %', user_count;
    RAISE NOTICE 'Total user_progress records: %', progress_count;
    RAISE NOTICE 'Total user_settings records: %', settings_count;
    
    -- Check default user
    SELECT EXISTS (
        SELECT 1 FROM users 
        WHERE id = '00000000-0000-0000-0000-000000000001'
    ) INTO default_user_exists;
    
    IF default_user_exists THEN
        RAISE NOTICE '✓ Default user exists';
        
        -- Check if default user has progress
        IF EXISTS (
            SELECT 1 FROM user_progress 
            WHERE user_id = '00000000-0000-0000-0000-000000000001'
        ) THEN
            RAISE NOTICE '✓ Default user has progress record';
        ELSE
            RAISE NOTICE '✗ Default user missing progress record';
        END IF;
        
        -- Check if default user has settings
        IF EXISTS (
            SELECT 1 FROM user_settings 
            WHERE user_id = '00000000-0000-0000-0000-000000000001'
        ) THEN
            RAISE NOTICE '✓ Default user has settings record';
        ELSE
            RAISE NOTICE '✗ Default user missing settings record';
        END IF;
    ELSE
        RAISE NOTICE '✗ Default user does not exist';
    END IF;
END$$;

-- Test basic operations
DO $$
DECLARE
    test_user_id UUID;
    operation_success BOOLEAN := true;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== BASIC OPERATIONS TEST ===';
    
    BEGIN
        -- Test inserting a user
        INSERT INTO users (email, username, display_name)
        VALUES ('test@example.com', 'test_user', 'Test User')
        RETURNING id INTO test_user_id;
        
        RAISE NOTICE '✓ User insertion: SUCCESS';
        
        -- Test inserting user progress
        INSERT INTO user_progress (
            user_id, total_xp, current_streak, longest_streak,
            lessons_completed, daily_goal, daily_progress, "lastStudyDate"
        )
        VALUES (
            test_user_id, 100, 5, 10, 20, 15, 5, NOW()
        );
        
        RAISE NOTICE '✓ User progress insertion: SUCCESS';
        
        -- Test inserting user settings
        INSERT INTO user_settings (user_id, theme, language)
        VALUES (test_user_id, 'dark', 'en');
        
        RAISE NOTICE '✓ User settings insertion: SUCCESS';
        
        -- Clean up test data
        DELETE FROM user_settings WHERE user_id = test_user_id;
        DELETE FROM user_progress WHERE user_id = test_user_id;
        DELETE FROM users WHERE id = test_user_id;
        
        RAISE NOTICE '✓ Test data cleanup: SUCCESS';
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '✗ Operation failed: %', SQLERRM;
            operation_success := false;
    END;
    
    IF operation_success THEN
        RAISE NOTICE '';
        RAISE NOTICE '🎉 ALL TESTS PASSED! Database is ready for use.';
    ELSE
        RAISE NOTICE '';
        RAISE NOTICE '❌ Some tests failed. Please check the errors above.';
    END IF;
END$$;

-- Show current schema summary
SELECT 
    'TABLES' as category,
    table_name as name,
    'N/A' as details
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN ('users', 'user_progress', 'user_settings')

UNION ALL

SELECT 
    'COLUMNS' as category,
    table_name || '.' || column_name as name,
    data_type as details
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name IN ('users', 'user_progress', 'user_settings')

UNION ALL

SELECT 
    'CONSTRAINTS' as category,
    constraint_name as name,
    constraint_type as details
FROM information_schema.table_constraints 
WHERE table_schema = 'public'
AND table_name IN ('users', 'user_progress', 'user_settings')

ORDER BY category, name;