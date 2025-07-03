const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyDailyGoalFix() {
  console.log('🔧 Applying daily_goal column fix...');
  
  try {
    // Add missing daily_goal columns
    console.log('📝 Adding daily_goal and daily_goal_completed columns to user_progress table...');
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE user_progress 
        ADD COLUMN IF NOT EXISTS daily_goal INTEGER DEFAULT 30,
        ADD COLUMN IF NOT EXISTS daily_goal_completed BOOLEAN DEFAULT false;
        
        UPDATE user_progress 
        SET daily_goal = 30, daily_goal_completed = false 
        WHERE daily_goal IS NULL OR daily_goal_completed IS NULL;
      `
    });
    
    if (error) {
      console.error('❌ Error executing SQL:', error);
      
      // Try alternative approach using direct SQL
      console.log('🔄 Trying alternative approach...');
      
      const { data: alterData, error: alterError } = await supabase
        .from('user_progress')
        .select('daily_goal')
        .limit(1);
      
      if (alterError && alterError.code === 'PGRST204') {
        console.log('✅ Column issue confirmed. Please run this SQL manually in Supabase Dashboard:');
        console.log('\n--- COPY THIS SQL TO SUPABASE SQL EDITOR ---');
        console.log('ALTER TABLE user_progress');
        console.log('ADD COLUMN IF NOT EXISTS daily_goal INTEGER DEFAULT 30,');
        console.log('ADD COLUMN IF NOT EXISTS daily_goal_completed BOOLEAN DEFAULT false;');
        console.log('');
        console.log('UPDATE user_progress');
        console.log('SET daily_goal = 30, daily_goal_completed = false');
        console.log('WHERE daily_goal IS NULL OR daily_goal_completed IS NULL;');
        console.log('--- END SQL ---\n');
        return;
      }
    }
    
    console.log('✅ Daily goal columns added successfully!');
    
    // Verify the fix
    console.log('🔍 Verifying the fix...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('user_progress')
      .select('daily_goal, daily_goal_completed')
      .limit(1);
    
    if (verifyError) {
      console.error('❌ Verification failed:', verifyError);
    } else {
      console.log('✅ Verification successful! Columns are now accessible.');
    }
    
    console.log('🚀 You can now restart the application with: npm run dev');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the fix
applyDailyGoalFix().then(() => {
  console.log('\n🎉 Daily goal fix process completed!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Fix process failed:', error);
  process.exit(1);
});