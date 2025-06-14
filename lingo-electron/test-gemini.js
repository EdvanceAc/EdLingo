require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

console.log('🔗 Testing Google Gemini API connection...');

async function testGeminiAPI() {
  try {
    // Check if API key is configured
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      console.error('❌ GEMINI_API_KEY not configured in .env file');
      console.log('Please set your Gemini API key in the .env file:');
      console.log('GEMINI_API_KEY=your_actual_api_key_here');
      console.log('\nGet your API key from: https://aistudio.google.com/app/apikey');
      return;
    }

    console.log('🔑 API key found, testing connection...');
    
    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' 
    });

    // Test with a simple prompt
    const prompt = 'Hello! Please respond with "Gemini API is working correctly!"';
    
    console.log('📤 Sending test message...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('📥 Response received:');
    console.log('Response:', text);
    console.log('✅ Google Gemini API is working correctly!');
    
    // Test language learning specific prompt
    console.log('\n🎓 Testing language learning prompt...');
    const learningPrompt = 'You are a language learning tutor. Help me practice English conversation. Respond to: "Hello, how are you today?"';
    
    const learningResult = await model.generateContent(learningPrompt);
    const learningResponse = await learningResult.response;
    const learningText = learningResponse.text();
    
    console.log('Learning Response:', learningText);
    console.log('✅ Language learning functionality working!');
    
  } catch (error) {
    console.error('❌ Error testing Gemini API:', error.message);
    
    if (error.message.includes('API_KEY_INVALID')) {
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Check that your API key is correct');
      console.log('2. Make sure the API key has proper permissions');
      console.log('3. Verify the API key is active at: https://aistudio.google.com/app/apikey');
    } else if (error.message.includes('quota') || error.message.includes('limit')) {
      console.log('\n🔧 Quota/Limit Issue:');
      console.log('1. You may have exceeded your API quota');
      console.log('2. Check your usage at: https://aistudio.google.com/');
      console.log('3. Consider upgrading your plan if needed');
    } else if (error.message.includes('PERMISSION_DENIED')) {
      console.log('\n🔧 Permission Issue:');
      console.log('1. Make sure the Gemini API is enabled for your project');
      console.log('2. Check your API key permissions');
    } else {
      console.log('\n🔧 General troubleshooting:');
      console.log('1. Check your internet connection');
      console.log('2. Verify your .env file configuration');
      console.log('3. Make sure @google/generative-ai package is installed');
    }
  }
}

// Test Vertex AI if configured
async function testVertexAI() {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  
  if (!projectId || projectId === 'your_project_id_here') {
    console.log('\n🔵 Vertex AI not configured (optional)');
    console.log('To use Vertex AI, set GOOGLE_CLOUD_PROJECT_ID in .env and run:');
    console.log('gcloud auth application-default login');
    return;
  }
  
  console.log('\n🔵 Testing Vertex AI configuration...');
  
  try {
    const { GoogleAuth } = require('google-auth-library');
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    
    const authClient = await auth.getClient();
    const accessToken = await authClient.getAccessToken();
    
    if (accessToken.token) {
      console.log('✅ Vertex AI authentication successful!');
      console.log('Project ID:', projectId);
      console.log('Location:', process.env.VERTEX_AI_LOCATION || 'us-central1');
    } else {
      console.log('❌ Failed to get Vertex AI access token');
    }
  } catch (error) {
    console.log('❌ Vertex AI authentication failed:', error.message);
    console.log('Run: gcloud auth application-default login');
  }
}

// Run tests
async function runTests() {
  await testGeminiAPI();
  await testVertexAI();
  
  console.log('\n🏁 Test completed!');
  console.log('\nNext steps:');
  console.log('1. If tests passed, your Gemini integration is ready!');
  console.log('2. Start your Electron app to test the full integration');
  console.log('3. Check the AI chat functionality in the app');
}

runTests();