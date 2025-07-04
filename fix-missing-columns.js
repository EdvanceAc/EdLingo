// Fix missing columns in database tables
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixMissingColumns() {
  console.log('🔧 Attempting to fix missing columns...');
  
  try {
    // Try to add lesson_order column to grammar_lessons
    console.log('📝 Adding lesson_order column to grammar_lessons...');
    const { data: alterResult1, error: alterError1 } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE grammar_lessons ADD COLUMN IF NOT EXISTS lesson_order INTEGER DEFAULT 1;'
    });
    
    if (alterError1) {
      console.log('⚠️  Cannot alter table via RPC (expected):', alterError1.message);
    } else {
      console.log('✅ Successfully added lesson_order column');
    }
    
    // Try to add level column to vocabulary
    console.log('📝 Adding level column to vocabulary...');
    const { data: alterResult2, error: alterError2 } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS level VARCHAR(10) DEFAULT \'beginner\';'
    });
    
    if (alterError2) {
      console.log('⚠️  Cannot alter table via RPC (expected):', alterError2.message);
    } else {
      console.log('✅ Successfully added level column');
    }
    
    // Test if we can now query with the columns
    console.log('\n🧪 Testing column access...');
    
    const { data: testGrammar, error: testGrammarError } = await supabase
      .from('grammar_lessons')
      .select('id, title, lesson_order')
      .limit(1);
    
    if (testGrammarError) {
      console.log('❌ Still cannot access lesson_order:', testGrammarError.message);
    } else {
      console.log('✅ Can now access lesson_order column');
    }
    
    const { data: testVocab, error: testVocabError } = await supabase
      .from('vocabulary')
      .select('id, word, level')
      .limit(1);
    
    if (testVocabError) {
      console.log('❌ Still cannot access level:', testVocabError.message);
    } else {
      console.log('✅ Can now access level column');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixMissingColumns();