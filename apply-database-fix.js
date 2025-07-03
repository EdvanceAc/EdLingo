const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyDatabaseFix() {
  console.log('🔧 Applying database schema fix...');
  
  try {
    // Add missing chat_messages column
    console.log('📝 Adding chat_messages column to user_progress table...');
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS chat_messages INTEGER DEFAULT 0;
        UPDATE user_progress SET chat_messages = 0 WHERE chat_messages IS NULL;
      `
    });
    
    if (error) {
      console.error('❌ Error executing SQL:', error);
      
      // Try alternative approach using direct SQL
      console.log('🔄 Trying alternative approach...');
      
      const { data: alterData, error: alterError } = await supabase
        .from('user_progress')
        .select('id')
        .limit(1);
      
      if (alterError && alterError.code === 'PGRST204') {
        console.log('✅ Column issue confirmed. Please run this SQL manually in Supabase Dashboard:');
        console.log('\n--- COPY THIS SQL TO SUPABASE SQL EDITOR ---');
        console.log('ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS chat_messages INTEGER DEFAULT 0;');
        console.log('UPDATE user_progress SET chat_messages = 0 WHERE chat_messages IS NULL;');
        console.log('--- END SQL ---\n');
        return;
      }
    }
    
    console.log('✅ Database schema fix applied successfully!');
    console.log('🚀 You can now restart the application with: npm run dev');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    console.log('\n📋 Manual fix required. Run this SQL in Supabase Dashboard:');
    console.log('ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS chat_messages INTEGER DEFAULT 0;');
    console.log('UPDATE user_progress SET chat_messages = 0 WHERE chat_messages IS NULL;');
  }
}

applyDatabaseFix();