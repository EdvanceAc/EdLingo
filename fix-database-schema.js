const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.log('Please check that VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

console.log('🔧 Fixing database schema...');
console.log('URL:', supabaseUrl);

// Create client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixDatabaseSchema() {
  try {
    console.log('📖 Reading schema file...');
    const schemaPath = path.join(__dirname, 'src', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('🗄️ Applying database schema directly...');
    
    // Apply the entire schema as one query
    const { data, error } = await supabase.rpc('exec', {
      sql: schema
    });
    
    if (error) {
      console.log('⚠️  Direct schema application failed, trying alternative method...');
      console.log('Error:', error.message);
      
      // Alternative: Apply schema through SQL editor approach
      console.log('\n📋 MANUAL SETUP REQUIRED:');
      console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard');
      console.log('2. Navigate to your project');
      console.log('3. Go to SQL Editor');
      console.log('4. Click "New Query"');
      console.log('5. Copy and paste the following schema:');
      console.log('\n' + '='.repeat(50));
      console.log(schema);
      console.log('='.repeat(50));
      console.log('\n6. Click "Run" to execute the schema');
      console.log('\n✅ After running the schema, restart your app with: npm run dev');
      
      return false;
    }
    
    console.log('✅ Database schema applied successfully!');
    console.log('🎉 You can now restart your app with: npm run dev');
    return true;
    
  } catch (error) {
    console.error('❌ Error applying schema:', error.message);
    
    // Provide manual instructions
    console.log('\n📋 MANUAL SETUP REQUIRED:');
    console.log('Since automated setup failed, please apply the schema manually:');
    console.log('\n1. Go to your Supabase dashboard: https://supabase.com/dashboard');
    console.log('2. Navigate to your project');
    console.log('3. Go to SQL Editor');
    console.log('4. Click "New Query"');
    console.log('5. Copy the contents of src/database/schema.sql');
    console.log('6. Paste into the SQL editor');
    console.log('7. Click "Run" to execute');
    console.log('\n✅ After applying the schema, restart your app with: npm run dev');
    
    return false;
  }
}

// Test database connection first
async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    const { data, error } = await supabase
      .from('user_progress')
      .select('count')
      .limit(1);
    
    if (error && error.code === 'PGRST204') {
      console.log('⚠️  Table user_progress not found - schema needs to be applied');
      return false;
    } else if (error) {
      console.log('⚠️  Database connection issue:', error.message);
      return false;
    }
    
    console.log('✅ Database connection successful!');
    console.log('✅ Schema appears to be already applied!');
    return true;
    
  } catch (error) {
    console.log('⚠️  Connection test failed:', error.message);
    return false;
  }
}

async function main() {
  const connectionOk = await testConnection();
  
  if (connectionOk) {
    console.log('🎉 Database is ready! You can run your app with: npm run dev');
    return;
  }
  
  console.log('🔧 Applying database schema...');
  await fixDatabaseSchema();
}

main().catch(console.error);