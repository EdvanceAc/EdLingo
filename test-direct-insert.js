require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDirectInsert() {
  try {
    console.log('🧪 Testing direct SQL insert...');
    
    // Test inserting a simple achievement using raw SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `INSERT INTO achievements (name, description, icon, category, criteria, xp_reward) 
             VALUES ('Test Achievement', 'A test achievement', '🧪', 'test', '{"test": true}', 10) 
             RETURNING *;`
    });
    
    if (error) {
      console.error('❌ RPC Error:', error);
      
      // Try alternative approach with direct insert
      console.log('🔄 Trying direct insert method...');
      const { data: directData, error: directError } = await supabase
        .from('achievements')
        .insert({
          name: 'Test Achievement Direct',
          description: 'A test achievement using direct method',
          icon: '🧪',
          category: 'test',
          criteria: { test: true },
          xp_reward: 10
        })
        .select();
        
      if (directError) {
        console.error('❌ Direct Insert Error:', directError);
      } else {
        console.log('✅ Direct insert successful:', directData);
      }
    } else {
      console.log('✅ RPC insert successful:', data);
    }
    
    // Check current achievements count
    const { data: achievements, error: countError } = await supabase
      .from('achievements')
      .select('*');
      
    if (countError) {
      console.error('❌ Count Error:', countError);
    } else {
      console.log(`📊 Current achievements count: ${achievements.length}`);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testDirectInsert();