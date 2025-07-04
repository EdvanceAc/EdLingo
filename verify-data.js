require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyData() {
  try {
    console.log('🔍 Verifying database data...');
    console.log('URL:', supabaseUrl);
    
    // Check achievements
    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*');
      
    if (achievementsError) {
      console.error('❌ Achievements Error:', achievementsError);
    } else {
      console.log(`✅ Achievements: ${achievements.length} records`);
      if (achievements.length > 0) {
        console.log('   Sample:', achievements[0].name);
      }
    }
    
    // Check users (this might fail due to RLS)
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');
      
    if (usersError) {
      console.log('⚠️ Users Error (expected due to RLS):', usersError.message);
    } else {
      console.log(`✅ Users: ${users.length} records`);
    }
    
    // Check vocabulary
    const { data: vocabulary, error: vocabError } = await supabase
      .from('vocabulary')
      .select('*');
      
    if (vocabError) {
      console.error('❌ Vocabulary Error:', vocabError);
    } else {
      console.log(`✅ Vocabulary: ${vocabulary.length} records`);
    }
    
    // Check grammar lessons
    const { data: lessons, error: lessonsError } = await supabase
      .from('grammar_lessons')
      .select('*');
      
    if (lessonsError) {
      console.error('❌ Grammar Lessons Error:', lessonsError);
    } else {
      console.log(`✅ Grammar Lessons: ${lessons.length} records`);
    }
    
    // Check learning sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from('learning_sessions')
      .select('*');
      
    if (sessionsError) {
      console.log('⚠️ Learning Sessions Error (expected due to RLS):', sessionsError.message);
    } else {
      console.log(`✅ Learning Sessions: ${sessions.length} records`);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

verifyData();