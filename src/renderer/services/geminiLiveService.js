import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiLiveService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.chat = null;
    this.isActive = false;
    this.sessionId = null;
    this.eventListeners = {
      message: [],
      error: [],
      close: []
    };
    this.apiKey = null;
  }

  // Initialize the service with API key
  async initialize(apiKey) {
    try {
      if (!apiKey) {
        throw new Error('Gemini API key is required');
      }

      this.apiKey = apiKey;
      this.genAI = new GoogleGenerativeAI(apiKey);
      
      // Use Gemini 1.5 Flash for real-time conversations
      this.model = this.genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        systemInstruction: {
          role: 'system',
          parts: [{
            text: 'You are a helpful language learning assistant. Provide conversational responses that help users practice their target language. Keep responses natural, engaging, and educational. Correct mistakes gently and offer alternatives when appropriate.'
          }]
        }
      });

      console.log('Gemini Live Service initialized successfully');
      return { success: true };
    } catch (error) {
      console.error('Failed to initialize Gemini Live Service:', error);
      return { success: false, error: error.message };
    }
  }

  // Start a live conversation session with STT/TTS
  async startLiveSession(options = {}) {
    try {
      if (!this.model) {
        throw new Error('Service not initialized. Call initialize() first.');
      }

      if (this.isActive) {
        throw new Error('Live session already active');
      }

      // Start a new chat session with conversation-optimized settings
      this.chat = this.model.startChat({
        history: [],
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.maxOutputTokens || 1024,
          topK: 40,
          topP: 0.95,
        },
        systemInstruction: {
          role: 'system',
          parts: [{
            text: `You are a helpful language learning assistant engaged in a live voice conversation. Keep your responses:
- Conversational and natural
- Concise but informative (1-3 sentences typically)
- Encouraging and supportive
- Focused on helping the user practice ${options.targetLanguage || 'English'}
- Appropriate for ${options.userLevel || 'intermediate'} level
- Gently correct mistakes when needed
- Ask follow-up questions to keep the conversation flowing`
          }]
        }
      });

      this.isActive = true;
      this.sessionId = `live_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Auto-start speech recognition if requested
      if (options.autoStartSTT !== false) {
        setTimeout(() => {
          this.startSpeechRecognition({
            language: options.language || 'en-US'
          });
        }, 500);
      }

      console.log('Live session with STT/TTS started:', this.sessionId);
      return { success: true, sessionId: this.sessionId };
    } catch (error) {
      console.error('Failed to start live session:', error);
      this.emit('error', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  // Send a message and get streaming response with automatic TTS
  async sendMessage(message, options = {}) {
    try {
      if (!this.isActive || !this.chat) {
        throw new Error('No active live session');
      }

      console.log('Sending message to Gemini:', message);

      // Send message and get streaming response
      const result = await this.chat.sendMessageStream(message);
      
      let fullResponse = '';
      
      // Process streaming chunks
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;
        
        // Emit streaming message
        this.emit('message', {
          type: 'text',
          content: fullResponse,
          isComplete: false,
          chunk: chunkText,
          timestamp: new Date().toISOString()
        });
      }

      // Emit final complete message
      this.emit('message', {
        type: 'text',
        content: fullResponse,
        isComplete: true,
        timestamp: new Date().toISOString()
      });

      // Automatically play TTS for the complete response
      if (fullResponse.trim() && options.autoTTS !== false) {
        setTimeout(() => {
          this.playTTS(fullResponse, {
            rate: 0.9,
            pitch: 1.0,
            volume: 0.8
          });
        }, 100); // Small delay to ensure UI updates first
      }

      console.log('Message sent successfully, response received');
      return { success: true, response: fullResponse };
    } catch (error) {
      console.error('Failed to send message:', error);
      this.emit('error', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  // Send audio data (for future voice input support)
  async sendAudio(audioData, options = {}) {
    try {
      if (!this.isActive) {
        throw new Error('No active live session');
      }

      // For now, we'll convert audio to text using Web Speech API
      // In the future, this could use Gemini's audio capabilities
      console.log('Audio input received, converting to text...');
      
      // Placeholder for audio-to-text conversion
      // This would need to be implemented with actual speech recognition
      const transcribedText = await this.transcribeAudio(audioData);
      
      if (transcribedText) {
        return await this.sendMessage(transcribedText, options);
      }
      
      return { success: false, error: 'Failed to transcribe audio' };
    } catch (error) {
      console.error('Failed to send audio:', error);
      this.emit('error', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  // Placeholder for audio transcription
  async transcribeAudio(audioData) {
    // This would implement actual speech-to-text
    // For now, return null to indicate not implemented
    console.log('Audio transcription not yet implemented');
    return null;
  }

  // End the live session and cleanup STT/TTS
  async endLiveSession() {
    try {
      if (!this.isActive) {
        return { success: true, message: 'No active session to end' };
      }

      // Stop speech recognition
      this.stopSpeechRecognition();
      
      // Stop any ongoing TTS
      this.stopTTS();

      this.isActive = false;
      this.chat = null;
      const sessionId = this.sessionId;
      this.sessionId = null;

      this.emit('close', { sessionId });
      
      console.log('Live session with STT/TTS ended:', sessionId);
      return { success: true, sessionId };
    } catch (error) {
      console.error('Failed to end live session:', error);
      return { success: false, error: error.message };
    }
  }

  // Event listener management
  on(event, callback) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].push(callback);
    }
  }

  off(event, callback) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    }
  }

  emit(event, data) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Utility methods
  isSessionActive() {
    return this.isActive;
  }

  getSessionId() {
    return this.sessionId;
  }

  getStatus() {
    return {
      isActive: this.isActive,
      sessionId: this.sessionId,
      hasApiKey: !!this.apiKey,
      isInitialized: !!this.model
    };
  }

  // Configuration methods
  updateSettings(settings) {
    if (this.chat && settings.temperature !== undefined) {
      // Update generation config if needed
      console.log('Updating live session settings:', settings);
    }
  }

  // Get conversation history
  getHistory() {
    if (this.chat && this.chat.history) {
      return this.chat.history;
    }
    return [];
  }

  // Clear conversation history
  clearHistory() {
    if (this.chat) {
      this.chat = this.model.startChat({
        history: [],
        generationConfig: this.chat.generationConfig
      });
    }
  }

  // Enhanced Text-to-Speech functionality with realistic voices
  async playTTS(text, options = {}) {
    try {
      if (!text) return { success: false, error: 'No text provided' };
      
      // Stop any current speech
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
      
      // Use Web Speech API for TTS
      if ('speechSynthesis' in window) {
        // Wait for voices to load
        await this.waitForVoices();
        
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Configure for more natural speech
        utterance.rate = options.rate || 0.9; // Slightly slower for clarity
        utterance.pitch = options.pitch || 1.0;
        utterance.volume = options.volume || 0.8;
        utterance.lang = options.language || 'en-US';
        
        // Select the best available voice
        const voices = speechSynthesis.getVoices();
        let selectedVoice = null;
        
        // Priority order for realistic voices
        const preferredVoices = [
          'Google US English', 'Microsoft Zira', 'Microsoft David',
          'Alex', 'Samantha', 'Victoria', 'Karen', 'Moira'
        ];
        
        // Try to find a preferred voice
        for (const voiceName of preferredVoices) {
          selectedVoice = voices.find(voice => 
            voice.name.toLowerCase().includes(voiceName.toLowerCase()) &&
            voice.lang.startsWith('en')
          );
          if (selectedVoice) break;
        }
        
        // Fallback to any English voice
        if (!selectedVoice) {
          selectedVoice = voices.find(voice => 
            voice.lang.startsWith('en') && !voice.localService
          ) || voices.find(voice => voice.lang.startsWith('en'));
        }
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
          console.log('Using voice:', selectedVoice.name);
        }
        
        // Set up event handlers
        utterance.onstart = () => {
          console.log('TTS started');
          this.emit('tts-start', { text });
        };
        
        utterance.onend = () => {
          console.log('TTS ended');
          this.emit('tts-end', { text });
        };
        
        utterance.onerror = (error) => {
          console.error('TTS error:', error);
          this.emit('tts-error', { error: error.error });
        };
        
        // Speak the text
        speechSynthesis.speak(utterance);
        
        return new Promise((resolve) => {
          utterance.onend = () => resolve({ success: true });
          utterance.onerror = (error) => resolve({ success: false, error: error.error });
        });
      } else {
        throw new Error('Speech synthesis not supported');
      }
    } catch (error) {
      console.error('TTS error:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Helper method to wait for voices to load
  async waitForVoices() {
    return new Promise((resolve) => {
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        resolve(voices);
      } else {
        speechSynthesis.onvoiceschanged = () => {
          resolve(speechSynthesis.getVoices());
        };
      }
    });
  }
  
  // Get available voices
  getAvailableVoices() {
    return speechSynthesis.getVoices().filter(voice => voice.lang.startsWith('en'));
  }
  
  // Stop current TTS
  stopTTS() {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      this.emit('tts-stopped', {});
    }
  }

  // Enhanced Speech-to-Text functionality with continuous listening
  async startSpeechRecognition(options = {}) {
    try {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        throw new Error('Speech recognition not supported');
      }
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      // Configure recognition for real-time conversation
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = options.language || 'en-US';
      this.recognition.maxAlternatives = 1;
      
      // Set up event handlers
      this.recognition.onstart = () => {
        console.log('Speech recognition started');
        this.emit('stt-start', { status: 'listening' });
      };
      
      this.recognition.onresult = async (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Emit interim results for real-time feedback
        if (interimTranscript) {
          this.emit('stt-interim', { transcript: interimTranscript });
        }
        
        // Process final transcript
        if (finalTranscript.trim()) {
          console.log('Final transcript:', finalTranscript);
          this.emit('stt-final', { transcript: finalTranscript });
          
          // Send to Gemini and get response
          try {
            const response = await this.sendMessage(finalTranscript.trim());
            // TTS will be handled by the message event listener
          } catch (error) {
            console.error('Error processing speech:', error);
            this.emit('error', { error: error.message });
          }
        }
      };
      
      this.recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        this.emit('stt-error', { error: event.error });
        
        // Auto-restart on certain errors
        if (event.error === 'no-speech' || event.error === 'audio-capture') {
          setTimeout(() => {
            if (this.recognition && this.isActive) {
              this.recognition.start();
            }
          }, 1000);
        }
      };
      
      this.recognition.onend = () => {
        console.log('Speech recognition ended');
        this.emit('stt-end', { status: 'stopped' });
        
        // Auto-restart if session is still active
        if (this.isActive && this.recognition) {
          setTimeout(() => {
            try {
              this.recognition.start();
            } catch (error) {
              console.log('Recognition restart failed:', error);
            }
          }, 100);
        }
      };
      
      // Start recognition
      this.recognition.start();
      
      return { success: true, message: 'Speech recognition started' };
    } catch (error) {
      console.error('Speech recognition error:', error);
      return { success: false, error: error.message };
    }
  }

  // Stop speech recognition
  stopSpeechRecognition() {
    if (this.recognition) {
      this.recognition.stop();
      this.recognition = null;
      this.emit('stt-stopped', {});
    }
  }
  
  // Toggle speech recognition
  toggleSpeechRecognition(options = {}) {
    if (this.recognition) {
      this.stopSpeechRecognition();
      return { success: true, status: 'stopped' };
    } else {
      return this.startSpeechRecognition(options);
    }
  }
  
  // Check if speech recognition is active
  isSpeechRecognitionActive() {
    return !!this.recognition;
  }

  // Start session (alias for startLiveSession for compatibility)
  async startSession(options = {}) {
    return await this.startLiveSession(options);
  }

  // End session (alias for endLiveSession for compatibility)
  async endSession() {
    return await this.endLiveSession();
  }

  // Message event handler (for compatibility)
  onMessage(callback) {
    this.on('message', callback);
  }

  // Error event handler (for compatibility)
  onError(callback) {
    this.on('error', callback);
  }

  // Close event handler (for compatibility)
  onClose(callback) {
    this.on('close', callback);
  }
}

// Create and export a singleton instance
const geminiLiveService = new GeminiLiveService();
export default geminiLiveService;