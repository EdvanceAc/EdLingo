require('dotenv').config();
const LiveSession = require('./src/main/LiveSession');
const WebSocket = require('ws');

// Make WebSocket available globally for LiveSession
global.WebSocket = WebSocket;

console.log('🎤 Testing Gemini Live API functionality...');

async function testGeminiLive() {
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

    console.log('🔑 API key found, testing Live API connection...');
    
    // Create a Live Session
    const liveSession = new LiveSession({
      apiKey: apiKey,
      model: 'gemini-2.0-flash-exp',
      responseModalities: ['TEXT', 'AUDIO'],
      systemInstruction: 'You are a helpful language learning assistant. Respond briefly and naturally.',
      onMessage: (message) => {
        console.log('📥 Received message:', message.type);
        if (message.type === 'text') {
          console.log('Text response:', message.content);
        } else if (message.type === 'audio') {
          console.log('Audio response received (', message.content.length, 'bytes)');
        }
      },
      onError: (error) => {
        console.error('❌ Live session error:', error);
      },
      onClose: (code, reason) => {
        console.log('🔌 Live session closed:', code, reason);
      }
    });

    console.log('🔗 Connecting to Gemini Live API...');
    
    // Set up connection promise
    const connectionPromise = new Promise((resolve, reject) => {
      const originalOnMessage = liveSession.onMessage;
      liveSession.onMessage = (message) => {
        if (message.type === 'setupComplete') {
          console.log('✅ Setup completed, connection ready!');
          resolve();
        }
        if (originalOnMessage) originalOnMessage(message);
      };
      
      const originalOnError = liveSession.onError;
      liveSession.onError = (error) => {
        console.error('❌ Connection error:', error);
        reject(error);
        if (originalOnError) originalOnError(error);
      };
      
      // Timeout after 10 seconds
      setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 10000);
    });
    
    await liveSession.connect();
    console.log('🔌 WebSocket connected, waiting for setup...');
    
    // Wait for setup to complete
    await connectionPromise;
    
    // Send a test message
    console.log('📤 Sending test message...');
    await liveSession.sendMessage('Hello! Can you help me practice English conversation?');
    
    // Wait for response
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('✅ Gemini Live API test completed successfully!');
    
    // Close the session
    if (liveSession.ws) {
      liveSession.ws.close();
    }
    
  } catch (error) {
    console.error('❌ Error testing Gemini Live API:', error.message);
    console.error('Full error:', error);
    
    if (error.message.includes('WebSocket')) {
      console.log('\n💡 This might be a network connectivity issue or API endpoint problem.');
      console.log('Make sure you have internet connection and the API key is valid.');
    }
  }
}

// Run the test
testGeminiLive().then(() => {
  console.log('\n🏁 Test completed.');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});