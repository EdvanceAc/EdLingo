const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration in .env file');
  console.error('Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndFixDatabase() {
  console.log('🔧 Starting database schema check and fix...');
  
  try {
    // First, let's check what columns currently exist
    console.log('🔍 Checking current user_progress table structure...');
    
    const { data: existingData, error: checkError } = await supabase
      .from('user_progress')
      .select('*')
      .limit(1);

    if (checkError) {
      console.error('❌ Error checking user_progress table:', checkError);
      throw checkError;
    }

    const existingColumns = existingData && existingData.length > 0 ? Object.keys(existingData[0]) : [];
    console.log('📊 Existing columns:', existingColumns);

    const requiredColumns = [
      'current_streak',
      'longest_streak', 
      'words_learned',
      'time_studied',
      'chat_messages',
      'daily_progress',
      'daily_goal'
    ];

    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length === 0) {
      console.log('✅ All required columns are present!');
      return;
    }

    console.log('⚠️  Missing columns detected:', missingColumns);
    console.log('\n📋 MANUAL FIX REQUIRED:');
    console.log('\nPlease run the following SQL commands in your Supabase Dashboard:');
    console.log('(Go to your Supabase project → SQL Editor → New query)');
    console.log('\n-- Add missing columns to user_progress table');
    
    if (missingColumns.includes('current_streak')) {
      console.log('ALTER TABLE user_progress ADD COLUMN current_streak INTEGER DEFAULT 0;');
    }
    if (missingColumns.includes('longest_streak')) {
      console.log('ALTER TABLE user_progress ADD COLUMN longest_streak INTEGER DEFAULT 0;');
    }
    if (missingColumns.includes('words_learned')) {
      console.log('ALTER TABLE user_progress ADD COLUMN words_learned INTEGER DEFAULT 0;');
    }
    if (missingColumns.includes('time_studied')) {
      console.log('ALTER TABLE user_progress ADD COLUMN time_studied INTEGER DEFAULT 0;');
    }
    if (missingColumns.includes('chat_messages')) {
      console.log('ALTER TABLE user_progress ADD COLUMN chat_messages INTEGER DEFAULT 0;');
    }
    if (missingColumns.includes('daily_progress')) {
      console.log('ALTER TABLE user_progress ADD COLUMN daily_progress INTEGER DEFAULT 0;');
    }
    if (missingColumns.includes('daily_goal')) {
      console.log('ALTER TABLE user_progress ADD COLUMN daily_goal INTEGER DEFAULT 10;');
    }

    console.log('\n-- Update existing records with default values');
    console.log('UPDATE user_progress SET');
    const updates = [];
    if (missingColumns.includes('current_streak')) updates.push('  current_streak = 0');
    if (missingColumns.includes('longest_streak')) updates.push('  longest_streak = 0');
    if (missingColumns.includes('words_learned')) updates.push('  words_learned = 0');
    if (missingColumns.includes('time_studied')) updates.push('  time_studied = 0');
    if (missingColumns.includes('chat_messages')) updates.push('  chat_messages = 0');
    if (missingColumns.includes('daily_progress')) updates.push('  daily_progress = 0');
    if (missingColumns.includes('daily_goal')) updates.push('  daily_goal = 10');
    
    console.log(updates.join(',\n'));
    console.log('WHERE id IS NOT NULL;');

    console.log('\n🔄 After running the SQL commands, restart this script to verify the fix.');
    console.log('\n📝 Steps to fix:');
    console.log('1. Open your Supabase Dashboard');
    console.log('2. Go to SQL Editor');
    console.log('3. Create a new query');
    console.log('4. Copy and paste the SQL commands above');
    console.log('5. Run the query');
    console.log('6. Restart your application');

  } catch (error) {
    console.error('❌ Database check failed:', error);
    console.log('\n📋 If you continue to have issues, please check:');
    console.log('1. Your Supabase URL and API key are correct');
    console.log('2. Your database is accessible');
    console.log('3. The user_progress table exists');
    process.exit(1);
  }
}

// Run the check
checkAndFixDatabase();