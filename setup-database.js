// Database setup script using Supabase service role key
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

console.log('🔧 Setting up database with service role key...');
console.log('URL:', supabaseUrl);

// Create client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupDatabase() {
  try {
    console.log('📖 Reading schema file...');
    const schemaPath = path.join(__dirname, 'src', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('🗄️ Executing database schema...');
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
        
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement + ';'
        });
        
        if (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error.message);
          console.log('Statement:', statement.substring(0, 100) + '...');
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      }
    }
    
    console.log('\n🎉 Database setup completed!');
    console.log('\n🔍 Testing table creation...');
    
    // Test if tables were created
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['user_progress', 'vocabulary', 'grammar_lessons', 'chat_history']);
    
    if (tablesError) {
      console.error('❌ Could not verify table creation:', tablesError.message);
    } else {
      console.log('✅ Tables verified:', tables.map(t => t.table_name).join(', '));
    }
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();