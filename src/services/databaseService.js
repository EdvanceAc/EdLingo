const { app } = require('electron');
const path = require('path');
const fs = require('fs').promises;

// Constants for file names
const STORAGE_FILE = 'local-storage.json';
const TEMP_SUFFIX = '.tmp';

class StorageError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'StorageError';
    this.code = code;
  }
}

class DatabaseService {
  constructor() {
    this.isInitialized = false;
    this.userDataPath = app.getPath('userData');
    this.dbPath = path.join(this.userDataPath, 'edlingo.db');
    this.storagePath = path.join(this.userDataPath, STORAGE_FILE);
  }

  /**
   * Initialize the database service
   * @returns {Promise<boolean>}
   */
  async initialize() {
    try {
      // Ensure user data directory exists
      await this.ensureDirectoryExists(this.userDataPath);
      
      // Initialize local storage for offline support
      await this.initializeLocalStorage();
      
      this.isInitialized = true;
      console.log('Database service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize database service:', error);
      return false;
    }
  }

  /**
   * Ensure directory exists
   * @param {string} dirPath 
   */
  async ensureDirectoryExists(dirPath) {
    try {
      await fs.access(dirPath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        await fs.mkdir(dirPath, { recursive: true });
      } else {
        throw error;
      }
    }
  }

  /**
   * Initialize local storage with default structure
   * @returns {Promise<void>}
   */
  async initializeLocalStorage() {
    const storageStructure = this.getDefaultStorageStructure();
    const storagePath = path.join(this.userDataPath, 'local-storage.json');
    
    // Ensure the directory exists
    await this.ensureDirectoryExists(this.userDataPath);
    
    try {
      await fs.access(storagePath);
      // File exists, try to validate structure
      try {
        const fileContent = await fs.readFile(storagePath, 'utf8');
        if (!fileContent.trim()) {
          throw new Error('Empty file');
        }
        const existingData = JSON.parse(fileContent);
        // Merge with default structure to ensure all keys exist
        const mergedData = { ...storageStructure, ...existingData };
        await fs.writeFile(storagePath, JSON.stringify(mergedData, null, 2), 'utf8');
      } catch (parseError) {
        // File is corrupted, recreate it
        console.log('Corrupted storage file detected, recreating...');
        await fs.writeFile(storagePath, JSON.stringify(storageStructure, null, 2), 'utf8');
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, create it
        console.log('Creating new storage file...');
        await fs.writeFile(storagePath, JSON.stringify(storageStructure, null, 2), 'utf8');
      } else {
        // Other error, recreate the file
        console.log('Storage file error, recreating...');
        await fs.writeFile(storagePath, JSON.stringify(storageStructure, null, 2), 'utf8');
      }
    }
  }

  /**
   * Read local storage data
   * @returns {Promise<Object>}
   */
  async readLocalStorage() {
    const storagePath = path.join(this.userDataPath, 'local-storage.json');
    try {
      const data = await fs.readFile(storagePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to read local storage:', error);
      
      // If JSON is corrupted, recreate the file
      if (error instanceof SyntaxError) {
        console.log('Local storage corrupted, recreating...');
        await this.initializeLocalStorage();
        // Try reading again after recreation
        try {
          const newData = await fs.readFile(storagePath, 'utf8');
          return JSON.parse(newData);
        } catch (retryError) {
          console.error('Failed to read recreated storage:', retryError);
          return this.getDefaultStorageStructure();
        }
      }
      
      return this.getDefaultStorageStructure();
    }
  }

  /**
   * Get default storage structure
   * @returns {Object}
   */
  getDefaultStorageStructure() {
    return {
      userProfiles: {},
      userProgress: {},
      learningSessions: {},
      userVocabulary: {},
      conversationHistory: {},
      userAchievements: {},
      settings: {},
      vocabulary: {},
      syncQueue: [],
      lastSync: null,
      version: '1.0.0'
    };
  }

  /**
   * Write local storage data
   * @param {Object} data 
   * @returns {Promise<boolean>}
   */
  /**
   * Write local storage data with enhanced error handling
   * @param {Object} data 
   * @returns {Promise<boolean>}
   */
async writeLocalStorage(data) {
    const storagePath = this.storagePath;
    const tempPath = storagePath + TEMP_SUFFIX;
    
    try {
      // Ensure data is valid before writing
      if (!data || typeof data !== 'object') {
        data = this.getDefaultStorageStructure();
      }
      
      // Test JSON serialization first
      const jsonString = JSON.stringify(data, null, 2);
      
      // Write to temporary file first
      await fs.writeFile(tempPath, jsonString, 'utf8');
      
      // Verify temp file by reading and parsing
      const verification = await fs.readFile(tempPath, 'utf8');
      JSON.parse(verification); // This will throw if invalid
      
      // Check if temp file exists before rename
      try {
        await fs.access(tempPath);
      } catch (accessError) {
        throw new StorageError(`Temp file not found: ${accessError.message}`, 'TEMP_NOT_FOUND');
      }
      
      try {
        await fs.rename(tempPath, storagePath);
      } catch (renameError) {
        if (renameError.code === 'ENOENT') {
          console.error('Rename failed with ENOENT, attempting copy fallback');
          await fs.copyFile(tempPath, storagePath);
          await fs.unlink(tempPath);
        } else {
          throw renameError;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Failed to write local storage:', error);
      throw new StorageError('Write operation failed', 'WRITE_FAILED');
      
      // Clean up temp file if it exists
      try {
        await fs.unlink(tempPath);
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
      
      // Try to write default structure as fallback
      try {
        const defaultData = this.getDefaultStorageStructure();
        const defaultJson = JSON.stringify(defaultData, null, 2);
        await fs.writeFile(tempPath, defaultJson, 'utf8');
        await fs.rename(tempPath, storagePath);
        console.log('Wrote default storage structure as fallback');
        return true;
      } catch (fallbackError) {
        console.error('Failed to write fallback storage:', fallbackError);
        return false;
      }
    }
  }

  /**
   * Save user data to local storage
   * @param {string} userId 
   * @param {string} dataType 
   * @param {Object} data 
   * @returns {Promise<boolean>}
   */
  async saveUserData(userId, dataType, data) {
    try {
      const storage = await this.readLocalStorage();
      
      if (!storage[dataType]) {
        storage[dataType] = {};
      }
      
      storage[dataType][userId] = {
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      return await this.writeLocalStorage(storage);
    } catch (error) {
      console.error('Failed to save user data:', error);
      return false;
    }
  }

  /**
   * Get user data from local storage
   * @param {string} userId 
   * @param {string} dataType 
   * @returns {Promise<Object|null>}
   */
  async getUserData(userId, dataType) {
    try {
      const storage = await this.readLocalStorage();
      return storage[dataType]?.[userId] || null;
    } catch (error) {
      console.error('Failed to get user data:', error);
      return null;
    }
  }

  /**
   * Add item to sync queue
   * @param {Object} item 
   * @returns {Promise<boolean>}
   */
  async addToSyncQueue(item) {
    try {
      const storage = await this.readLocalStorage();
      
      if (!storage.syncQueue) {
        storage.syncQueue = [];
      }
      
      storage.syncQueue.push({
        ...item,
        id: Date.now().toString(),
        timestamp: new Date().toISOString()
      });
      
      return await this.writeLocalStorage(storage);
    } catch (error) {
      console.error('Failed to add to sync queue:', error);
      return false;
    }
  }

  /**
   * Get sync queue
   * @returns {Promise<Array>}
   */
  async getSyncQueue() {
    try {
      const storage = await this.readLocalStorage();
      return storage.syncQueue || [];
    } catch (error) {
      console.error('Failed to get sync queue:', error);
      return [];
    }
  }

  /**
   * Clear sync queue
   * @returns {Promise<boolean>}
   */
  async clearSyncQueue() {
    try {
      const storage = await this.readLocalStorage();
      storage.syncQueue = [];
      storage.lastSync = new Date().toISOString();
      return await this.writeLocalStorage(storage);
    } catch (error) {
      console.error('Failed to clear sync queue:', error);
      return false;
    }
  }

  /**
   * Get database statistics
   * @returns {Promise<Object>}
   */
  async getStats() {
    try {
      const storage = await this.readLocalStorage();
      
      const stats = {
        userProfiles: Object.keys(storage.userProfiles || {}).length,
        userProgress: Object.keys(storage.userProgress || {}).length,
        learningSessions: Object.keys(storage.learningSessions || {}).length,
        userVocabulary: Object.keys(storage.userVocabulary || {}).length,
        conversationHistory: Object.keys(storage.conversationHistory || {}).length,
        userAchievements: Object.keys(storage.userAchievements || {}).length,
        syncQueueSize: (storage.syncQueue || []).length,
        lastSync: storage.lastSync,
        storageSize: JSON.stringify(storage).length
      };
      
      return stats;
    } catch (error) {
      console.error('Failed to get database stats:', error);
      return {};
    }
  }

  /**
   * Export data for backup
   * @returns {Promise<Object>}
   */
  async exportData() {
    try {
      const storage = await this.readLocalStorage();
      return {
        ...storage,
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
      };
    } catch (error) {
      console.error('Failed to export data:', error);
      return null;
    }
  }

  /**
   * Import data from backup
   * @param {Object} data 
   * @returns {Promise<boolean>}
   */
  async importData(data) {
    try {
      // Validate data structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data format');
      }
      
      // Remove export metadata
      const { exportedAt, ...importData } = data;
      
      return await this.writeLocalStorage(importData);
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  /**
   * Clean up old data
   * @param {number} daysOld 
   * @returns {Promise<boolean>}
   */
  async cleanup(daysOld = 30) {
    try {
      const storage = await this.readLocalStorage();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      let cleaned = false;
      
      // Clean up old sync queue items
      if (storage.syncQueue) {
        const originalLength = storage.syncQueue.length;
        storage.syncQueue = storage.syncQueue.filter(item => {
          const itemDate = new Date(item.timestamp);
          return itemDate > cutoffDate;
        });
        
        if (storage.syncQueue.length < originalLength) {
          cleaned = true;
        }
      }
      
      if (cleaned) {
        await this.writeLocalStorage(storage);
        console.log(`Cleaned up old data (older than ${daysOld} days)`);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to cleanup data:', error);
      return false;
    }
  }

  // User Progress Methods
  /**
   * Get user progress
   * @param {string} userId 
   * @returns {Promise<Object>}
   */
  async getUserProgress(userId) {
    return await this.getUserData(userId, 'userProgress') || {
      level: 1,
      xp: 0,
      streak: 0,
      totalStudyTime: 0,
      lessonsCompleted: 0,
      vocabularyLearned: 0
    };
  }

  /**
   * Update user progress
   * @param {string} userId 
   * @param {Object} updates 
   * @returns {Promise<boolean>}
   */
  async updateUserProgress(userId, updates) {
    const currentProgress = await this.getUserProgress(userId);
    const updatedProgress = { ...currentProgress, ...updates };
    return await this.saveUserData(userId, 'userProgress', updatedProgress);
  }

  /**
   * Add XP to user
   * @param {string} userId 
   * @param {number} xpAmount 
   * @returns {Promise<boolean>}
   */
  async addXP(userId, xpAmount) {
    const progress = await this.getUserProgress(userId);
    progress.xp += xpAmount;
    
    // Level up logic
    const newLevel = Math.floor(progress.xp / 100) + 1;
    if (newLevel > progress.level) {
      progress.level = newLevel;
    }
    
    return await this.saveUserData(userId, 'userProgress', progress);
  }

  /**
   * Update user streak
   * @param {string} userId 
   * @param {number} newStreak 
   * @returns {Promise<boolean>}
   */
  async updateStreak(userId, newStreak) {
    return await this.updateUserProgress(userId, { streak: newStreak });
  }

  // Settings Methods
  /**
   * Set user setting
   * @param {string} userId 
   * @param {string} key 
   * @param {any} value 
   * @returns {Promise<boolean>}
   */
  async setSetting(userId, key, value) {
    const settings = await this.getUserData(userId, 'settings') || {};
    settings[key] = value;
    return await this.saveUserData(userId, 'settings', settings);
  }

  /**
   * Get user setting
   * @param {string} userId 
   * @param {string} key 
   * @returns {Promise<any>}
   */
  async getSetting(userId, key) {
    const settings = await this.getUserData(userId, 'settings') || {};
    return settings[key];
  }

  /**
   * Get all user settings
   * @param {string} userId 
   * @returns {Promise<Object>}
   */
  async getAllSettings(userId) {
    return await this.getUserData(userId, 'settings') || {};
  }

  // Vocabulary Methods
  /**
   * Add vocabulary word
   * @param {Object} wordData 
   * @returns {Promise<Object>}
   */
  async addVocabulary(wordData) {
    const storage = await this.readLocalStorage();
    if (!storage.vocabulary) storage.vocabulary = {};
    
    const id = Date.now().toString();
    storage.vocabulary[id] = {
      ...wordData,
      id,
      createdAt: new Date().toISOString()
    };
    
    await this.writeLocalStorage(storage);
    return { lastInsertRowid: id };
  }

  /**
   * Get vocabulary by language
   * @param {string} language 
   * @param {number} limit 
   * @param {number} offset 
   * @returns {Promise<Array>}
   */
  async getVocabularyByLanguage(language, limit = 50, offset = 0) {
    const storage = await this.readLocalStorage();
    const vocabulary = Object.values(storage.vocabulary || {})
      .filter(word => word.language === language)
      .slice(offset, offset + limit);
    return vocabulary;
  }

  /**
   * Add user vocabulary
   * @param {string} userId 
   * @param {string} vocabularyId 
   * @returns {Promise<Object>}
   */
  async addUserVocabulary(userId, vocabularyId) {
    const userVocab = await this.getUserData(userId, 'userVocabulary') || {};
    userVocab[vocabularyId] = {
      vocabularyId,
      learnedAt: new Date().toISOString(),
      reviewCount: 0,
      lastReviewed: null,
      mastery: 0
    };
    
    await this.saveUserData(userId, 'userVocabulary', userVocab);
    return { lastInsertRowid: vocabularyId };
  }

  /**
   * Update user vocabulary
   * @param {string} userId 
   * @param {string} vocabularyId 
   * @param {Object} updates 
   * @returns {Promise<boolean>}
   */
  async updateUserVocabulary(userId, vocabularyId, updates) {
    const userVocab = await this.getUserData(userId, 'userVocabulary') || {};
    if (userVocab[vocabularyId]) {
      userVocab[vocabularyId] = { ...userVocab[vocabularyId], ...updates };
      return await this.saveUserData(userId, 'userVocabulary', userVocab);
    }
    return false;
  }

  /**
   * Get vocabulary due for review
   * @param {string} userId 
   * @param {number} limit 
   * @returns {Promise<Array>}
   */
  async getVocabularyDueForReview(userId, limit = 10) {
    const userVocab = await this.getUserData(userId, 'userVocabulary') || {};
    const now = new Date();
    
    return Object.values(userVocab)
      .filter(vocab => {
        if (!vocab.lastReviewed) return true;
        const lastReview = new Date(vocab.lastReviewed);
        const daysSinceReview = (now - lastReview) / (1000 * 60 * 60 * 24);
        return daysSinceReview >= (vocab.mastery + 1);
      })
      .slice(0, limit);
  }

  // Chat Methods
  /**
   * Create chat conversation
   * @param {string} userId 
   * @param {string} title 
   * @param {string} language 
   * @param {string} scenario 
   * @returns {Promise<Object>}
   */
  async createChatConversation(userId, title, language, scenario) {
    const conversations = await this.getUserData(userId, 'conversationHistory') || {};
    const id = Date.now().toString();
    
    conversations[id] = {
      id,
      title,
      language,
      scenario,
      createdAt: new Date().toISOString(),
      messages: []
    };
    
    await this.saveUserData(userId, 'conversationHistory', conversations);
    return { lastInsertRowid: id };
  }

  /**
   * Add chat message
   * @param {string} conversationId 
   * @param {string} sender 
   * @param {string} message 
   * @param {string} corrections 
   * @param {string} feedback 
   * @returns {Promise<Object>}
   */
  async addChatMessage(conversationId, sender, message, corrections, feedback) {
    // This would need userId to find the conversation
    // For now, return a placeholder
    const messageId = Date.now().toString();
    return { lastInsertRowid: messageId };
  }

  /**
   * Get chat conversations
   * @param {string} userId 
   * @param {number} limit 
   * @returns {Promise<Array>}
   */
  async getChatConversations(userId, limit = 20) {
    const conversations = await this.getUserData(userId, 'conversationHistory') || {};
    return Object.values(conversations)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  }

  /**
   * Get chat messages
   * @param {string} conversationId 
   * @param {number} limit 
   * @returns {Promise<Array>}
   */
  async getChatMessages(conversationId, limit = 50) {
    // This would need to search through all users' conversations
    // For now, return empty array
    return [];
  }

  // Study Session Methods
  /**
   * Start study session
   * @param {string} userId 
   * @param {string} sessionType 
   * @returns {Promise<Object>}
   */
  async startStudySession(userId, sessionType) {
    const sessions = await this.getUserData(userId, 'learningSessions') || {};
    const id = Date.now().toString();
    
    sessions[id] = {
      id,
      sessionType,
      startTime: new Date().toISOString(),
      endTime: null,
      duration: 0,
      xpEarned: 0,
      activitiesCompleted: 0,
      accuracyPercentage: 0
    };
    
    await this.saveUserData(userId, 'learningSessions', sessions);
    return { lastInsertRowid: id };
  }

  /**
   * End study session
   * @param {string} sessionId 
   * @param {number} duration 
   * @param {number} xpEarned 
   * @param {number} activitiesCompleted 
   * @param {number} accuracyPercentage 
   * @returns {Promise<boolean>}
   */
  async endStudySession(sessionId, duration, xpEarned, activitiesCompleted, accuracyPercentage) {
    // This would need userId to find the session
    // For now, return true
    return true;
  }

  /**
   * Get study statistics
   * @param {string} userId 
   * @param {number} days 
   * @returns {Promise<Object>}
   */
  async getStudyStats(userId, days = 7) {
    const sessions = await this.getUserData(userId, 'learningSessions') || {};
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentSessions = Object.values(sessions)
      .filter(session => new Date(session.startTime) > cutoffDate);
    
    return {
      totalSessions: recentSessions.length,
      totalDuration: recentSessions.reduce((sum, s) => sum + (s.duration || 0), 0),
      totalXP: recentSessions.reduce((sum, s) => sum + (s.xpEarned || 0), 0),
      averageAccuracy: recentSessions.length > 0 
        ? recentSessions.reduce((sum, s) => sum + (s.accuracyPercentage || 0), 0) / recentSessions.length 
        : 0
    };
  }

  /**
   * Check if service is initialized
   * @returns {boolean}
   */
  isReady() {
    return this.isInitialized;
  }

  /**
   * Close database service and cleanup resources
   * @returns {Promise<void>}
   */
  async close() {
    try {
      if (this.isInitialized) {
        // Perform any necessary cleanup
        await this.cleanup();
        this.isInitialized = false;
        console.log('Database service closed successfully');
      }
    } catch (error) {
      console.error('Error closing database service:', error);
    }
  }

  /**
   * Get database path
   * @returns {string}
   */
  getDatabasePath() {
    return this.dbPath;
  }

  /**
   * Get user data path
   * @returns {string}
   */
  getUserDataPath() {
    return this.userDataPath;
  }
}

// Create and export singleton instance
const databaseService = new DatabaseService();
module.exports = databaseService;
module.exports.DatabaseService = DatabaseService;