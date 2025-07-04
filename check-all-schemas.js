const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkTableSchema(tableName) {
  console.log(`\n🔍 Checking ${tableName} table schema...`);
  
  try {
    // Try to get one record to see what columns exist
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      console.log(`❌ Error accessing ${tableName}:`, error.message);
      return null;
    }
    
    if (data && data.length > 0) {
      console.log(`✅ ${tableName} columns:`, Object.keys(data[0]).join(', '));
      return Object.keys(data[0]);
    } else {
      console.log(`⚠️  ${tableName} table is empty, trying to insert test record...`);
      
      // Try minimal insert to discover required columns
      const testData = {};
      if (tableName === 'users') {
        testData.id = '00000000-0000-0000-0000-000000000001';
        testData.email = 'test@example.com';
      } else if (tableName === 'grammar_lessons') {
        testData.title = 'Test Lesson';
        testData.description = 'Test Description';
        testData.language = 'Spanish';
      } else if (tableName === 'vocabulary') {
        testData.word = 'test';
        testData.translation = 'prueba';
        testData.language = 'Spanish';
      } else if (tableName === 'learning_sessions') {
        testData.user_id = '00000000-0000-0000-0000-000000000001';
        testData.session_type = 'test';
      }
      
      const { data: insertData, error: insertError } = await supabase
        .from(tableName)
        .insert(testData)
        .select()
        .single();
      
      if (insertError) {
        console.log(`❌ Insert failed for ${tableName}:`, insertError.message);
        
        // Try to extract column info from error message
        if (insertError.message.includes('null value in column')) {
          const match = insertError.message.match(/null value in column "([^"]+)"/);;
          if (match) {
            console.log(`🔍 Required column found: ${match[1]}`);
          }
        }
        return null;
      } else {
        console.log(`✅ ${tableName} columns:`, Object.keys(insertData).join(', '));
        
        // Clean up test record
        await supabase.from(tableName).delete().eq('id', insertData.id);
        
        return Object.keys(insertData);
      }
    }
  } catch (error) {
    console.log(`❌ Unexpected error for ${tableName}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('🔍 Checking actual database schema...');
  
  const tables = [
    'users',
    'grammar_lessons', 
    'vocabulary',
    'learning_sessions',
    'user_progress',
    'user_vocabulary_progress',
    'user_grammar_progress',
    'chat_history',
    'user_settings',
    'achievements',
    'user_achievements'
  ];
  
  const schemas = {};
  
  for (const table of tables) {
    schemas[table] = await checkTableSchema(table);
  }
  
  console.log('\n📋 Summary of actual table schemas:');
  for (const [table, columns] of Object.entries(schemas)) {
    if (columns) {
      console.log(`${table}: ${columns.join(', ')}`);
    } else {
      console.log(`${table}: ❌ Could not determine schema`);
    }
  }
}

main().catch(console.error);