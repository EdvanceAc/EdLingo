const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

/**
 * Secure Database Service for Main Process
 * Handles all Supabase operations securely in the main process
 * Prevents key exposure to renderer processes
 */
class DatabaseService {
  constructor() {
    this.supabase = null;
    this.supabaseAdmin = null;
    this.isInitialized = false;
  }

  /**
   * Initialize Supabase clients securely
   * Reads environment variables from .env file or process.env
   */
  async initialize() {
    try {
      // Load environment variables
      const envPath = path.join(__dirname, '../../.env');
      if (fs.existsSync(envPath)) {
        require('dotenv').config({ path: envPath });
      }

      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
      const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing required Supabase environment variables');
      }

      // Initialize regular client
      this.supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      // Initialize admin client with service role key (if available)
      if (supabaseServiceKey) {
        this.supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
        console.log('✅ Supabase admin client initialized');
      } else {
        console.warn('⚠️ Service role key not found. Admin operations will use regular client.');
        this.supabaseAdmin = this.supabase;
      }

      this.isInitialized = true;
      console.log('✅ Database service initialized successfully');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize database service:', error);
      throw error;
    }
  }

  /**
   * Ensure the service is initialized
   */
  async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  /**
   * Create a new course (admin operation)
   * @param {Object} courseData - Course data to insert
   * @param {boolean} isDraft - Whether this is a draft or published course
   * @returns {Object} Created course data
   */
  async createCourse(courseData, isDraft = false) {
    await this.ensureInitialized();
    
    try {
      console.log('🚀 Creating course in database...', { isDraft });
      
      // Set status based on submission type - commented out as 'status' column doesn't exist in database schema
      const finalCourseData = {
        ...courseData,
        // status: isDraft ? 'draft' : 'published', // Column doesn't exist in courses table
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Use admin client for course creation (requires elevated permissions)
      const { data, error } = await this.supabaseAdmin
        .from('courses')
        .insert([finalCourseData])
        .select();
        
      if (error) {
        console.error('❌ Supabase error:', error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      console.log('✅ Course created successfully:', data[0]);
      return data[0];
      
    } catch (error) {
      console.error('❌ Error creating course:', error);
      throw error;
    }
  }

  /**
   * Get all courses
   * @returns {Array} List of courses
   */
  async getCourses() {
    await this.ensureInitialized();
    
    try {
      const { data, error } = await this.supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }
      
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching courses:', error);
      throw error;
    }
  }

  /**
   * Update a course
   * @param {string} courseId - Course ID to update
   * @param {Object} updates - Updates to apply
   * @returns {Object} Updated course data
   */
  async updateCourse(courseId, updates) {
    await this.ensureInitialized();
    
    try {
      const finalUpdates = {
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await this.supabaseAdmin
        .from('courses')
        .update(finalUpdates)
        .eq('id', courseId)
        .select();
        
      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }
      
      return data[0];
    } catch (error) {
      console.error('❌ Error updating course:', error);
      throw error;
    }
  }

  /**
   * Delete a course
   * @param {string} courseId - Course ID to delete
   * @returns {boolean} Success status
   */
  async deleteCourse(courseId) {
    await this.ensureInitialized();
    
    try {
      const { error } = await this.supabaseAdmin
        .from('courses')
        .delete()
        .eq('id', courseId);
        
      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error deleting course:', error);
      throw error;
    }
  }

  // Existing methods for user progress, vocabulary, etc.
  async getUserProgress(userId) {
    await this.ensureInitialized();
    // Implementation for user progress
    return {};
  }

  async updateUserProgress(userId, progressData) {
    await this.ensureInitialized();
    // Implementation for updating user progress
    return true;
  }

  async getDailyStats(userId, date) {
    await this.ensureInitialized();
    // Implementation for daily stats
    return {};
  }

  async getWeeklyStats(userId, startDate, endDate) {
    await this.ensureInitialized();
    // Implementation for weekly stats
    return {};
  }

  async getVocabulary(userId) {
    await this.ensureInitialized();
    // Implementation for vocabulary
    return [];
  }

  async addVocabulary(userId, word) {
    await this.ensureInitialized();
    // Implementation for adding vocabulary
    return true;
  }

  async updateVocabulary(userId, wordId, updates) {
    await this.ensureInitialized();
    // Implementation for updating vocabulary
    return true;
  }
}

// Create singleton instance
const databaseService = new DatabaseService();

module.exports = databaseService;