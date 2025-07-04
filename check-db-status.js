const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkDatabaseStatus() {
  console.log('🔍 Checking EdLingo database status...');
  console.log('URL:', process.env.VITE_SUPABASE_URL);
  
  const tables = [
    'users',
    'user_progress', 
    'vocabulary',
    'user_vocabulary_progress',
    'grammar_lessons',
    'user_grammar_progress',
    'chat_history',
    'user_settings',
    'learning_sessions',
    'achievements',
    'user_achievements'
  ];
  
  let connectedTables = 0;
  let totalRecords = 0;
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        const count = data?.length || 0;
        console.log(`✅ ${table}: ${count} records`);
        connectedTables++;
        totalRecords += count;
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }
  
  console.log('\n📊 Database Summary:');
  console.log(`Connected tables: ${connectedTables}/${tables.length}`);
  console.log(`Total records: ${totalRecords}`);
  
  if (connectedTables === tables.length) {
    console.log('🎉 Database is fully connected and synchronized!');
  } else if (connectedTables > 0) {
    console.log('⚠️  Database is partially connected. Some tables may be missing.');
  } else {
    console.log('❌ Database connection failed or schema not applied.');
  }
  
  // Test sample data
  try {
    const { data: vocabData } = await supabase
      .from('vocabulary')
      .select('word, translation')
      .limit(3);
    
    if (vocabData && vocabData.length > 0) {
      console.log('\n📚 Sample vocabulary data:');
      vocabData.forEach(item => {
        console.log(`  - ${item.word} → ${item.translation}`);
      });
    } else {
      console.log('\n📝 No sample vocabulary data found.');
    }
  } catch (err) {
    console.log('\n❌ Could not fetch sample data:', err.message);
  }
}

checkDatabaseStatus().catch(console.error);