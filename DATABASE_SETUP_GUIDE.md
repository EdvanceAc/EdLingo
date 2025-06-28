# Database Setup Guide

## 📋 Overview

This guide provides comprehensive instructions for setting up the EdLingo Language Learning app database using the unified schema.

## 🎯 Schema Consolidation

**Important**: We have consolidated to a single, comprehensive database schema located at `src/database/schema.sql`. This schema includes:

- ✅ Complete user progress tracking
- ✅ Advanced vocabulary management
- ✅ Grammar lesson system
- ✅ Chat history with metadata
- ✅ Achievement system
- ✅ Learning sessions tracking
- ✅ Comprehensive user settings
- ✅ Row Level Security (RLS) policies
- ✅ Performance indexes
- ✅ Automatic triggers and functions

## 🚀 Setup Options

### Option 1: Automated Setup (Recommended)

```bash
# Ensure your .env file is configured with Supabase credentials
node setup-database.js
```

**Prerequisites:**
- `.env` file with `VITE_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Node.js installed
- Supabase project created

### Option 2: Manual Setup

1. **Access Supabase Dashboard**
   - Go to your [Supabase Dashboard](https://supabase.com/dashboard)
   - Navigate to SQL Editor

2. **Execute Schema**
   - Copy the entire contents of `src/database/schema.sql`
   - Paste into SQL Editor
   - Click "Run" to execute

3. **Verify Setup**
   ```bash
   node test-settings.js
   ```

## 🔧 Environment Configuration

Ensure your `.env` file contains:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 📊 Database Tables Created

### Core Tables
- `user_progress` - User learning progress and statistics
- `user_settings` - User preferences and configuration
- `vocabulary` - Word database with translations and metadata
- `grammar_lessons` - Grammar lesson content and structure
- `chat_history` - AI conversation history

### Progress Tracking
- `user_vocabulary_progress` - Individual word learning progress
- `user_grammar_progress` - Grammar lesson completion status
- `learning_sessions` - Study session tracking

### Gamification
- `achievements` - Achievement definitions
- `user_achievements` - User achievement records

## 🔒 Security Features

- **Row Level Security (RLS)** enabled on all user tables
- **User isolation** - Users can only access their own data
- **Public read access** for vocabulary and grammar content
- **Service role restrictions** for administrative operations

## 🧪 Testing Your Setup

### 1. Basic Connection Test
```bash
node test-supabase.js
```

### 2. Settings Test
```bash
node test-settings.js
```

### 3. Full API Test
```bash
node test-supabase-api.js
```

## 🚨 Troubleshooting

### Common Issues

**Policy Conflicts**
```sql
-- If you encounter policy conflicts, drop existing policies:
DROP POLICY IF EXISTS "policy_name" ON table_name;
```

**Permission Errors**
- Ensure you're using the service role key for setup
- Check that RLS policies are correctly configured

**Connection Issues**
- Verify your Supabase URL and keys
- Check network connectivity
- Ensure your Supabase project is active

### Getting Help

1. Check the console output for specific error messages
2. Verify your environment variables
3. Test with the provided test scripts
4. Review Supabase dashboard for any issues

## 📈 Next Steps

After successful database setup:

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Test Core Features**
   - User registration/login
   - Settings management
   - Vocabulary learning
   - Chat functionality

3. **Monitor Performance**
   - Check query performance in Supabase dashboard
   - Monitor RLS policy effectiveness
   - Review database usage metrics

## 🔄 Migration Notes

If you previously used a different schema:

1. **Backup existing data** before applying new schema
2. **Review data compatibility** with new table structures
3. **Test thoroughly** before deploying to production
4. **Update application code** if table structures changed

---

**Note**: This unified schema approach eliminates confusion from multiple schema files and provides a comprehensive foundation for all app features.