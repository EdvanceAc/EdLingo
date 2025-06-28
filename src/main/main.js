const { app, BrowserWindow, ipcMain, Menu, shell } = require('electron');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const isDev = process.env.NODE_ENV === 'development';
const databaseService = require('../services/databaseService');
const geminiService = require('./geminiService');

// Suppress util._extend deprecation warning
process.noDeprecation = true;

// Enhanced GPU and cache handling
if (process.env.DISABLE_GPU === 'true') {
  app.disableHardwareAcceleration();
  console.log('Hardware acceleration disabled via DISABLE_GPU environment variable');
} else {
  // Add command line switches for better cache and GPU handling
  app.commandLine.appendSwitch('--disable-gpu-sandbox');
  app.commandLine.appendSwitch('--disable-software-rasterizer');
  app.commandLine.appendSwitch('--disable-background-timer-throttling');
  app.commandLine.appendSwitch('--disable-backgrounding-occluded-windows');
  app.commandLine.appendSwitch('--disable-renderer-backgrounding');
  
  // Improve cache performance
  app.commandLine.appendSwitch('--disk-cache-size', '50000000'); // 50MB cache
  app.commandLine.appendSwitch('--media-cache-size', '25000000'); // 25MB media cache
}

// Handle GPU process crashes and cache issues
app.on('child-process-gone', (event, details) => {
  console.log('Child process gone:', details.type, details.reason);
  if (details.type === 'GPU') {
    console.log('GPU process crashed, continuing with software rendering');
  }
});

// Handle renderer process crashes
app.on('render-process-gone', (event, webContents, details) => {
  console.log('Renderer process gone:', details.reason);
  if (details.reason === 'crashed') {
    console.log('Renderer crashed, reloading...');
    webContents.reload();
  }
});

// Keep a global reference of the window object to prevent garbage collection
let mainWindow;

// Create the browser window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 940,
    minHeight: 600,
    backgroundColor: '#ffffff',
    titleBarStyle: 'hiddenInset', // Gives a more modern look on macOS
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/preload.js'),
      spellcheck: true
    },
    // Modern, minimal design with subtle frame
    frame: true,
    show: false, // Don't show until ready-to-show
    icon: path.join(__dirname, '../../assets/icons/icon.png')
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:3002');
    // Open DevTools in development mode
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
  }

  // Show window when ready to prevent flickering
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  // Create application menu
  createMenu();
}

// Create the application menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { role: 'close' }
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click: async () => {
            await shell.openExternal('https://lingo-app.com');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC handlers for communication with renderer process
function setupIPC() {
  // ==================== DATABASE OPERATIONS ====================
  
  // User management
  ipcMain.handle('db:createUser', async (event, userData) => {
    try {
      const userId = databaseService.createUser(userData);
      return { success: true, userId };
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:getUserById', async (event, userId) => {
    try {
      const user = databaseService.getUserById(userId);
      return { success: true, user };
    } catch (error) {
      console.error('Error getting user:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:getUserByUsername', async (event, username) => {
    try {
      const user = databaseService.getUserByUsername(username);
      return { success: true, user };
    } catch (error) {
      console.error('Error getting user by username:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:updateUser', async (event, userId, updates) => {
    try {
      const result = databaseService.updateUser(userId, updates);
      return { success: true, result };
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, error: error.message };
    }
  });

  // Progress management
  ipcMain.handle('db:getUserProgress', async (event, userId) => {
    try {
      const progress = databaseService.getUserProgress(userId);
      return { success: true, progress };
    } catch (error) {
      console.error('Error getting user progress:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:updateUserProgress', async (event, userId, updates) => {
    try {
      const result = databaseService.updateUserProgress(userId, updates);
      return { success: true, result };
    } catch (error) {
      console.error('Error updating user progress:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:addXP', async (event, userId, xpAmount) => {
    try {
      const result = databaseService.addXP(userId, xpAmount);
      return { success: true, result };
    } catch (error) {
      console.error('Error adding XP:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:updateStreak', async (event, userId, newStreak) => {
    try {
      const result = databaseService.updateStreak(userId, newStreak);
      return { success: true, result };
    } catch (error) {
      console.error('Error updating streak:', error);
      return { success: false, error: error.message };
    }
  });

  // Vocabulary management
  ipcMain.handle('db:addVocabulary', async (event, wordData) => {
    try {
      const result = databaseService.addVocabulary(wordData);
      return { success: true, result };
    } catch (error) {
      console.error('Error adding vocabulary:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:getVocabularyByLanguage', async (event, language, limit, offset) => {
    try {
      const vocabulary = databaseService.getVocabularyByLanguage(language, limit, offset);
      return { success: true, vocabulary };
    } catch (error) {
      console.error('Error getting vocabulary:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:addUserVocabulary', async (event, userId, vocabularyId) => {
    try {
      const result = databaseService.addUserVocabulary(userId, vocabularyId);
      return { success: true, result };
    } catch (error) {
      console.error('Error adding user vocabulary:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:updateUserVocabulary', async (event, userId, vocabularyId, updates) => {
    try {
      const result = databaseService.updateUserVocabulary(userId, vocabularyId, updates);
      return { success: true, result };
    } catch (error) {
      console.error('Error updating user vocabulary:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:getVocabularyDueForReview', async (event, userId, limit) => {
    try {
      const vocabulary = databaseService.getVocabularyDueForReview(userId, limit);
      return { success: true, vocabulary };
    } catch (error) {
      console.error('Error getting vocabulary due for review:', error);
      return { success: false, error: error.message };
    }
  });

  // Chat management
  ipcMain.handle('db:createChatConversation', async (event, userId, title, language, scenario) => {
    try {
      const result = databaseService.createChatConversation(userId, title, language, scenario);
      return { success: true, conversationId: result.lastInsertRowid };
    } catch (error) {
      console.error('Error creating chat conversation:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:addChatMessage', async (event, conversationId, sender, message, corrections, feedback) => {
    try {
      const result = databaseService.addChatMessage(conversationId, sender, message, corrections, feedback);
      return { success: true, messageId: result.lastInsertRowid };
    } catch (error) {
      console.error('Error adding chat message:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:getChatConversations', async (event, userId, limit) => {
    try {
      const conversations = databaseService.getChatConversations(userId, limit);
      return { success: true, conversations };
    } catch (error) {
      console.error('Error getting chat conversations:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:getChatMessages', async (event, conversationId, limit) => {
    try {
      const messages = databaseService.getChatMessages(conversationId, limit);
      return { success: true, messages };
    } catch (error) {
      console.error('Error getting chat messages:', error);
      return { success: false, error: error.message };
    }
  });

  // Settings management
  ipcMain.handle('db:setSetting', async (event, userId, key, value) => {
    try {
      const result = databaseService.setSetting(userId, key, value);
      return { success: true, result };
    } catch (error) {
      console.error('Error setting user setting:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:getSetting', async (event, userId, key) => {
    try {
      const value = databaseService.getSetting(userId, key);
      return { success: true, value };
    } catch (error) {
      console.error('Error getting user setting:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:getAllSettings', async (event, userId) => {
    try {
      const settings = databaseService.getAllSettings(userId);
      return { success: true, settings };
    } catch (error) {
      console.error('Error getting all user settings:', error);
      return { success: false, error: error.message };
    }
  });

  // Study session management
  ipcMain.handle('db:startStudySession', async (event, userId, sessionType) => {
    try {
      const result = databaseService.startStudySession(userId, sessionType);
      return { success: true, sessionId: result.lastInsertRowid };
    } catch (error) {
      console.error('Error starting study session:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:endStudySession', async (event, sessionId, duration, xpEarned, activitiesCompleted, accuracyPercentage) => {
    try {
      const result = databaseService.endStudySession(sessionId, duration, xpEarned, activitiesCompleted, accuracyPercentage);
      return { success: true, result };
    } catch (error) {
      console.error('Error ending study session:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:getStudyStats', async (event, userId, days) => {
    try {
      const stats = databaseService.getStudyStats(userId, days);
      return { success: true, stats };
    } catch (error) {
      console.error('Error getting study stats:', error);
      return { success: false, error: error.message };
    }
  });

  // Database utilities
  ipcMain.handle('db:getStats', async () => {
    try {
      const stats = databaseService.getStats();
      return { success: true, stats };
    } catch (error) {
      console.error('Error getting database stats:', error);
      return { success: false, error: error.message };
    }
  });

  // Theme management (using database settings)
  ipcMain.handle('theme:get', async (event) => {
    try {
      // Use a default UUID for theme settings until user authentication is implemented
      const defaultUserId = '00000000-0000-0000-0000-000000000000';
      const result = await databaseService.getSetting(defaultUserId, 'theme');
      return { success: true, theme: result || 'light' };
    } catch (error) {
      console.error('Error getting theme:', error);
      return { success: false, error: error.message, theme: 'light' };
    }
  });

  ipcMain.handle('theme:set', async (event, userId, theme) => {
    try {
      const result = await databaseService.setSetting(userId, 'theme', theme);
      return { success: true, result };
    } catch (error) {
      console.error('Error setting theme:', error);
      return { success: false, error: error.message };
    }
  });

  // Legacy progress handlers (for backward compatibility)
  // DEPRECATED: These methods will be removed in a future version
  ipcMain.handle('progress:save', async (event, progressData) => {
    console.warn('⚠️  DEPRECATED: progress:save is deprecated. Use db:updateUserProgress instead.');
    console.warn('   Migration guide: Replace progress:save with db:updateUserProgress');
    
    // Attempt to migrate to new method if user ID is available
    if (progressData && progressData.userId) {
      try {
        const result = databaseService.updateUserProgress(progressData.userId, progressData);
        return { success: true, migrated: true, result };
      } catch (error) {
        console.error('Failed to migrate legacy progress save:', error);
        return { success: false, error: 'Migration failed', legacy: true };
      }
    }
    
    return { success: true, legacy: true, warning: 'No migration performed - missing userId' };
  });

  ipcMain.handle('progress:load', async (event, userId) => {
    console.warn('⚠️  DEPRECATED: progress:load is deprecated. Use db:getUserProgress instead.');
    console.warn('   Migration guide: Replace progress:load with db:getUserProgress');
    
    // Attempt to migrate to new method if user ID is provided
    if (userId) {
      try {
        const progress = databaseService.getUserProgress(userId);
        return {
          ...progress,
          migrated: true,
          warning: 'Loaded via deprecated method - please update your code'
        };
      } catch (error) {
        console.error('Failed to migrate legacy progress load:', error);
      }
    }
    
    // Fallback to default values
    return {
      currentLesson: 1,
      completedLessons: [],
      streakDays: 0,
      totalXP: 0,
      legacy: true,
      warning: 'Using default values - please migrate to db:getUserProgress'
    };
  });

  // Window controls
  ipcMain.handle('window:minimize', async () => {
    const window = BrowserWindow.getFocusedWindow();
    if (window) window.minimize();
  });

  ipcMain.handle('window:maximize', async () => {
    const window = BrowserWindow.getFocusedWindow();
    if (window) {
      if (window.isMaximized()) {
        window.unmaximize();
      } else {
        window.maximize();
      }
    }
  });

  ipcMain.handle('window:close', async () => {
    const window = BrowserWindow.getFocusedWindow();
    if (window) window.close();
  });

  // App version
  ipcMain.handle('app:version', async () => {
    return app.getVersion();
  });

  // AI Service handlers
  ipcMain.handle('ai:generateResponse', async (event, userMessage, conversationContext, options = {}) => {
    try {
      
      const {
        maxTokens = 150,
        temperature = 0.7,
        systemPrompt = 'You are a helpful language learning assistant. Provide encouraging, educational responses that help users learn and practice languages. Keep responses concise and engaging.'
      } = options;

      // Build messages array
      const messages = [];
      
      // Add system message
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }
      
      // Add conversation context (last 6 messages)
      const recentContext = conversationContext.slice(-6);
      messages.push(...recentContext);
      
      // Add current user message
      messages.push({ role: 'user', content: userMessage });

      // Generate response using Gemini
      const aiResponse = await geminiService.generateResponse(messages, {
        maxTokens,
        temperature,
        systemPrompt
      });
      
      return { success: true, response: aiResponse };
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      let errorMessage = 'I\'m sorry, I encountered an error while processing your message. Please try again.';
      
      if (error.message.includes('API key')) {
        errorMessage = 'AI service configuration error. Please check your API key settings.';
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        errorMessage = 'AI service quota exceeded. Please try again later.';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Unable to connect to AI service. Please check your internet connection.';
      }
      
      return { 
        success: false, 
        error: error.message,
        response: errorMessage
      };
    }
  });

  ipcMain.handle('ai:generateLanguageLearningResponse', async (event, userMessage, learningContext) => {
    try {
      
      // Generate response using Gemini service
      const aiResponse = await geminiService.generateLanguageLearningResponse(userMessage, learningContext);
      
      return { success: true, response: aiResponse };
    } catch (error) {
      console.error('Error generating language learning response:', error);
      
      let errorMessage = 'I\'m sorry, I encountered an error while processing your message. Please try again.';
      
      if (error.message.includes('API key')) {
        errorMessage = 'AI service configuration error. Please check your API key settings.';
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        errorMessage = 'AI service quota exceeded. Please try again later.';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Unable to connect to AI service. Please check your internet connection.';
      }
      
      return { 
        success: false, 
        error: error.message,
        response: errorMessage
      };
    }
  });

  // Handle streaming AI response generation
  ipcMain.handle('ai:generateResponseStream', async (event, messages, options = {}) => {
    try {
      const stream = await geminiService.generateResponseStream(messages, options);
      
      // Send chunks as they arrive
      for await (const chunk of stream) {
        event.sender.send('ai:streamChunk', {
          text: chunk.text(),
          isComplete: false
        });
      }
      
      // Signal completion
      event.sender.send('ai:streamChunk', {
        text: '',
        isComplete: true
      });
      
      return { success: true };
    } catch (error) {
      console.error('Streaming error:', error);
      event.sender.send('ai:streamError', { error: error.message });
      return { error: error.message };
    }
  });

  // Store active live sessions
  const activeSessions = new Map();

  // Handle live session creation
  ipcMain.handle('ai:startLiveSession', async (event, options) => {
    try {
      const sessionOptions = {
        ...options,
        onMessage: (message) => {
          if (message && typeof message === 'object') {
            console.log('Live session message received:', message.type || 'unknown');
            event.sender.send('ai:liveMessage', message);
          } else {
            console.warn('Invalid live message received:', message);
          }
        },
        onError: (error) => {
          console.error('Live session error:', error);
          event.sender.send('ai:liveError', error);
        },
        onClose: (closeEvent) => {
          console.log('Live session closed:', closeEvent);
          event.sender.send('ai:liveClose', closeEvent);
        }
      };
      
      const session = await geminiService.startLiveSession(sessionOptions);
      const sessionId = session?.id || Date.now().toString();
      
      // Store session reference
      activeSessions.set(sessionId, session);
      
      return { success: true, sessionId };
    } catch (error) {
      console.error('Live session error:', error);
      return { error: error.message };
    }
  });

  // Handle sending messages to live session
  ipcMain.handle('ai:sendLiveMessage', async (event, sessionId, message) => {
    try {
      // Validate message before processing
      if (!message || typeof message !== 'string') {
        console.warn('Invalid message format:', message);
        return { error: 'Invalid message format' };
      }
      
      // Get the session from stored references
      const session = activeSessions.get(sessionId);
      if (!session) {
        return { error: 'Session not found' };
      }
      
      console.log('Sending live message:', message.substring(0, 100) + (message.length > 100 ? '...' : ''));
      
      // Send message through the live session
      const result = await geminiService.handleLiveMessage(session, message);
      return { success: result.success, messageId: Date.now().toString() };
    } catch (error) {
      console.error('Error sending live message:', error);
      return { error: error.message };
    }
  });

  // Audio processing
  ipcMain.handle('process-audio', async (event, audioData) => {
    try {
      // This would integrate with your audio processing service
      console.log('Processing audio data');
      // TODO: Implement actual audio processing logic
      return { success: true, processed: true };
    } catch (error) {
      console.error('Error processing audio:', error);
      return { success: false, error: error.message };
    }
  });

  // File operations
  ipcMain.handle('dialog:openFile', async () => {
    try {
      const { dialog } = require('electron');
      const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
          { name: 'All Files', extensions: ['*'] },
          { name: 'Text Files', extensions: ['txt'] },
          { name: 'Audio Files', extensions: ['mp3', 'wav', 'ogg'] }
        ]
      });
      return { success: true, filePaths: result.filePaths, canceled: result.canceled };
    } catch (error) {
      console.error('Error opening file dialog:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('dialog:saveFile', async (event, data) => {
    try {
      const { dialog } = require('electron');
      const fs = require('fs').promises;
      
      const result = await dialog.showSaveDialog({
        filters: [
          { name: 'Text Files', extensions: ['txt'] },
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });
      
      if (!result.canceled && result.filePath) {
        await fs.writeFile(result.filePath, data);
        return { success: true, filePath: result.filePath };
      }
      
      return { success: false, canceled: true };
    } catch (error) {
      console.error('Error saving file:', error);
      return { success: false, error: error.message };
    }
  });

  // App version (fix handler name mismatch)
  ipcMain.handle('app:getVersion', async () => {
    return app.getVersion();
  });

  // Speech and pronunciation
  ipcMain.handle('speech:startRecording', async () => {
    try {
      // TODO: Implement speech recording functionality
      console.log('Starting speech recording...');
      return { success: true, recording: true };
    } catch (error) {
      console.error('Error starting recording:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('speech:stopRecording', async () => {
    try {
      // TODO: Implement speech recording stop functionality
      console.log('Stopping speech recording...');
      return { success: true, recording: false, audioData: null };
    } catch (error) {
      console.error('Error stopping recording:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('audio:play', async (event, audioUrl) => {
    try {
      // TODO: Implement audio playback functionality
      console.log('Playing audio:', audioUrl);
      return { success: true, playing: true };
    } catch (error) {
      console.error('Error playing audio:', error);
      return { success: false, error: error.message };
    }
  });

  // Vocabulary management (enhanced)
  ipcMain.handle('vocabulary:add', async (event, word) => {
    try {
      // TODO: Implement vocabulary addition logic
      console.log('Adding vocabulary word:', word);
      return { success: true, wordId: Date.now() };
    } catch (error) {
      console.error('Error adding vocabulary:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('vocabulary:get', async () => {
    try {
      // TODO: Implement vocabulary retrieval logic
      console.log('Getting vocabulary words...');
      return { success: true, words: [] };
    } catch (error) {
      console.error('Error getting vocabulary:', error);
      return { success: false, error: error.message };
    }
  });

  // Grammar exercises
  ipcMain.handle('grammar:getExercises', async () => {
    try {
      // TODO: Implement grammar exercises retrieval
      console.log('Getting grammar exercises...');
      return { success: true, exercises: [] };
    } catch (error) {
      console.error('Error getting grammar exercises:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('grammar:submitAnswer', async (event, answer) => {
    try {
      // TODO: Implement grammar answer submission logic
      console.log('Submitting grammar answer:', answer);
      return { success: true, correct: true, feedback: 'Good job!' };
    } catch (error) {
      console.error('Error submitting grammar answer:', error);
      return { success: false, error: error.message };
    }
  });

  // Settings (enhanced)
  ipcMain.handle('settings:get', async (event, key) => {
    try {
      // Use default user ID until authentication is implemented
      const defaultUserId = '00000000-0000-0000-0000-000000000000';
      const value = await databaseService.getSetting(defaultUserId, key);
      return { success: true, value };
    } catch (error) {
      console.error('Error getting setting:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('settings:set', async (event, key, value) => {
    try {
      // Use default user ID until authentication is implemented
      const defaultUserId = '00000000-0000-0000-0000-000000000000';
      const result = await databaseService.setSetting(defaultUserId, key, value);
      return { success: true, result };
    } catch (error) {
      console.error('Error setting setting:', error);
      return { success: false, error: error.message };
    }
  });

  // Notifications
  ipcMain.handle('notification:show', async (event, title, body) => {
    try {
      const { Notification } = require('electron');
      
      if (Notification.isSupported()) {
        const notification = new Notification({ title, body });
        notification.show();
        return { success: true, shown: true };
      } else {
        console.warn('Notifications not supported on this platform');
        return { success: false, error: 'Notifications not supported' };
      }
    } catch (error) {
      console.error('Error showing notification:', error);
      return { success: false, error: error.message };
    }
  });

  // Legacy AI chat handler (for backward compatibility)
  ipcMain.handle('ai-chat', async (event, message) => {
    console.warn('⚠️  DEPRECATED: ai-chat is deprecated. Use ai:generateResponse instead.');
    try {
      // Forward to new handler
      const result = await geminiService.generateResponse([{ role: 'user', content: message }]);
      return { success: true, response: result };
    } catch (error) {
      console.error('Error in legacy AI chat:', error);
      return { success: false, error: error.message };
    }
  });
}

// Initialize the app
app.whenReady().then(async () => {
  try {
    console.log('🚀 Starting Lingo Electron Application...');
    
    // Initialize database
    console.log('📊 Initializing database...');
    await databaseService.initialize();
    console.log('✅ Database initialized successfully');
    
    // Initialize Gemini service
    console.log('🤖 Initializing Gemini service...');
    await geminiService.initialize();
    console.log('✅ Gemini service initialized successfully');
    
    // Create application components
    console.log('🪟 Creating application window...');
    createWindow();
    setupIPC();
    
    console.log('🎉 Application started successfully!');
    
    // Log system information for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Development mode - Additional logging enabled');
      console.log('📍 Working directory:', process.cwd());
      console.log('🖥️  Platform:', process.platform);
      console.log('⚡ Electron version:', process.versions.electron);
      console.log('🟢 Node version:', process.versions.node);
      console.log('🌐 Chrome version:', process.versions.chrome);
    }
    
  } catch (error) {
    console.error('❌ Failed to initialize application:', error);
    console.error('Stack trace:', error.stack);
    
    // Show error dialog in development
    if (process.env.NODE_ENV === 'development') {
      const { dialog } = require('electron');
      dialog.showErrorBox('Application Startup Error', 
        `Failed to initialize application:\n\n${error.message}\n\nCheck the console for more details.`);
    }
    
    app.quit();
  }
  
  // On macOS, recreate window when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Close database connection before quitting
    databaseService.close();
    app.quit();
  }
});

// Handle app quit event to ensure database is closed
app.on('before-quit', () => {
  databaseService.close();
});