require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function testSupabaseUpload() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase credentials in environment variables.');
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const testContent = 'This is a test file for Supabase Storage.';
    const testFilePath = path.join(__dirname, 'test-file.txt');
    fs.writeFileSync(testFilePath, testContent);

    const fileBuffer = fs.readFileSync(testFilePath);
    const { data, error } = await supabase.storage
      .from('course-materials')
      .upload('test/test-file.txt', fileBuffer, {
        contentType: 'text/plain'
      });

    if (error) {
      console.error('❌ Upload failed:', error.message);
    } else {
      console.log('✅ Upload successful!', data);
    }

    fs.unlinkSync(testFilePath);
  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
}

testSupabaseUpload();