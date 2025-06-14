const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function checkTableStructure() {
  console.log('🔍 Checking user_settings table structure...')
  
  try {
    // Try to get any existing data to see the structure
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Error querying table:', error)
      return
    }
    
    console.log('✅ Table query successful')
    console.log('📊 Sample data (if any):', data)
    
    if (data && data.length > 0) {
      console.log('🔑 Available columns:', Object.keys(data[0]))
    } else {
      console.log('📝 Table is empty, trying to insert test data to see structure...')
      
      // Try inserting with the old schema first
      const { data: insertData, error: insertError } = await supabase
        .from('user_settings')
        .insert({
          user_id: 'test-user',
          settings: { theme: 'dark' }
        })
        .select()
      
      if (insertError) {
        console.log('❌ Old schema failed:', insertError.message)
        
        // Try with new schema
        const { data: newInsertData, error: newInsertError } = await supabase
          .from('user_settings')
          .insert({
            user_id: 'test-user',
            setting_key: 'theme',
            setting_value: 'dark'
          })
          .select()
        
        if (newInsertError) {
          console.log('❌ New schema also failed:', newInsertError.message)
        } else {
          console.log('✅ New schema works:', newInsertData)
        }
      } else {
        console.log('✅ Old schema still works:', insertData)
      }
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error)
  }
}

checkTableStructure()