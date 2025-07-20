const { ipcMain } = require('electron');
const databaseService = require('./databaseService'); // Adjust path as needed

function setupDatabaseHandlers() {
  ipcMain.handle('db:getUserProgress', async (event, userId) => {
    try {
      const progress = await databaseService.getUserProgress(userId);
      return { success: true, progress };
    } catch (error) {
      console.error('Error getting user progress:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:updateUserProgress', async (event, userId, progressData) => {
    try {
      const updated = await databaseService.updateUserProgress(userId, progressData);
      return { success: true, updated };
    } catch (error) {
      console.error('Error updating user progress:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:getDailyStats', async (event, userId, date) => {
    try {
      const stats = await databaseService.getDailyStats(userId, date);
      return { success: true, stats };
    } catch (error) {
      console.error('Error getting daily stats:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:getWeeklyStats', async (event, userId, startDate, endDate) => {
    try {
      const stats = await databaseService.getWeeklyStats(userId, startDate, endDate);
      return { success: true, stats };
    } catch (error) {
      console.error('Error getting weekly stats:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:getVocabulary', async (event, userId) => {
    try {
      const vocabulary = await databaseService.getVocabulary(userId);
      return { success: true, vocabulary };
    } catch (error) {
      console.error('Error getting vocabulary:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:addVocabulary', async (event, userId, word) => {
    try {
      const added = await databaseService.addVocabulary(userId, word);
      return { success: true, added };
    } catch (error) {
      console.error('Error adding vocabulary:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:updateVocabulary', async (event, userId, wordId, updates) => {
    try {
      const updated = await databaseService.updateVocabulary(userId, wordId, updates);
      return { success: true, updated };
    } catch (error) {
      console.error('Error updating vocabulary:', error);
      return { success: false, error: error.message };
    }
  });

  // Add other DB handlers here...
}

module.exports = { setupDatabaseHandlers };