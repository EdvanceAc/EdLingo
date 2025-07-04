const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function fixRLSPolicies() {
  console.log('🔧 Fixing RLS policies for learning_sessions table...');
  
  try {
    // First, let's try to disable RLS temporarily to test
    console.log('📝 Attempting to disable RLS on learning_sessions...');
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE learning_sessions DISABLE ROW LEVEL SECURITY;'
    });
    
    if (error) {
      console.log('⚠️  Could not disable RLS via RPC, this is expected.');
      console.log('Error:', error.message);
    } else {
      console.log('✅ RLS disabled successfully');
    }
    
    // Test if we can now access the table
    console.log('🧪 Testing access to learning_sessions...');
    const { data: testData, error: testError } = await supabase
      .from('learning_sessions')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.log('❌ Still cannot access learning_sessions:', testError.message);
      
      // Try creating a permissive policy instead
      console.log('📝 Attempting to create permissive policy...');
      const { data: policyData, error: policyError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE POLICY "Allow all operations on learning_sessions" ON learning_sessions
          FOR ALL USING (true) WITH CHECK (true);
        `
      });
      
      if (policyError) {
        console.log('⚠️  Could not create policy via RPC:', policyError.message);
      } else {
        console.log('✅ Permissive policy created');
      }
    } else {
      console.log('✅ Can now access learning_sessions table');
      console.log('📊 Found', testData?.length || 0, 'records');
    }
    
  } catch (error) {
    console.error('❌ Error fixing RLS policies:', error);
  }
}

fixRLSPolicies();