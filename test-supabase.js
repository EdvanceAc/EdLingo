// Simple test script to verify Supabase connection
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.log('Please check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

console.log('🔗 Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('vocabulary')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      console.log('\n📋 Next steps:');
      console.log('1. Make sure you have run the schema.sql in your Supabase SQL Editor');
      console.log('2. Check that your credentials are correct');
      console.log('3. Verify that Row Level Security policies allow public read access');
      return;
    }
    
    console.log('✅ Supabase connection successful!');
    console.log('📊 Database is accessible and vocabulary table exists');
    
    // Test sample data
    const { data: sampleData, error: sampleError } = await supabase
      .from('vocabulary')
      .select('word, translation')
      .limit(3);
    
    if (sampleError) {
      console.log('⚠️  Could not fetch sample data:', sampleError.message);
    } else if (sampleData && sampleData.length > 0) {
      console.log('📚 Sample vocabulary words found:');
      sampleData.forEach(item => {
        console.log(`  - ${item.word} → ${item.translation}`);
      });
    } else {
      console.log('📝 No sample data found. You may want to run the schema.sql to insert sample vocabulary.');
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
}

testConnection();