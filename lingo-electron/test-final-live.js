require('dotenv').config();
const WebSocket = require('ws');

console.log('🎤 Testing Gemini Live API with corrected setup format...');

async function testGeminiLive() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      console.error('❌ GEMINI_API_KEY not configured in .env file');
      return;
    }

    console.log('🔑 API key found, connecting to Live API...');
    
    // Official WebSocket URL from documentation
    const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${apiKey}`;
    
    const ws = new WebSocket(url);
    
    ws.on('open', () => {
      console.log('🔌 WebSocket connected!');
      
      // Send setup message with simplified format based on documentation
      const setupMessage = {
        setup: {
          model: 'models/gemini-2.0-flash-live-001',
          generationConfig: {
            responseModalities: ['TEXT', 'AUDIO']
          }
        }
      };
      
      console.log('📤 Sending simplified setup message...');
      console.log('Setup:', JSON.stringify(setupMessage, null, 2));
      ws.send(JSON.stringify(setupMessage));
    });
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log('📥 Received message:', JSON.stringify(message, null, 2));
        
        if (message.setupComplete) {
          console.log('✅ Setup completed successfully! Sending test message...');
          
          // Send a test message
          const clientMessage = {
            clientContent: {
              turns: [{
                role: 'user',
                parts: [{
                  text: 'Hello! Can you help me practice English?'
                }]
              }],
              turnComplete: true
            }
          };
          
          console.log('📤 Sending client message...');
          ws.send(JSON.stringify(clientMessage));
        }
        
        if (message.serverContent) {
          console.log('🎯 Got server response!');
          if (message.serverContent.modelTurn) {
            const parts = message.serverContent.modelTurn.parts;
            if (parts) {
              parts.forEach(part => {
                if (part.text) {
                  console.log('📝 Text response:', part.text);
                }
                if (part.inlineData) {
                  console.log('🔊 Audio response received (', part.inlineData.data.length, 'bytes)');
                }
              });
            }
          }
        }
        
        if (message.toolCall) {
          console.log('🔧 Tool call received:', message.toolCall);
        }
        
      } catch (error) {
        console.error('❌ Error parsing message:', error);
        console.log('Raw message:', data.toString().substring(0, 500) + '...');
      }
    });
    
    ws.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
    });
    
    ws.on('close', (code, reason) => {
      console.log(`🔌 WebSocket closed: ${code} ${reason}`);
      if (code === 1000) {
        console.log('✅ Normal closure - connection completed successfully');
      } else if (code === 1007) {
        console.log('💡 Error 1007: Invalid argument in request');
        console.log('   - Check setup message format and required fields');
      } else if (code === 1008) {
        console.log('💡 Error 1008: Policy violation - model not found or not supported');
        console.log('   - The model may not be available for bidiGenerateContent');
      } else {
        console.log('💡 Unexpected closure code:', code);
      }
    });
    
    // Keep the connection alive for testing
    await new Promise(resolve => {
      setTimeout(() => {
        console.log('⏰ Test completed, closing connection...');
        ws.close(1000, 'Test completed');
        resolve();
      }, 15000); // Shorter timeout for quicker testing
    });
    
  } catch (error) {
    console.error('❌ Error testing Gemini Live API:', error.message);
  }
}

// Run the test
testGeminiLive().then(() => {
  console.log('\n🏁 Gemini Live API test completed.');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});