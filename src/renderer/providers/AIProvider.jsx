import React, { createContext, useContext, useState, useEffect } from 'react';
import aiService from '../services/aiService';

const AIContext = createContext();

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

export const AIProvider = ({ children }) => {
  const [aiStatus, setAiStatus] = useState('not_initialized');
  const [aiSettings, setAiSettings] = useState({
    provider: 'transformers',
    apiKey: '',
    model: 'onnx-community/Qwen2.5-Coder-0.5B-Instruct',
    geminiApiKey: '',
    useGemini: false
  });
  const [conversationHistory, setConversationHistory] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    loadAISettings();
  }, []);

  // Auto-initialize AI service when settings are loaded
  useEffect(() => {
    const autoInitializeAI = async () => {
      // Only auto-initialize if AI is not already initialized or initializing
      if (!isInitializing && aiStatus === 'not_initialized') {
        console.log('Auto-initializing AI service at startup...');
        try {
          await initializeAI();
        } catch (error) {
          console.warn('Auto-initialization failed, AI will initialize on first use:', error);
        }
      }
    };

    // Auto-initialize after a short delay to ensure settings are loaded
    const timeoutId = setTimeout(autoInitializeAI, 500);
    
    return () => clearTimeout(timeoutId);
  }, [aiStatus, isInitializing]);

  const loadAISettings = async () => {
    try {
      const settings = await window.electronAPI?.getAiSettings?.() || {};
      setAiSettings(prev => ({
        ...prev,
        provider: settings.provider || 'transformers',
        apiKey: settings.apiKey || '',
        model: settings.model || 'onnx-community/Qwen2.5-Coder-0.5B-Instruct',
        geminiApiKey: settings.geminiApiKey || '',
        useGemini: settings.useGemini || false
      }));
    } catch (error) {
      console.error('Failed to load AI settings:', error);
    }
  };

  const saveAISettings = async (newSettings) => {
    try {
      await window.electronAPI?.saveAiSettings?.(newSettings);
      setAiSettings(prev => ({ ...prev, ...newSettings }));
    } catch (error) {
      console.error('Failed to save AI settings:', error);
      throw error;
    }
  };

  const initializeAI = async () => {
    if (isInitializing || aiStatus === 'ready') return;
    
    setIsInitializing(true);
    setAiStatus('initializing');
    
    try {
      // Initialize AI service with Gemini options if available
      const initOptions = {};
      const envGeminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const geminiApiKey = aiSettings.geminiApiKey || envGeminiApiKey;
      
      if (geminiApiKey) {
        initOptions.geminiApiKey = geminiApiKey;
      }
      
      await aiService.initialize(initOptions);
      
      // Check if Gemini is available or fall back to backend
      const fullStatus = await aiService.getFullStatus();
      const isGeminiReady = fullStatus.gemini?.isReady || false;
      const isBackendReady = fullStatus.backend?.isReady || false;
      
      if (isGeminiReady || isBackendReady || aiService.browserMode) {
        setAiStatus('ready');
      } else {
        setAiStatus('error');
        throw new Error('No AI providers available');
      }
    } catch (error) {
      console.error('Failed to initialize AI:', error);
      setAiStatus('error');
      throw error;
    } finally {
      setIsInitializing(false);
    }
  };

  const generateResponse = async (message, options = {}) => {
    if (aiStatus !== 'ready') {
      throw new Error('AI service is not ready');
    }

    try {
      const result = await aiService.generateLanguageLearningResponse(message, {
        targetLanguage: options.targetLanguage || 'English',
        userLevel: options.userLevel || 'intermediate',
        focusArea: options.focusArea || 'conversation'
      });

      // Handle different response formats
      let response;
      let sessionId = currentSessionId;
      
      if (result && typeof result === 'object') {
        if (result.success) {
          response = result.response;
          // Update session ID if using Supabase Gemini service
          if (result.provider === 'supabase-gemini' && result.sessionId) {
            sessionId = result.sessionId;
            setCurrentSessionId(sessionId);
          }
        } else {
          response = result.response || result.error || 'Sorry, I encountered an error.';
        }
      } else {
        // Handle string responses from other providers
        response = result;
      }

      // Update conversation history
      const newHistory = [
        ...conversationHistory.slice(-8), // Keep last 8 messages
        { role: 'user', content: message, timestamp: new Date() },
        { role: 'assistant', content: response, timestamp: new Date(), sessionId }
      ];
      setConversationHistory(newHistory);

      return response;
    } catch (error) {
      console.error('Failed to generate AI response:', error);
      throw error;
    }
  };

  const analyzeText = async (text, options = {}) => {
    if (aiStatus !== 'ready') {
      return aiService.analyzeText(text, options); // Use fallback analysis
    }

    try {
      return await aiService.analyzeText(text, {
        targetLanguage: options.targetLanguage || 'English',
        type: options.type || 'grammar',
        ...options
      });
    } catch (error) {
      console.error('Failed to analyze text:', error);
      throw error;
    }
  };

  const clearConversationHistory = () => {
    setConversationHistory([]);
    setCurrentSessionId(null);
  };

  const startNewSession = () => {
    setCurrentSessionId(null);
    setConversationHistory([]);
  };

  const getCurrentSessionId = () => {
    return currentSessionId;
  };

  const configureGemini = async (apiKey) => {
    try {
      const result = await aiService.configureGemini(apiKey);
      if (result.success) {
        const newSettings = { ...aiSettings, geminiApiKey: apiKey, useGemini: true };
        await saveAISettings(newSettings);
        return { success: true };
      } else {
        return result;
      }
    } catch (error) {
      console.error('Failed to configure Gemini:', error);
      return { success: false, error: error.message };
    }
  };

  const disableGemini = async () => {
    try {
      aiService.disableGemini();
      const newSettings = { ...aiSettings, useGemini: false };
      await saveAISettings(newSettings);
    } catch (error) {
      console.error('Failed to disable Gemini:', error);
    }
  };

  const getConversationContext = (limit = 6) => {
    return conversationHistory.slice(-limit);
  };

  const value = {
    // Status
    aiStatus,
    isInitializing,
    isReady: aiStatus === 'ready',
    
    // Settings
    aiSettings,
    saveAISettings,
    loadAISettings,
    
    // AI Operations
    initializeAI,
    generateResponse,
    analyzeText,
    
    // Conversation Management
    conversationHistory,
    clearConversationHistory,
    getConversationContext,
    startNewSession,
    getCurrentSessionId,
    currentSessionId,
    
    // Utilities
    getStatusMessage: () => {
      switch (aiStatus) {
        case 'ready': return 'AI Ready';
        case 'initializing': return 'Loading AI...';
        case 'error': return 'AI Unavailable - Check API Key';
        default: return 'AI Offline';
      }
    },
    
    getStatusColor: () => {
      switch (aiStatus) {
        case 'ready': return 'text-green-500';
        case 'initializing': return 'text-yellow-500';
        case 'error': return 'text-red-500';
        default: return 'text-gray-400';
      }
    },
    
    // Gemini specific methods
    configureGemini,
    disableGemini,
    isGeminiAvailable: () => {
      // Check if Gemini API key is available in environment variables
      const envApiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (envApiKey) {
        return true;
      }
      // Fallback to aiService check
      return aiService.isGeminiAvailable();
    },
    getAIStatus: () => aiService.getFullStatus()
  };

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
};

export default AIProvider;