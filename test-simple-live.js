require('dotenv').config();
const WebSocket = require('ws');

console.log('🎤 Testing Gemini Live API with corrected format...');

async function testSimpleLive() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      console.error('❌ GEMINI_API_KEY not configured in .env file');
      return;
    }

    console.log('🔑 API key found, connecting to Live API...');
    
    // Correct WebSocket URL format from official docs
    const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${apiKey}`;
    
    const ws = new WebSocket(url);
    
    ws.on('open', () => {
      console.log('🔌 WebSocket connected!');
      
      // Send setup message exactly as shown in official documentation
      const setupMessage = {
        setup: {
          model: 'models/gemini-2.0-flash-exp',
          generationConfig: {
            responseModalities: ['TEXT', 'AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: 'Aoede'
                }
              }
            }
          },
          systemInstruction: {
            parts: [{
              text: 'You are a helpful language learning assistant.'
            }]
          }
        }
      };
      
      console.log('📤 Sending setup message...');
      console.log('Setup:', JSON.stringify(setupMessage, null, 2));
      ws.send(JSON.stringify(setupMessage));
    });
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log('📥 Received message type:', Object.keys(message)[0]);
        
        if (message.setupComplete) {
          console.log('✅ Setup completed! Sending test message...');
          
          // Send a test message using the correct format
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
        
      } catch (error) {
        console.error('❌ Error parsing message:', error);
        console.log('Raw message:', data.toString());
      }
    });
    
    ws.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
    });
    
    ws.on('close', (code, reason) => {
      console.log(`🔌 WebSocket closed: ${code} ${reason}`);
      if (code === 1007) {
        console.log('💡 Error 1007: Invalid argument in request');
        console.log('   - Check API key validity');
        console.log('   - Verify setup message format');
        console.log('   - Ensure model name is correct');
      }
    });
    
    // Keep the connection alive for testing
    await new Promise(resolve => {
      setTimeout(() => {
        console.log('⏰ Test timeout, closing connection...');
        ws.close();
        resolve();
      }, 15000);
    });
    
  } catch (error) {
    console.error('❌ Error testing Gemini Live API:', error.message);
  }
}

// Run the test
testSimpleLive().then(() => {
  console.log('\n🏁 Test completed.');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});