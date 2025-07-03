import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.chat = null;
    this.isInitialized = false;
    this.apiKey = null;
    this.modelName = 'gemini-1.5-flash';
  }

  async initialize(apiKey) {
    if (this.isInitialized && this.apiKey === apiKey) {
      return;
    }

    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }

    try {
      this.apiKey = apiKey;
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: this.modelName });
      
      // Test the connection with a simple request
      await this.model.generateContent('Hello');
      
      this.isInitialized = true;
      console.log('Gemini service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Gemini service:', error);
      this.isInitialized = false;
      throw new Error(`Gemini initialization failed: ${error.message}`);
    }
  }

  async startChat(options = {}) {
    if (!this.isInitialized) {
      throw new Error('Gemini service not initialized');
    }

    const chatConfig = {
      history: options.history || [],
      generationConfig: {
        temperature: options.temperature || 0.7,
        topK: options.topK || 40,
        topP: options.topP || 0.95,
        maxOutputTokens: options.maxOutputTokens || 1024,
      },
    };

    // Add system instruction for language learning
    if (options.systemInstruction) {
      // Format system instruction as a Content object with parts
      chatConfig.systemInstruction = {
        role: "model",
        parts: [{ text: typeof options.systemInstruction === 'string' ? options.systemInstruction : this._getLanguageLearningSystemInstruction(options) }]
      };
    } else {
      // Format default system instruction as a Content object with parts
      chatConfig.systemInstruction = {
        role: "model",
        parts: [{ text: this._getLanguageLearningSystemInstruction(options) }]
      };
    }

    this.chat = this.model.startChat(chatConfig);
    return this.chat;
  }

  async sendMessage(message, options = {}) {
    if (!this.chat) {
      await this.startChat(options);
    }

    try {
      const result = await this.chat.sendMessage(message);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error('Error sending message to Gemini:', error);
      throw new Error(`Failed to get response: ${error.message}`);
    }
  }

  async sendMessageStream(message, options = {}) {
    if (!this.chat) {
      await this.startChat(options);
    }

    try {
      const result = await this.chat.sendMessageStream(message);
      return result;
    } catch (error) {
      console.error('Error streaming message to Gemini:', error);
      throw new Error(`Failed to stream response: ${error.message}`);
    }
  }

  async generateLanguageLearningResponse(message, options = {}) {
    const {
      targetLanguage = 'English',
      userLevel = 'intermediate',
      focusArea = 'conversation',
      includeExplanations = true,
      includePronunciation = false
    } = options;

    const systemInstruction = this._getLanguageLearningSystemInstruction({
      targetLanguage,
      userLevel,
      focusArea,
      includeExplanations,
      includePronunciation
    });

    try {
      if (!this.chat) {
        await this.startChat({ systemInstruction });
      }

      const response = await this.sendMessage(message, { systemInstruction });
      return response;
    } catch (error) {
      console.error('Error generating language learning response:', error);
      throw error;
    }
  }

  async analyzeText(text, options = {}) {
    if (!this.isInitialized) {
      throw new Error('Gemini service not initialized');
    }

    const analysisPrompt = `
Analyze the following text for language learning purposes:

"${text}"

Provide analysis in the following JSON format:
{
  "wordCount": number,
  "sentences": number,
  "avgWordsPerSentence": number,
  "complexity": "simple" | "medium" | "complex",
  "grammarSuggestions": ["suggestion1", "suggestion2"],
  "vocabularyLevel": "beginner" | "intermediate" | "advanced",
  "improvements": ["improvement1", "improvement2"]
}

Only return the JSON, no additional text.`;

    try {
      const result = await this.model.generateContent(analysisPrompt);
      const response = result.response.text();
      
      // Try to parse JSON response
      try {
        return JSON.parse(response);
      } catch (parseError) {
        // Fallback to basic analysis if JSON parsing fails
        return this._basicTextAnalysis(text);
      }
    } catch (error) {
      console.error('Error analyzing text with Gemini:', error);
      return this._basicTextAnalysis(text);
    }
  }

  _getLanguageLearningSystemInstruction(options = {}) {
    const {
      targetLanguage = 'English',
      userLevel = 'intermediate',
      focusArea = 'conversation',
      includeExplanations = true,
      includePronunciation = false
    } = options;

    return `You are an expert ${targetLanguage} language learning assistant. Your role is to help users improve their ${targetLanguage} skills through interactive conversation and guidance.

User Profile:
- Target Language: ${targetLanguage}
- Current Level: ${userLevel}
- Focus Area: ${focusArea}

Instructions:
1. Always respond in ${targetLanguage}
2. Adapt your language complexity to the ${userLevel} level
3. Focus on ${focusArea} practice
4. ${includeExplanations ? 'Include brief explanations for grammar, vocabulary, or cultural context when helpful' : 'Keep responses conversational without explanations'}
5. ${includePronunciation ? 'Include pronunciation tips when relevant' : 'Focus on written communication'}
6. Be encouraging and supportive
7. Correct mistakes gently and provide better alternatives
8. Ask follow-up questions to keep the conversation flowing
9. Use examples and context to help understanding
10. Keep responses engaging and educational

Response Style:
- Be natural and conversational
- Use appropriate formality level
- Provide constructive feedback
- Encourage continued practice
- Make learning enjoyable`;
  }

  _basicTextAnalysis(text) {
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const wordCount = words.length;
    const sentenceCount = sentences.length;
    const avgWordsPerSentence = sentenceCount > 0 ? Math.round(wordCount / sentenceCount) : 0;
    
    // Basic complexity assessment
    let complexity = 'simple';
    if (wordCount > 50 || avgWordsPerSentence > 15) {
      complexity = 'complex';
    } else if (wordCount > 20 || avgWordsPerSentence > 10) {
      complexity = 'medium';
    }

    // Basic grammar suggestions
    const suggestions = [];
    if (text.includes(' i ') || text.startsWith('i ')) {
      suggestions.push('Remember to capitalize "I" when referring to yourself.');
    }
    if (!text.match(/[.!?]$/)) {
      suggestions.push('Consider ending your sentence with proper punctuation.');
    }
    if (text.includes('  ')) {
      suggestions.push('Avoid double spaces between words.');
    }

    return {
      wordCount,
      sentences: sentenceCount,
      avgWordsPerSentence,
      complexity,
      grammarSuggestions: suggestions,
      vocabularyLevel: complexity === 'simple' ? 'beginner' : complexity === 'medium' ? 'intermediate' : 'advanced',
      improvements: suggestions.length > 0 ? suggestions : ['Great job! Your text looks good.']
    };
  }

  getChatHistory() {
    if (!this.chat) {
      return [];
    }
    
    try {
      return this.chat.getHistory();
    } catch (error) {
      console.error('Error getting chat history:', error);
      return [];
    }
  }

  clearChat() {
    this.chat = null;
  }

  isReady() {
    return this.isInitialized;
  }

  getStatus() {
    if (this.isInitialized) return 'ready';
    return 'not_initialized';
  }

  getModel() {
    return this.modelName;
  }
}

// Create a singleton instance
const geminiService = new GeminiService();

export default geminiService;