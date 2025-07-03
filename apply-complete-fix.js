const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Applying Complete Database Fix...');
console.log('====================================');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyCompleteFix() {
  try {
    console.log('📊 Adding missing columns to user_progress table...');
    
    // Add all missing columns
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add dailyGoal column
        ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS daily_goal INTEGER DEFAULT 30;
        
        -- Add dailyProgress column
        ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS daily_progress INTEGER DEFAULT 0;
        
        -- Add chat_messages column (if not already added)
        ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS chat_messages INTEGER DEFAULT 0;
        
        -- Update existing records
        UPDATE user_progress 
        SET 
            daily_goal = COALESCE(daily_goal, 30),
            daily_progress = COALESCE(daily_progress, 0),
            chat_messages = COALESCE(chat_messages, 0)
        WHERE 
            daily_goal IS NULL 
            OR daily_progress IS NULL 
            OR chat_messages IS NULL;
      `
    });
    
    if (error) {
      console.error('❌ Database fix failed:', error.message);
      console.log('\n🔧 MANUAL FIX REQUIRED:');
      console.log('Please run the SQL from complete-database-fix.sql in Supabase Dashboard');
      return false;
    }
    
    console.log('✅ Database columns added successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n🔧 MANUAL FIX REQUIRED:');
    console.log('Please run the SQL from complete-database-fix.sql in Supabase Dashboard');
    return false;
  }
}

async function main() {
  const success = await applyCompleteFix();
  
  if (success) {
    console.log('\n🎉 Complete database fix applied successfully!');
    console.log('✅ All missing columns added to user_progress table');
    console.log('🚀 You can now restart the application with: npm run dev');
  } else {
    console.log('\n⚠️  Please apply the manual fix and restart the application');
  }
}

main().catch(console.error);