import { supabase } from '../config/supabase.js';

class AdminService {
  // Course Management
  async getCourses() {
    try {
      const { data, error } = await supabase
        .from('grammar_lessons')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  }

  async createCourse(courseData) {
    try {
      const { data, error } = await supabase
        .from('grammar_lessons')
        .insert([
          {
            title: courseData.title,
            description: courseData.description,
            language: courseData.language || 'spanish',
            content: courseData.content || {},
            level: courseData.level || 'beginner'
          }
        ])
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  }

  async updateCourse(courseId, courseData) {
    try {
      const { data, error } = await supabase
        .from('grammar_lessons')
        .update({
          title: courseData.title,
          description: courseData.description,
          language: courseData.language,
          content: courseData.content,
          level: courseData.level,
          updated_at: new Date().toISOString()
        })
        .eq('id', courseId)
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  }

  async deleteCourse(courseId) {
    try {
      const { error } = await supabase
        .from('grammar_lessons')
        .delete()
        .eq('id', courseId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  }

  // Assignment Management (using learning_sessions as assignments)
  async getAssignments() {
    try {
      const { data, error } = await supabase
        .from('learning_sessions')
        .select('*')
        .order('started_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching assignments:', error);
      throw error;
    }
  }

  async createAssignment(assignmentData) {
    try {
      const { data, error } = await supabase
        .from('learning_sessions')
        .insert([
          {
            user_id: assignmentData.user_id,
            session_type: assignmentData.session_type || 'assignment',
            duration_minutes: assignmentData.duration_minutes || 0,
            xp_earned: assignmentData.xp_earned || 0,
            activities_completed: assignmentData.activities_completed || 0,
            accuracy_percentage: assignmentData.accuracy_percentage || null,
            session_data: assignmentData.session_data || {},
            started_at: assignmentData.started_at || new Date().toISOString(),
            completed_at: assignmentData.completed_at || null
          }
        ])
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error creating assignment:', error);
      throw error;
    }
  }

  // User Management
  async getUsers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          user_progress (*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async getUserProgress(userId) {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user progress:', error);
      throw error;
    }
  }

  // Statistics
  async getStatistics() {
    try {
      const [usersResult, coursesResult, assignmentsResult] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('grammar_lessons').select('id', { count: 'exact', head: true }),
        supabase.from('learning_sessions').select('id', { count: 'exact', head: true })
      ]);

      return {
        totalStudents: usersResult.count || 0,
        activeCourses: coursesResult.count || 0,
        totalAssignments: assignmentsResult.count || 0,
        totalTeachers: 1 // For now, we'll assume 1 admin/teacher
      };
    } catch (error) {
      console.error('Error fetching statistics:', error);
      return {
        totalStudents: 0,
        activeCourses: 0,
        totalAssignments: 0,
        totalTeachers: 1
      };
    }
  }

  // Recent Activity
  async getRecentActivity() {
    try {
      const { data, error } = await supabase
        .from('learning_sessions')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      // Transform to activity format
      return (data || []).map(session => ({
        id: session.id,
        type: session.session_type,
        description: `User completed ${session.session_type}`,
        timestamp: session.started_at,
        user: { id: session.user_id }
      }));
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }

  // Vocabulary Management
  async getVocabulary() {
    try {
      const { data, error } = await supabase
        .from('vocabulary')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching vocabulary:', error);
      throw error;
    }
  }

  async createVocabularyWord(wordData) {
    try {
      const { data, error } = await supabase
        .from('vocabulary')
        .insert([
          {
            word: wordData.word,
            translation: wordData.translation,
            language: wordData.language || 'Spanish',
            pronunciation: wordData.pronunciation || null,
            part_of_speech: wordData.part_of_speech || null,
            difficulty_level: wordData.difficulty_level || 'beginner',
            example_sentence: wordData.example_sentence || null,
            example_translation: wordData.example_translation || null
          }
        ])
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error creating vocabulary word:', error);
      throw error;
    }
  }

  // Authentication helpers
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }
}

export default new AdminService();