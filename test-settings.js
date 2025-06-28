require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

console.log('Environment variables:')
console.log('URL:', process.env.VITE_SUPABASE_URL)
console.log('Key length:', process.env.VITE_SUPABASE_ANON_KEY?.length)

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function testUserSettings() {
  console.log('\n🔧 Testing user settings schema...')
  
  // Generate a proper UUID for testing (or let database auto-generate)
  const testUserId = crypto.randomUUID()
  const testSettingKey = 'theme'
  const testSettingValue = 'dark'
  
  console.log('🆔 Using test user ID:', testUserId)
  
  try {
    // Test basic connection first (same as working debug-connection.js)
    console.log('🔗 Testing basic connection...')
    const { data: connectionTest, error: connectionError } = await supabase
      .from('user_settings')
      .select('count')
      .limit(1)
    
    if (connectionError) {
      console.log('❌ Connection test failed:', connectionError)
      return
    }
    
    console.log('✅ Connection successful:', connectionTest)
    
    // Test simple insert
    console.log('📝 Testing simple insert...')
    const { data: insertData, error: insertError } = await supabase
      .from('user_settings')
      .insert({
        user_id: testUserId,
        setting_key: testSettingKey,
        setting_value: testSettingValue
      })
      .select()
    
    if (insertError) {
      console.log('❌ Error inserting value:', insertError)
      return
    }
    
    console.log('✅ Setting inserted successfully:', insertData)
    
    // Test getting the value
    console.log('📖 Testing getSetting...')
    const { data: getData, error: getError } = await supabase
      .from('user_settings')
      .select('setting_value')
      .eq('user_id', testUserId)
      .eq('setting_key', testSettingKey)
    
    if (getError) {
      console.log('❌ Error getting value:', getError)
      return
    }
    
    console.log('✅ Setting retrieved successfully:', getData)
    
    // Clean up test data
    console.log('🧹 Cleaning up test data...')
    const { error: deleteError } = await supabase
      .from('user_settings')
      .delete()
      .eq('user_id', testUserId)
    
    if (deleteError) {
      console.log('⚠️ Warning: Could not clean up test data:', deleteError)
    }
    
    console.log('🎉 All user settings tests passed!')
    
  } catch (err) {
    console.log('💥 Network error:', err.message)
    console.log('Full error:', err)
  }
}

testUserSettings()