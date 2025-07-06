import { supabase, checkSupabaseConnection } from '../config/supabaseConfig.js';

/**
 * Supabase Database Service
 * Handles all database operations for EdLingo app
 */
class SupabaseService {
  constructor() {
    this.client = supabase;
    this.isConnected = false;
    this.init();
  }

  async init() {
    try {
      const connectionStatus = await checkSupabaseConnection();
      this.isConnected = connectionStatus.connected;
      
      if (this.isConnected) {
        console.log('✅ Supabase connected successfully');
      } else {
        console.warn('⚠️ Supabase connection failed:', connectionStatus.error);
      }
    } catch (error) {
      console.error('❌ Failed to initialize Supabase service:', error);
    }
  }

  // Connection status
  getConnectionStatus() {
    return this.isConnected;
  }

  // User Management
  async signUp(email, password, userData = {}) {
    try {
      const { data, error } = await this.client.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: error.message };
    }
  }

  async signIn(email, password) {
    try {
      const { data, error } = await this.client.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message };
    }
  }

  async signOut() {
    try {
      const { error } = await this.client.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  }

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await this.client.auth.getUser();
      if (error) throw error;
      return { success: true, user };
    } catch (error) {
      console.error('Get current user error:', error);
      return { success: false, error: error.message };
    }
  }

  async signInWithGoogle() {
    try {
      const { data, error } = await this.client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Google sign in error:', error);
      return { success: false, error: error.message };
    }
  }

  async resetPassword(email) {
    try {
      const { data, error } = await this.client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: error.message };
    }
  }

  async updatePassword(newPassword) {
    try {
      const { data, error } = await this.client.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Update password error:', error);
      return { success: false, error: error.message };
    }
  }

  async getSession() {
    try {
      const { data: { session }, error } = await this.client.auth.getSession();
      if (error) throw error;
      return { success: true, session };
    } catch (error) {
      console.error('Get session error:', error);
      return { success: false, error: error.message };
    }
  }

  onAuthStateChange(callback) {
    return this.client.auth.onAuthStateChange(callback);
  }

  // User Progress Management
  async saveUserProgress(userId, progressData) {
    try {
      const { data, error } = await this.client
        .from('user_progress')
        .upsert({
          user_id: userId,
          ...progressData,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Save progress error:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserProgress(userId) {
    try {
      const { data, error } = await this.client
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return { success: true, data: data || null };
    } catch (error) {
      console.error('Get progress error:', error);
      return { success: false, error: error.message };
    }
  }

  // Learning Sessions
  async saveLearningSession(userId, sessionData) {
    try {
      const { data, error } = await this.client
        .from('learning_sessions')
        .insert({
          user_id: userId,
          ...sessionData,
          created_at: new Date().toISOString()
        });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Save session error:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserSessions(userId, limit = 10) {
    try {
      const { data, error } = await this.client
        .from('learning_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Get sessions error:', error);
      return { success: false, error: error.message };
    }
  }

  // Vocabulary Management
  async saveVocabulary(userId, vocabularyData) {
    try {
      const { data, error } = await this.client
        .from('user_vocabulary')
        .upsert({
          user_id: userId,
          ...vocabularyData,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Save vocabulary error:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserVocabulary(userId) {
    try {
      const { data, error } = await this.client
        .from('user_vocabulary')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Get vocabulary error:', error);
      return { success: false, error: error.message };
    }
  }

  // Real-time subscriptions
  subscribeToUserProgress(userId, callback) {
    return this.client
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
      .subscribe();
  }

  // Utility methods
  async testConnection() {
    return await checkSupabaseConnection();
  }

  async syncData() {
    try {
      // Implement data synchronization logic here
      console.log('🔄 Starting data sync...');
      
      // Example: sync user progress, vocabulary, etc.
      const user = await this.getCurrentUser();
      if (user.success && user.user) {
        const progress = await this.getUserProgress(user.user.id);
        const vocabulary = await this.getUserVocabulary(user.user.id);
        const sessions = await this.getUserSessions(user.user.id, 5);
        
        console.log('✅ Data sync completed');
        return {
          success: true,
          data: {
            progress: progress.data,
            vocabulary: vocabulary.data,
            sessions: sessions.data
          }
        };
      }
      
      return { success: false, error: 'No authenticated user' };
    } catch (error) {
      console.error('❌ Data sync failed:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create and export singleton instance
const supabaseService = new SupabaseService();
export default supabaseService;