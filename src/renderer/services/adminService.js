import googleDriveService from './googleDriveService';
import { AppConfig } from '../../config/AppConfig';
import adminDatabaseService from './adminDatabaseService.js';

class AdminService {
  constructor() {
    this.googleDriveService = googleDriveService;
    this.isAuthenticated = false;
    this.adminCredentials = {
      username: 'admin',
      password: 'admin123' // In production, this should be properly secured
    };
    this.initializeDatabase();
  }

  /**
   * Initialize database service
   */
  async initializeDatabase() {
    try {
      await adminDatabaseService.initialize();
      console.log('Admin database service initialized');
    } catch (error) {
      console.error('Failed to initialize admin database service:', error);
    }
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

  /**
   * Get dashboard statistics
   * @returns {Promise<Object>}
   */
  async getStatistics() {
    if (!this.isAdminAuthenticated()) {
      throw new Error('Admin authentication required');
    }

    try {
      return await adminDatabaseService.getStatistics();
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw new Error('Failed to fetch dashboard statistics');
    }
  }

  /**
   * Get courses
   * @returns {Promise<Array>}
   */
  async getCourses() {
    if (!this.isAdminAuthenticated()) {
      throw new Error('Admin authentication required');
    }

    try {
      return await adminDatabaseService.getCourses();
    } catch (error) {
      console.error('Error fetching courses:', error);
      // Return empty array for now since course table doesn't exist yet
      return [];
    }
  }

  /**
   * Get assignments
   * @returns {Promise<Array>}
   */
  async getAssignments() {
    if (!this.isAdminAuthenticated()) {
      throw new Error('Admin authentication required');
    }

    try {
      return await adminDatabaseService.getAssignments();
    } catch (error) {
      console.error('Error fetching assignments:', error);
      // Return empty array for now since assignment table doesn't exist yet
      return [];
    }
  }

  /**
   * Get recent activity
   * @returns {Promise<Array>}
   */
  async getRecentActivity() {
    if (!this.isAdminAuthenticated()) {
      throw new Error('Admin authentication required');
    }

    try {
      return await adminDatabaseService.getRecentActivity();
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw new Error('Failed to fetch recent activity');
    }
  }

  /**
   * Get user activity data for charts
   * @returns {Promise<Array>}
   */
  async getUserActivityData() {
    if (!this.isAdminAuthenticated()) {
      throw new Error('Admin authentication required');
    }

    try {
      return await adminDatabaseService.getUserActivityData();
    } catch (error) {
      console.error('Error fetching user activity data:', error);
      throw new Error('Failed to fetch user activity data');
    }
  }

  /**
   * Get users with filtering and pagination
   * @param {Object} options - Query options
   * @returns {Promise<Array>}
   */
  async getUsers(options = {}) {
    if (!this.isAdminAuthenticated()) {
      throw new Error('Admin authentication required');
    }

    try {
      return await adminDatabaseService.getUsers(options);
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }
  }

  /**
   * Delete course
   * @param {string} courseId - Course ID to delete
   * @returns {Promise<boolean>}
   */
  async deleteCourse(courseId) {
    if (!this.isAdminAuthenticated()) {
      throw new Error('Admin authentication required');
    }

    try {
      // TODO: Implement when course table is created
      console.log(`Course deletion not yet implemented for ID: ${courseId}`);
      return true;
    } catch (error) {
      console.error('Error deleting course:', error);
      throw new Error('Failed to delete course');
    }
  }
}

// Create and export singleton instance
const adminService = new AdminService();
export default adminService;
export { AdminService };