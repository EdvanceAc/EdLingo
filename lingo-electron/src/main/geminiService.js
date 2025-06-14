const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GoogleAuth } = require('google-auth-library');
const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const LiveSession = require('./LiveSession');

class GeminiService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.vertexAI = null;
    this.isInitialized = false;
    this.useVertexAI = false;
  }

  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      // Check if we should use Vertex AI or regular Gemini API
      const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
      const geminiApiKey = process.env.GEMINI_API_KEY;

      if (projectId && !geminiApiKey) {
        // Use Vertex AI
        await this.initializeVertexAI(projectId);
      } else if (geminiApiKey) {
        // Use regular Gemini API
        await this.initializeGeminiAPI(geminiApiKey);
      } else {
        throw new Error('Either GEMINI_API_KEY or GOOGLE_CLOUD_PROJECT_ID must be configured');
      }

      this.isInitialized = true;
      console.log(`Gemini service initialized successfully using ${this.useVertexAI ? 'Vertex AI' : 'Gemini API'}`);
    } catch (error) {
      console.error('Failed to initialize Gemini service:', error);
      throw error;
    }
  }

  async initializeGeminiAPI(apiKey) {
    this.apiKey = apiKey; // Store API key for Live API usage
    this.genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    this.model = this.genAI.getGenerativeModel({ model: modelName });
    this.useVertexAI = false;
  }

  async initializeVertexAI(projectId) {
    // For Vertex AI, we'll use the same GoogleGenerativeAI but with auth
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    
    const authClient = await auth.getClient();
    const accessToken = await authClient.getAccessToken();
    
    if (!accessToken.token) {
      throw new Error('Failed to get access token for Vertex AI');
    }

    // Note: For Vertex AI, you would typically use a different endpoint
    // This is a simplified implementation
    this.useVertexAI = true;
    this.vertexAuth = authClient;
    
    // For now, we'll still use the regular API but with proper auth
    // In a full implementation, you'd use the Vertex AI endpoint
    console.log('Vertex AI authentication successful');
  }

  async generateResponse(messages, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const {
        maxTokens = 150,
        temperature = 0.7,
        systemPrompt = 'You are a helpful language learning assistant.'
      } = options;

      // Convert messages to Gemini format
      const prompt = this.formatMessagesForGemini(messages, systemPrompt);

      // Configure generation settings
      const generationConfig = {
        maxOutputTokens: maxTokens,
        temperature: temperature,
      };

      if (this.useVertexAI) {
        return await this.generateWithVertexAI(prompt, generationConfig);
      } else {
        return await this.generateWithGeminiAPI(prompt, generationConfig);
      }
    } catch (error) {
      console.error('Error generating response with Gemini:', error);
      throw error;
    }
  }

  async generateWithGeminiAPI(prompt, generationConfig) {
    const result = await this.model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig
    });

    const response = await result.response;
    return response.text();
  }

  async generateWithVertexAI(prompt, generationConfig) {
    // For Vertex AI implementation, you would make a direct API call
    // to the Vertex AI endpoint with proper authentication
    // This is a placeholder implementation
    
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const location = process.env.VERTEX_AI_LOCATION || 'us-central1';
    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    
    // In a real implementation, you would use the Vertex AI REST API
    // For now, we'll fall back to the regular API
    console.log('Using Vertex AI endpoint (placeholder implementation)');
    return await this.generateWithGeminiAPI(prompt, generationConfig);
  }

  formatMessagesForGemini(messages, systemPrompt) {
    // Gemini doesn't have a separate system role, so we'll prepend the system prompt
    let prompt = systemPrompt ? `${systemPrompt}\n\n` : '';
    
    // Convert conversation history to a single prompt
    for (const message of messages) {
      if (message.role === 'system') {
        // Skip system messages as we've already included the system prompt
        continue;
      } else if (message.role === 'user') {
        prompt += `User: ${message.content}\n`;
      } else if (message.role === 'assistant') {
        prompt += `Assistant: ${message.content}\n`;
      }
    }
    
    return prompt.trim();
  }

  async generateLanguageLearningResponse(userMessage, learningContext = {}) {
    const {
      targetLanguage = 'English',
      userLevel = 'intermediate',
      focusArea = 'conversation'
    } = learningContext;

    const systemPrompt = `You are an expert language learning tutor specializing in ${targetLanguage}. 
The user is at ${userLevel} level and wants to focus on ${focusArea}. 
Provide helpful, encouraging responses that:
- Correct any grammar mistakes gently
- Suggest better vocabulary when appropriate
- Ask follow-up questions to continue the conversation
- Provide cultural context when relevant
- Keep responses concise but educational
- Always be supportive and encouraging`;

    const messages = [{ role: 'user', content: userMessage }];
    
    return await this.generateResponse(messages, {
      maxTokens: 200,
      temperature: 0.8,
      systemPrompt
    });
  }

  isReady() {
    return this.isInitialized;
  }

  getStatus() {
    if (this.isInitialized) return 'ready';
    return 'not_initialized';
  }

  getProvider() {
    return this.useVertexAI ? 'vertex-ai' : 'gemini-api';
  }

  // Traditional text streaming
  async generateResponseStream(messages, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const {
        maxTokens = 150,
        temperature = 0.7,
        systemPrompt = 'You are a helpful language learning assistant.'
      } = options;

      const prompt = this.formatMessagesForGemini(messages, systemPrompt);
      
      const generationConfig = {
        maxOutputTokens: maxTokens,
        temperature: temperature,
      };

      if (this.useVertexAI) {
        // For Vertex AI, streaming would need different implementation
        throw new Error('Streaming not yet implemented for Vertex AI');
      } else {
        const result = await this.model.generateContentStream({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig
        });
        
        return result; // This returns an async iterator
      }
    } catch (error) {
      console.error('Error generating streaming response:', error);
      throw error;
    }
  }

  // Live session methods
  async startLiveSession(options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const {
        model = 'gemini-2.0-flash-exp',
        responseModalities = ['TEXT', 'AUDIO'],
        systemInstruction = 'You are a helpful language learning assistant. Respond naturally and conversationally.',
        onMessage,
        onError,
        onClose
      } = options;

      // Create WebSocket connection to Gemini Live API
      const liveSession = new LiveSession({
        apiKey: this.apiKey,
        model,
        responseModalities,
        systemInstruction,
        onMessage,
        onError,
        onClose
      });

      await liveSession.connect();
      
      return liveSession;
    } catch (error) {
      console.error('Error starting live session:', error);
      throw error;
    }
  }

  async handleLiveMessage(session, message) {
    try {
      if (!session || !session.connected) {
        throw new Error('Live session not connected');
      }

      await session.sendMessage(message);
      
      return { 
        success: true
      };
    } catch (error) {
      console.error('Error handling live message:', error);
      throw error;
    }
  }

  // Handle audio data from live session
  handleAudioData(inlineData) {
    try {
      const fileName = `audio_${Date.now()}.wav`;
      const audioDir = path.join(app.getPath('userData'), 'audio');
      
      // Ensure audio directory exists
      if (!fs.existsSync(audioDir)) {
        fs.mkdirSync(audioDir, { recursive: true });
      }

      const filePath = path.join(audioDir, fileName);
      const buffer = this.convertToWav([inlineData.data], inlineData.mimeType);
      
      fs.writeFileSync(filePath, buffer);
      console.log(`Audio saved to: ${filePath}`);
      
      return filePath;
    } catch (error) {
      console.error('Error handling audio data:', error);
    }
  }

  // Convert audio data to WAV format
  convertToWav(rawData, mimeType) {
    const options = this.parseMimeType(mimeType);
    const dataLength = rawData.reduce((a, b) => a + Buffer.from(b, 'base64').length, 0);
    const wavHeader = this.createWavHeader(dataLength, options);
    const buffer = Buffer.concat(rawData.map(data => Buffer.from(data, 'base64')));

    return Buffer.concat([wavHeader, buffer]);
  }

  // Parse MIME type for audio conversion
  parseMimeType(mimeType) {
    const [fileType, ...params] = mimeType.split(';').map(s => s.trim());
    const [_, format] = fileType.split('/');

    const options = {
      numChannels: 1,
      bitsPerSample: 16,
      sampleRate: 24000 // Default sample rate
    };

    if (format && format.startsWith('L')) {
      const bits = parseInt(format.slice(1), 10);
      if (!isNaN(bits)) {
        options.bitsPerSample = bits;
      }
    }

    for (const param of params) {
      const [key, value] = param.split('=').map(s => s.trim());
      if (key === 'rate') {
        options.sampleRate = parseInt(value, 10);
      }
    }

    return options;
  }

  // Create WAV header for audio files
  createWavHeader(dataLength, options) {
    const {
      numChannels,
      sampleRate,
      bitsPerSample,
    } = options;

    const byteRate = sampleRate * numChannels * bitsPerSample / 8;
    const blockAlign = numChannels * bitsPerSample / 8;
    const buffer = Buffer.alloc(44);

    buffer.write('RIFF', 0);                      // ChunkID
    buffer.writeUInt32LE(36 + dataLength, 4);     // ChunkSize
    buffer.write('WAVE', 8);                      // Format
    buffer.write('fmt ', 12);                     // Subchunk1ID
    buffer.writeUInt32LE(16, 16);                 // Subchunk1Size (PCM)
    buffer.writeUInt16LE(1, 20);                  // AudioFormat (1 = PCM)
    buffer.writeUInt16LE(numChannels, 22);        // NumChannels
    buffer.writeUInt32LE(sampleRate, 24);         // SampleRate
    buffer.writeUInt32LE(byteRate, 28);           // ByteRate
    buffer.writeUInt16LE(blockAlign, 32);         // BlockAlign
    buffer.writeUInt16LE(bitsPerSample, 34);      // BitsPerSample
    buffer.write('data', 36);                     // Subchunk2ID
    buffer.writeUInt32LE(dataLength, 40);         // Subchunk2Size

    return buffer;
  }
}

module.exports = new GeminiService();