import googleDriveService from './googleDriveService';
import { AppConfig } from '../../config/AppConfig';

class AdminService {
  constructor() {
    this.googleDriveService = googleDriveService;
    this.isAuthenticated = false;
    this.adminCredentials = {
      username: 'admin',
      password: 'admin123' // In production, this should be properly secured
    };
  }

  /**
   * Authenticate admin user
   * @param {string} username 
   * @param {string} password 
   * @returns {Promise<boolean>}
   */
  async authenticate(username, password) {
    try {
      // Simple authentication - in production, use proper auth service
      if (username === this.adminCredentials.username && password === this.adminCredentials.password) {
        this.isAuthenticated = true;
        localStorage.setItem('admin_authenticated', 'true');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Admin authentication error:', error);
      return false;
    }
  }

  /**
   * Check if admin is authenticated
   * @returns {boolean}
   */
  isAdminAuthenticated() {
    return this.isAuthenticated || localStorage.getItem('admin_authenticated') === 'true';
  }

  /**
   * Logout admin
   */
  logout() {
    this.isAuthenticated = false;
    localStorage.removeItem('admin_authenticated');
  }

  /**
   * Upload file to Google Drive
   * @param {File} file 
   * @param {string} category 
   * @param {string} subcategory 
   * @param {Function} onProgress 
   * @returns {Promise<Object>}
   */
  async uploadFile(file, category = 'shared_resources', subcategory = null, onProgress = null) {
    if (!this.isAdminAuthenticated()) {
      throw new Error('Admin authentication required');
    }

    try {
      const result = await this.googleDriveService.uploadFile(file, category, subcategory, onProgress);
      return result;
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }

  /**
   * List files from Google Drive
   * @param {string} category 
   * @param {string} subcategory 
   * @returns {Promise<Array>}
   */
  async listFiles(category = null, subcategory = null) {
    if (!this.isAdminAuthenticated()) {
      throw new Error('Admin authentication required');
    }

    try {
      const files = await this.googleDriveService.listFiles(category, subcategory);
      return files;
    } catch (error) {
      console.error('File listing error:', error);
      throw error;
    }
  }

  /**
   * Delete file from Google Drive
   * @param {string} fileId 
   * @returns {Promise<boolean>}
   */
  async deleteFile(fileId) {
    if (!this.isAdminAuthenticated()) {
      throw new Error('Admin authentication required');
    }

    try {
      const result = await this.googleDriveService.deleteFile(fileId);
      return result;
    } catch (error) {
      console.error('File deletion error:', error);
      throw error;
    }
  }

  /**
   * Get file download URL
   * @param {string} fileId 
   * @returns {Promise<string>}
   */
  async getFileUrl(fileId) {
    if (!this.isAdminAuthenticated()) {
      throw new Error('Admin authentication required');
    }

    try {
      const url = await this.googleDriveService.getFileUrl(fileId);
      return url;
    } catch (error) {
      console.error('Get file URL error:', error);
      throw error;
    }
  }

  /**
   * Get system statistics
   * @returns {Promise<Object>}
   */
  async getSystemStats() {
    if (!this.isAdminAuthenticated()) {
      throw new Error('Admin authentication required');
    }

    try {
      const stats = {
        totalFiles: 0,
        totalSize: 0,
        categories: {},
        lastUpdated: new Date().toISOString()
      };

      // Get files from all categories
      const allFiles = await this.googleDriveService.listFiles();
      stats.totalFiles = allFiles.length;
      stats.totalSize = allFiles.reduce((total, file) => total + (file.size || 0), 0);

      // Group by categories
      allFiles.forEach(file => {
        const category = file.category || 'uncategorized';
        if (!stats.categories[category]) {
          stats.categories[category] = {
            count: 0,
            size: 0
          };
        }
        stats.categories[category].count++;
        stats.categories[category].size += file.size || 0;
      });

      return stats;
    } catch (error) {
      console.error('Get system stats error:', error);
      throw error;
    }
  }

  /**
   * Initialize Google Drive service
   * @returns {Promise<boolean>}
   */
  async initializeGoogleDrive() {
    if (!this.isAdminAuthenticated()) {
      throw new Error('Admin authentication required');
    }

    try {
      const result = await this.googleDriveService.initialize();
      return result;
    } catch (error) {
      console.error('Google Drive initialization error:', error);
      throw error;
    }
  }

  /**
   * Check Google Drive connection status
   * @returns {Promise<boolean>}
   */
  async checkGoogleDriveStatus() {
    try {
      const status = await this.googleDriveService.checkConnection();
      return status;
    } catch (error) {
      console.error('Google Drive status check error:', error);
      return false;
    }
  }

  /**
   * Get application configuration
   * @returns {Object}
   */
  getAppConfig() {
    if (!this.isAdminAuthenticated()) {
      throw new Error('Admin authentication required');
    }

    return {
      googleDrive: AppConfig.getGoogleDriveSettings(),
      database: AppConfig.getDatabaseSettings(),
      ai: AppConfig.getAISettings(),
      version: AppConfig.getVersion(),
      environment: AppConfig.getEnvironment()
    };
  }
}

// Create and export singleton instance
const adminService = new AdminService();
export default adminService;
export { AdminService };