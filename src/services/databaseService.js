const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config()

// Field mapping between frontend (camelCase) and database (snake_case)
const FIELD_MAPPINGS = {
  user_progress: {
    'lessonsCompleted': 'lessons_completed',
    'totalXP': 'total_xp',
    'currentStreak': 'current_streak',
    'longestStreak': 'longest_streak',
    'dailyGoal': 'daily_goal',
    'dailyProgress': 'daily_progress',
    'lastStudyDate': 'lastStudyDate',
    'level': 'current_level',
    'createdAt': 'created_at',
    'updatedAt': 'updated_at'
  },
  users: {
    'displayName': 'display_name',
    'avatarUrl': 'avatar_url',
    'createdAt': 'created_at',
    'updatedAt': 'updated_at'
  },
  user_settings: {
    'userId': 'user_id',
    'settingKey': 'setting_key',
    'settingValue': 'setting_value',
    'createdAt': 'created_at',
    'updatedAt': 'updated_at'
  }
};

// Reverse mapping (Database -> Frontend)
const REVERSE_FIELD_MAPPINGS = {};
Object.keys(FIELD_MAPPINGS).forEach(table => {
  REVERSE_FIELD_MAPPINGS[table] = {};
  Object.entries(FIELD_MAPPINGS[table]).forEach(([frontend, database]) => {
    REVERSE_FIELD_MAPPINGS[table][database] = frontend;
  });
});

// Convert frontend object to database format
function mapToDatabase(tableName, frontendData) {
  if (!FIELD_MAPPINGS[tableName]) return frontendData;
  
  const dbData = {};
  Object.entries(frontendData).forEach(([key, value]) => {
    const dbKey = FIELD_MAPPINGS[tableName][key] || key;
    dbData[dbKey] = value;
  });
  
  return dbData;
}

// Convert database object to frontend format
function mapToFrontend(tableName, dbData) {
  if (!REVERSE_FIELD_MAPPINGS[tableName]) return dbData;
  
  const frontendData = {};
  Object.entries(dbData).forEach(([key, value]) => {
    const frontendKey = REVERSE_FIELD_MAPPINGS[tableName][key] || key;
    frontendData[frontendKey] = value;
  });
  
  return frontendData;
}

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

// Validate required environment variables
if (!supabaseUrl) {
  throw new Error('Missing required environment variable: VITE_SUPABASE_URL or SUPABASE_URL')
}

if (!supabaseAnonKey) {
  throw new Error('Missing required environment variable: VITE_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY')
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})

// Database service class
class DatabaseService {
  constructor() {
    this.supabase = supabase
    this.initialized = false
  }

  // Initialize the database service
  async initialize() {
    try {
      // Test the connection
      const { data, error } = await this.supabase
        .from('user_settings')
        .select('count')
        .limit(1)
      
      if (error && error.code !== 'PGRST116') {
        console.warn('Database connection test failed:', error.message)
      }
      
      this.initialized = true
      console.log('Database service initialized successfully')
      return true
    } catch (error) {
      console.error('Failed to initialize database service:', error)
      this.initialized = false
      throw error
    }
  }

  // Get a specific setting for a user
  async getSetting(userId, settingKey) {
    try {
      if (!userId) {
        console.warn('No userId provided for getSetting')
        return null
      }

      const { data, error } = await this.supabase
        .from('user_settings')
        .select('setting_value')
        .eq('user_id', userId)
        .eq('setting_key', settingKey)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error getting setting:', error)
        return null
      }
      
      return data?.setting_value || null
    } catch (error) {
      console.error('Error in getSetting:', error)
      return null
    }
  }

  // Set a specific setting for a user
  async setSetting(userId, settingKey, value) {
    try {
      if (!userId) {
        console.warn('No userId provided for setSetting')
        return false
      }

      // Ensure user exists before creating settings
      await this.ensureUserExists(userId);
      
      const { data, error } = await this.supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          setting_key: settingKey,
          setting_value: value,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,setting_key'
        })
        .select()
        .single()
      
      if (error) {
        console.error('Error setting setting:', error)
        return false
      }
      
      return true
    } catch (error) {
      console.error('Error in setSetting:', error)
      return false
    }
  }

  // User Progress Operations
  async getUserProgress(userId) {
    try {
      const { data, error } = await this.supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      
      // Convert database format to frontend format
      return data ? mapToFrontend('user_progress', data) : null
    } catch (error) {
      console.error('Error fetching user progress:', error)
      throw error
    }
  }

  async updateUserProgress(userId, progressData) {
    try {
      // Ensure user exists before updating progress
      await this.ensureUserExists(userId);
      
      // Convert frontend format to database format
      const dbData = mapToDatabase('user_progress', progressData);
      
      const { data, error } = await this.supabase
        .from('user_progress')
        .upsert({
          user_id: userId,
          ...dbData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Convert back to frontend format
      return mapToFrontend('user_progress', data);
    } catch (error) {
      console.error('Error updating user progress:', error);
      throw error;
    }
  }

  // Ensure user exists before creating related records
  async ensureUserExists(userId) {
    try {
      const { data: existingUser, error: userError } = await this.supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();
      
      if (userError && userError.code === 'PGRST116') {
        // User doesn't exist, create default user
        console.log(`Creating default user with ID: ${userId}`);
        
        const { data: newUser, error: createError } = await this.supabase
          .from('users')
          .insert({
            id: userId,
            email: `user-${userId}@edlingo.com`,
            username: `user_${userId.slice(0, 8)}`,
            display_name: `User ${userId.slice(0, 8)}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (createError) {
          console.error('Error creating default user:', createError);
          throw createError;
        }
        
        // Create default progress record
        await this.createDefaultUserProgress(userId);
        
        return newUser;
      } else if (userError) {
        throw userError;
      }
      
      return existingUser;
    } catch (error) {
      console.error('Error ensuring user exists:', error);
      throw error;
    }
  }

  async createDefaultUserProgress(userId) {
    try {
      const { data, error } = await this.supabase
        .from('user_progress')
        .insert({
          user_id: userId,
          total_xp: 0,
          current_streak: 0,
          longest_streak: 0,
          lessons_completed: 0,
          daily_goal: 15,
          daily_progress: 0,
          lastStudyDate: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating default user progress:', error);
      throw error;
    }
  }

  // Vocabulary Operations
  async getVocabulary(filters = {}) {
    try {
      let query = this.supabase
        .from('vocabulary')
        .select('*')
      
      if (filters.level) {
        query = query.eq('level', filters.level)
      }
      
      if (filters.category) {
        query = query.eq('category', filters.category)
      }
      
      const { data, error } = await query.order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching vocabulary:', error)
      throw error
    }
  }

  async addVocabulary(vocabularyData) {
    try {
      const { data, error } = await this.supabase
        .from('vocabulary')
        .insert({
          ...vocabularyData,
          created_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error adding vocabulary:', error)
      throw error
    }
  }

  async updateVocabulary(id, vocabularyData) {
    try {
      const { data, error } = await this.supabase
        .from('vocabulary')
        .update({
          ...vocabularyData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating vocabulary:', error)
      throw error
    }
  }

  async deleteVocabulary(id) {
    try {
      const { error } = await this.supabase
        .from('vocabulary')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting vocabulary:', error)
      throw error
    }
  }

  // Grammar Lessons Operations
  async getGrammarLessons(filters = {}) {
    try {
      let query = this.supabase
        .from('grammar_lessons')
        .select('*')
      
      if (filters.level) {
        query = query.eq('level', filters.level)
      }
      
      const { data, error } = await query.order('created_at', { ascending: true })
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching grammar lessons:', error)
      throw error
    }
  }

  async getGrammarLesson(id) {
    try {
      const { data, error } = await this.supabase
        .from('grammar_lessons')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching grammar lesson:', error)
      throw error
    }
  }

  // Chat History Operations
  async getChatHistory(userId, limit = 50) {
    try {
      const { data, error } = await this.supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching chat history:', error)
      throw error
    }
  }

  async addChatMessage(userId, messageData) {
    try {
      const { data, error } = await this.supabase
        .from('chat_history')
        .insert({
          user_id: userId,
          ...messageData,
          created_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error adding chat message:', error)
      throw error
    }
  }

  async clearChatHistory(userId) {
    try {
      const { error } = await this.supabase
        .from('chat_history')
        .delete()
        .eq('user_id', userId)
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error clearing chat history:', error)
      throw error
    }
  }

  // Settings Operations
  async getUserSettings(userId) {
    try {
      const { data, error } = await this.supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
      
      if (error && error.code !== 'PGRST116') throw error
      
      // Convert array of settings to object format
      const settingsObject = {}
      if (data && data.length > 0) {
        data.forEach(setting => {
          settingsObject[setting.setting_key] = setting.setting_value
        })
      }
      
      return settingsObject
    } catch (error) {
      console.error('Error fetching user settings:', error)
      throw error
    }
  }

  async updateUserSettings(userId, settings) {
    try {
      // Convert settings object to array of setting records
      const settingRecords = Object.entries(settings).map(([key, value]) => ({
        user_id: userId,
        setting_key: key,
        setting_value: value,
        updated_at: new Date().toISOString()
      }))
      
      const { data, error } = await this.supabase
        .from('user_settings')
        .upsert(settingRecords)
        .select()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating user settings:', error)
      throw error
    }
  }

  // Authentication helpers
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser()
      if (error) throw error
      return user
    } catch (error) {
      console.error('Error getting current user:', error)
      throw error
    }
  }

  async signIn(email, password) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error signing in:', error)
      throw error
    }
  }

  async signUp(email, password, metadata = {}) {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error signing up:', error)
      throw error
    }
  }

  async signInWithGoogle() {
    try {
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error signing in with Google:', error)
      throw error
    }
  }

  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut()
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  // Real-time subscriptions
  subscribeToUserProgress(userId, callback) {
    return this.supabase
      .channel('user_progress_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_progress',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()
  }

  subscribeToChatHistory(userId, callback) {
    return this.supabase
      .channel('chat_history_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_history',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()
  }

  // Close database connections
  async close() {
    try {
      // For Supabase, there's no explicit close method needed
      // The connection is managed automatically
      // We can set initialized to false to indicate service is closing
      this.initialized = false
      console.log('Database service closed successfully')
      return true
    } catch (error) {
      console.error('Error closing database service:', error)
      return false
    }
  }
}

// Export singleton instance
const databaseService = new DatabaseService()
module.exports = databaseService
module.exports.supabase = supabase
module.exports.DatabaseService = DatabaseService