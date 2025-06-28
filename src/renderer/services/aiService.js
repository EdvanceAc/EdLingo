class AIService {
  constructor() {
    this.hfClient = null;
    this.isInitialized = false;
    this.isInitializing = false;
    this.initializationPromise = null;
    this.modelName = 'microsoft/mai-ds-r1:free';
    this.browserMode = false; // Will be set during initialization
  }

  async initialize() {
    if (this.isInitialized) {
      return;
    }

    if (this.isInitializing) {
      return this.initializationPromise;
    }

    this.isInitializing = true;
    this.initializationPromise = this._initializeModels();
    
    try {
      await this.initializationPromise;
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize AI models:', error);
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  async _initializeModels() {
    try {
      console.log('Initializing AI service...');
      
      // Debug: Check what's available in window
      console.log('window.electronAPI:', typeof window.electronAPI);
      console.log('window.electronAPI exists:', !!window.electronAPI);
      if (window.electronAPI) {
        console.log('electronAPI methods:', Object.keys(window.electronAPI));
      }
      
      // Check if we're in Electron environment
      if (!window.electronAPI) {
        console.warn('Running in browser mode - AI features will use fallback responses');
        this.browserMode = true;
      } else {
        console.log('Running in Electron mode - using Google Gemini API');
        this.browserMode = false;
      }
      
      console.log('AI service initialized successfully');
    } catch (error) {
      console.error('Error initializing AI service:', error);
      throw error;
    }
  }

  async generateResponse(userMessage, conversationContext = [], options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // If in browser mode, return fallback response
    if (this.browserMode) {
      return this._generateFallbackResponse(userMessage, options);
    }

    try {
      // Use IPC to communicate with main process for AI generation
      const result = await window.electronAPI.invoke('ai:generateResponse', userMessage, conversationContext, options);
      
      if (result.success) {
        return result.response;
      } else {
        console.error('AI generation failed:', result.error);
        return result.response || 'I\'m sorry, I encountered an error while processing your message. Please try again.';
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      return 'I\'m sorry, I encountered an error while processing your message. Please try again.';
    }
  }

  async generateLanguageLearningResponse(userMessage, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Extract options with defaults
    const chatMode = options.focusArea || options.mode || 'conversation';
    const userLevel = options.userLevel || 'beginner';
    const targetLanguage = options.targetLanguage || 'English';

    // If in browser mode, return fallback response
    if (this.browserMode) {
      return this._generateLanguageLearningFallback(userMessage, chatMode, userLevel, targetLanguage);
    }

    try {
      // Use IPC to communicate with main process for AI generation
      const result = await window.electronAPI.invoke('ai:generateLanguageLearningResponse', userMessage, {
        focusArea: chatMode,
        userLevel: userLevel,
        targetLanguage: targetLanguage
      });
      
      if (result.success) {
        return result.response;
      } else {
        console.error('AI generation failed:', result.error);
        return 'I\'m sorry, I\'m having trouble generating a response right now. Please try again later.';
      }
    } catch (error) {
      console.error('Error generating language learning response:', error);
      return 'I\'m sorry, I\'m having trouble generating a response right now. Please try again later.';
    }
  }

  async analyzeText(text) {
    // Basic text analysis for fallback
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const avgWordsPerSentence = sentences > 0 ? Math.round(wordCount / sentences) : 0;
    
    // Simple grammar suggestions (very basic)
    const suggestions = [];
    if (text.includes(' i ') || text.startsWith('i ')) {
      suggestions.push('Remember to capitalize "I" when referring to yourself.');
    }
    if (!text.match(/[.!?]$/)) {
      suggestions.push('Consider ending your sentence with proper punctuation.');
    }
    
    return {
      wordCount,
      sentences,
      avgWordsPerSentence,
      suggestions,
      complexity: wordCount > 20 ? 'complex' : wordCount > 10 ? 'medium' : 'simple'
    };
  }

  _generateFallbackResponse(userMessage, options = {}) {
    const responses = [
      "That's interesting! Can you tell me more about that?",
      "I understand. How does that make you feel?",
      "That's a good point. What do you think about it?",
      "Thanks for sharing that with me. What would you like to discuss next?",
      "I see. Can you give me an example?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  _generateLanguageLearningFallback(userMessage, chatMode, userLevel, targetLanguage) {
    const message = userMessage.toLowerCase();
    
    // Handle greetings
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'];
    const isGreeting = greetings.some(greeting => message.includes(greeting));
    
    if (isGreeting) {
      return "Hello! 👋 It's great to chat with you. How are you feeling today? Let's practice some conversation! (Note: \"Hi\" is perfect for casual situations. For more formal settings, like emails or meeting someone new, \"Hello\" is more appropriate.)";
    }
    
    // Handle grammar questions
    if (message.includes('grammar') || message.includes('difference between') || message.includes('when to use') || message.includes('correct')) {
      if (message.includes('good') && message.includes('well')) {
        return "Great question! 'Good' is an adjective (describes nouns): 'This is a good book.' 'Well' is an adverb (describes verbs): 'You speak English well.' Remember: You feel good (not well) when you're happy, but you're doing well (not good) at something!";
      }
      if (message.includes('a') && message.includes('an')) {
        return "Excellent question! Use 'a' before consonant sounds: 'a book', 'a university' (sounds like 'you'). Use 'an' before vowel sounds: 'an apple', 'an hour' (silent 'h'). It's about the sound, not just the letter!";
      }
      if (message.includes('past') || message.includes('tense')) {
        return "Good grammar question! For regular verbs, add -ed: walk → walked. For irregular verbs, they change completely: go → went, see → saw. Practice tip: Try making sentences with both forms!";
      }
      return "That's a thoughtful grammar question! Remember to pay attention to verb tenses, subject-verb agreement, and word order. Can you give me a specific example you'd like help with?";
    }
    
    // Handle vocabulary questions
    if (message.includes('vocabulary') || message.includes('word') || message.includes('meaning') || message.includes('synonym')) {
      return "Great vocabulary practice! Building your word bank is essential. Try using new words in sentences, learn synonyms, and practice with context. What specific words would you like to explore?";
    }
    
    // Handle pronunciation questions
    if (message.includes('pronunciation') || message.includes('pronounce') || message.includes('sound')) {
      return "Pronunciation is so important! Focus on stress patterns, vowel sounds, and consonant clusters. Practice speaking slowly at first, then build up speed. Record yourself to hear your progress!";
    }
    
    // Default responses based on mode
    const responses = {
      conversation: [
        "That's wonderful! Can you tell me more about that? Try to use descriptive words and express your thoughts clearly.",
        "I find that very interesting. What's your opinion on this topic? Remember to give reasons for your thoughts.",
        "Great point! Can you give me a specific example? This will help you practice storytelling and details.",
        "I understand. How does that make you feel? Practice using emotion words like 'excited', 'concerned', or 'curious'."
      ],
      grammar: [
        "Let me help you with that! Try rephrasing your sentence using different word order or verb forms.",
        "Good attempt! Remember to check your verb tenses - are you talking about past, present, or future?",
        "Nice work! Pay attention to subject-verb agreement. Singular subjects need singular verbs.",
        "Well done! Consider using connecting words like 'because', 'however', 'therefore', or 'although'."
      ],
      vocabulary: [
        "Excellent! Let's expand your vocabulary. Can you think of a synonym (similar word) for that?",
        "Great word choice! Now try using it in a completely different context or situation.",
        "Perfect! Can you create a sentence using that word in past tense? Challenge yourself!",
        "Wonderful! What's the opposite (antonym) of that word? This helps build word relationships."
      ]
    };
    
    const modeResponses = responses[chatMode] || responses.conversation;
    return modeResponses[Math.floor(Math.random() * modeResponses.length)];
  }

  isReady() {
    return this.isInitialized;
  }

  getStatus() {
    if (this.isInitialized) return 'ready';
    if (this.isInitializing) return 'initializing';
    return 'not_initialized';
  }
}

// Create a singleton instance
const aiService = new AIService();

export default aiService;