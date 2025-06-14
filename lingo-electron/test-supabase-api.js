// Simple test script to check Supabase API connection
const https = require('https');

console.log('🔗 Testing Supabase API connection...');

const options = {
  hostname: 'hycnrtpnqwwoofhtkye.supabase.co',
  port: 443,
  path: '/rest/v1/vocabulary?select=*',
  method: 'GET',
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5Y25ydHBucXd3b29maHRreWVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4MTUyMzUsImV4cCI6MjA2NTM5MTIzNX0.ou9NatHQ16Tm_2YKHVIQOY9StJfUN08mla2QGud3ulk',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5Y25ydHBucXd3b29maHRreWVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4MTUyMzUsImV4cCI6MjA2NTM5MTIzNX0.ou9NatHQ16Tm_2YKHVIQOY9StJfUN08mla2QGud3ulk'
  }
};

const req = https.request(options, (res) => {
  console.log(`🔢 Status Code: ${res.statusCode}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ Connection successful!');
      try {
        const jsonData = JSON.parse(data);
        console.log(`📊 Data received: ${jsonData.length} records`);
        console.log(JSON.stringify(jsonData, null, 2).substring(0, 500) + '...');
      } catch (e) {
        console.log('⚠️ Could not parse JSON response');
        console.log(data.substring(0, 500) + '...');
      }
    } else {
      console.log('❌ Connection failed with status code:', res.statusCode);
      console.log('📋 Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error connecting to Supabase API:', error.message);
  console.error('🔍 Full error details:', error);
});

req.end();