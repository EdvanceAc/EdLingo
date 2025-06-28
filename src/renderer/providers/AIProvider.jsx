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
    model: 'onnx-community/Qwen2.5-Coder-0.5B-Instruct'
  });
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    loadAISettings();
  }, []);

  const loadAISettings = async () => {
    try {
      const settings = await window.electronAPI?.getAiSettings?.() || {};
      setAiSettings(prev => ({
        ...prev,
        provider: settings.provider || 'transformers',
        apiKey: settings.apiKey || '',
        model: settings.model || 'onnx-community/Qwen2.5-Coder-0.5B-Instruct'
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
      await aiService.initialize();
      setAiStatus('ready');
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
      const response = await aiService.generateLanguageLearningResponse(message, {
        targetLanguage: options.targetLanguage || 'English',
        userLevel: options.userLevel || 'intermediate',
        focusArea: options.focusArea || 'conversation'
      });

      // Update conversation history
      const newHistory = [
        ...conversationHistory.slice(-8), // Keep last 8 messages
        { role: 'user', content: message, timestamp: new Date() },
        { role: 'assistant', content: response, timestamp: new Date() }
      ];
      setConversationHistory(newHistory);

      return response;
    } catch (error) {
      console.error('Failed to generate AI response:', error);
      throw error;
    }
  };

  const analyzeText = async (text) => {
    if (aiStatus !== 'ready') {
      return aiService.analyzeText(text); // Use fallback analysis
    }

    try {
      return await aiService.analyzeText(text);
    } catch (error) {
      console.error('Failed to analyze text:', error);
      throw error;
    }
  };

  const clearConversationHistory = () => {
    setConversationHistory([]);
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
    
    // Utilities
    getStatusMessage: () => {
      switch (aiStatus) {
        case 'ready': return 'AI Ready';
        case 'initializing': return 'Loading AI...';
        case 'error': return 'AI Error';
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
    }
  };

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
};

export default AIProvider;