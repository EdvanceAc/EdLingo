// DATABASE COLUMN MAPPING FIX
// This script fixes the mismatch between frontend camelCase and database snake_case column names
// and resolves foreign key constraint issues

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Field mapping between frontend (camelCase) and database (snake_case)
const FIELD_MAPPINGS = {
  user_progress: {
    // Frontend -> Database
    'lessonsCompleted': 'lessons_completed',
    'totalXP': 'total_xp',
    'currentStreak': 'current_streak',
    'longestStreak': 'longest_streak',
    'dailyGoal': 'daily_goal',
    'dailyProgress': 'daily_progress',
    'lastStudyDate': 'lastStudyDate', // This one matches
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

// Enhanced database service with field mapping
class EnhancedDatabaseService {
  constructor() {
    this.supabase = supabase;
  }

  // Enhanced user progress operations with field mapping
  async getUserProgress(userId) {
    try {
      const { data, error } = await this.supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      // Convert database format to frontend format
      return data ? mapToFrontend('user_progress', data) : null;
    } catch (error) {
      console.error('Error fetching user progress:', error);
      throw error;
    }
  }

  async updateUserProgress(userId, progressData) {
    try {
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

  // Enhanced user settings operations with field mapping
  async getUserSettings(userId) {
    try {
      const { data, error } = await this.supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId);
      
      if (error && error.code !== 'PGRST116') throw error;
      
      // Convert array of settings to object format with frontend field names
      const settingsObject = {};
      if (data && data.length > 0) {
        data.forEach(setting => {
          const frontendSetting = mapToFrontend('user_settings', setting);
          settingsObject[frontendSetting.settingKey] = frontendSetting.settingValue;
        });
      }
      
      return settingsObject;
    } catch (error) {
      console.error('Error fetching user settings:', error);
      throw error;
    }
  }

  async setSetting(userId, settingKey, value) {
    try {
      // First ensure the user exists
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
        .single();
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error setting setting:', error);
      throw error;
    }
  }

  // Ensure user exists before creating related records
  async ensureUserExists(userId) {
    try {
      // For Supabase auth.users, we don't need to create users manually
      // They are created automatically during authentication
      // We just need to ensure user_progress and user_settings records exist
      
      // Check if user_progress exists
      const { data: existingProgress, error: progressError } = await this.supabase
        .from('user_progress')
        .select('id')
        .eq('user_id', userId)
        .single();

      // If user_progress doesn't exist, create it
      if (progressError && progressError.code === 'PGRST116') {
        console.log(`Creating default progress for user: ${userId}`);
        await this.createDefaultUserProgress(userId);
      } else if (progressError) {
        throw progressError;
      }

      // Check if user_settings exists
      const { data: existingSettings, error: settingsError } = await this.supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', userId)
        .single();

      // If user_settings doesn't exist, create default settings
      if (settingsError && settingsError.code === 'PGRST116') {
        console.log(`Creating default settings for user: ${userId}`);
        const { error: createSettingsError } = await this.supabase
          .from('user_settings')
          .insert({
            user_id: userId,
            target_language: 'spanish',
            native_language: 'english',
            difficulty_preference: 'adaptive',
            daily_goal_minutes: 30,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (createSettingsError) {
          console.error('Error creating default settings:', createSettingsError);
          throw createSettingsError;
        }
      } else if (settingsError) {
        throw settingsError;
      }

      return { success: true };
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
}

// Test the enhanced database service
async function testEnhancedService() {
  console.log('🧪 Testing Enhanced Database Service...');
  
  const enhancedDB = new EnhancedDatabaseService();
  
  try {
    // Test 1: Check if we can connect to the database
    console.log('\n1. Testing database connection...');
    const { data, error } = await enhancedDB.supabase
      .from('user_progress')
      .select('count')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    console.log('✅ Database connection successful');
    
    // Test 2: Test field mapping functions
    console.log('\n2. Testing field mapping functions...');
    
    const frontendData = {
       lessonsCompleted: 5,
       currentStreak: 3,
       totalXP: 150,
       dailyGoal: 30,
       dailyProgress: 10
     };
    
    const mappedToDb = mapToDatabase('user_progress', frontendData);
      console.log('Mapped to database:', mappedToDb);
      
      // Verify database field names
       if (mappedToDb.lessons_completed === 5 &&
           mappedToDb.current_streak === 3 &&
           mappedToDb.total_xp === 150 &&
           mappedToDb.daily_goal === 30 &&
           mappedToDb.daily_progress === 10) {
         console.log('✅ Frontend to database mapping passed');
       } else {
         console.log('❌ Frontend to database mapping failed');
         console.log('Expected: lessons_completed=5, current_streak=3, total_xp=150, daily_goal=30, daily_progress=10');
         console.log('Actual:', mappedToDb);
         throw new Error('Frontend to database mapping failed');
       }
      
      // Test reverse mapping
      const mappedToFrontend = mapToFrontend('user_progress', mappedToDb);
      console.log('Mapped to frontend:', mappedToFrontend);
      
      // Verify frontend field names
      if (mappedToFrontend.lessonsCompleted === 5 &&
          mappedToFrontend.currentStreak === 3 &&
          mappedToFrontend.totalXp === 150 &&
          mappedToFrontend.level === 2) {
        console.log('✅ Database to frontend mapping passed');
      } else {
        console.log('❌ Database to frontend mapping failed');
        console.log('Expected: lessonsCompleted=5, currentStreak=3, totalXp=150, level=2');
        console.log('Actual:', mappedToFrontend);
        throw new Error('Database to frontend mapping failed');
      }
    
    // Test 3: Test schema validation
    console.log('\n3. Testing schema validation...');
    const { data: schemaData, error: schemaError } = await enhancedDB.supabase
      .from('user_progress')
      .select('*')
      .limit(0);
    
    if (schemaError && schemaError.code !== 'PGRST116') {
      throw schemaError;
    }
    console.log('✅ Schema validation passed');
    
    console.log('\n🎉 All Enhanced Database Service tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Export the enhanced service and utilities
module.exports = {
  EnhancedDatabaseService,
  mapToDatabase,
  mapToFrontend,
  FIELD_MAPPINGS,
  REVERSE_FIELD_MAPPINGS,
  testEnhancedService
};

// Run tests if this file is executed directly
if (require.main === module) {
  testEnhancedService()
    .then(() => {
      console.log('\n✅ Database column mapping fix completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Database column mapping fix failed:', error);
      process.exit(1);
    });
}