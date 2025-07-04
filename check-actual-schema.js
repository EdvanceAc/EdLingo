// Check what columns actually exist in the database tables
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkActualSchema() {
  console.log('🔍 Checking actual database schema...');
  
  // Try to insert a minimal record to see what columns are required/available
  console.log('\n📝 Testing grammar_lessons table...');
  try {
    const { data, error } = await supabase
      .from('grammar_lessons')
      .insert([{
        title: 'Test Lesson',
        description: 'Test Description'
      }])
      .select();
    
    if (error) {
      console.log('❌ Insert failed:', error.message);
      if (error.message.includes('violates not-null constraint')) {
        console.log('💡 This tells us which columns are required');
      }
    } else {
      console.log('✅ Insert succeeded, columns available:', Object.keys(data[0]));
      // Clean up test record
      await supabase.from('grammar_lessons').delete().eq('id', data[0].id);
    }
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
  
  console.log('\n📚 Testing vocabulary table...');
  try {
    const { data, error } = await supabase
      .from('vocabulary')
      .insert([{
        word: 'test',
        translation: 'prueba'
      }])
      .select();
    
    if (error) {
      console.log('❌ Insert failed:', error.message);
      if (error.message.includes('violates not-null constraint')) {
        console.log('💡 This tells us which columns are required');
      }
    } else {
      console.log('✅ Insert succeeded, columns available:', Object.keys(data[0]));
      // Clean up test record
      await supabase.from('vocabulary').delete().eq('id', data[0].id);
    }
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
  
  console.log('\n🎯 Testing learning_sessions table...');
  try {
    const { data, error } = await supabase
      .from('learning_sessions')
      .insert([{
        session_type: 'test',
        duration_minutes: 1
      }])
      .select();
    
    if (error) {
      console.log('❌ Insert failed:', error.message);
    } else {
      console.log('✅ Insert succeeded, columns available:', Object.keys(data[0]));
      // Clean up test record
      await supabase.from('learning_sessions').delete().eq('id', data[0].id);
    }
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
}

checkActualSchema();