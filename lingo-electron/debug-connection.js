require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

console.log('Environment variables:')
console.log('URL:', process.env.VITE_SUPABASE_URL)
console.log('Key length:', process.env.VITE_SUPABASE_ANON_KEY?.length)
console.log('Key starts with:', process.env.VITE_SUPABASE_ANON_KEY?.substring(0, 10))

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function testConnection() {
  try {
    console.log('\nTesting basic connection...')
    const { data, error } = await supabase
      .from('user_settings')
      .select('count')
      .limit(1)
    
    if (error) {
      console.log('Supabase error:', error)
    } else {
      console.log('Connection successful:', data)
    }
  } catch (err) {
    console.log('Network error:', err.message)
    console.log('Full error:', err)
  }
}

testConnection()