# Supabase Setup Guide for EdLingo Language Learning App

This guide will help you set up Supabase as the database backend for your EdLingo Electron app.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Node.js and npm installed
- Your EdLingo Electron app project

## Step 1: Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Fill in your project details:
   - **Name**: `lingo-language-app` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the region closest to your users
5. Click "Create new project"
6. Wait for the project to be set up (this may take a few minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (looks like `https://your-project-id.supabase.co`)
   - **anon/public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## Step 3: Configure Environment Variables

1. In your project root, copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and replace the placeholder values:
   ```env
   VITE_SUPABASE_URL=https://your-actual-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
   ```

## Step 4: Set Up the Database Schema

### Option A: Automated Setup (Recommended)
```bash
node setup-database.js
```

### Option B: Manual Setup
1. In your Supabase dashboard, go to the **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `src/database/schema.sql`
4. Paste it into the SQL editor
5. Click "Run" to execute the schema

**Note**: See `DATABASE_SETUP_GUIDE.md` for comprehensive setup instructions and troubleshooting.

This will create all the necessary tables:
- `user_progress` - Track user learning progress
- `vocabulary` - Store vocabulary words and translations
- `user_vocabulary_progress` - Track individual word learning
- `grammar_lessons` - Store grammar lesson content
- `user_grammar_progress` - Track grammar lesson completion
- `chat_history` - Store AI chat conversations
- `user_settings` - Store user preferences
- `learning_sessions` - Track study sessions
- `achievements` - Define available achievements
- `user_achievements` - Track earned achievements

## Step 5: Configure Authentication (Optional)

If you want to enable user authentication:

1. Go to **Authentication** > **Settings** in your Supabase dashboard
2. Configure your authentication providers:
   - **Email**: Enable email/password authentication
   - **Social providers**: Enable Google, GitHub, etc. if desired
3. Set up email templates under **Authentication** > **Email Templates**

## Step 6: Set Up Row Level Security (RLS)

The schema already includes RLS policies, but you can review and modify them:

1. Go to **Authentication** > **Policies** in your Supabase dashboard
2. Review the automatically created policies
3. Modify as needed for your security requirements

## Step 7: Test the Connection

1. Start your Electron app:
   ```bash
   npm run dev
   ```

2. The app should now be able to connect to Supabase
3. Check the browser console for any connection errors

## Step 8: Seed Sample Data (Optional)

The schema includes some sample vocabulary words and grammar lessons. You can add more by:

1. Going to the **Table Editor** in Supabase
2. Selecting the `vocabulary` or `grammar_lessons` table
3. Adding new rows manually, or
4. Running additional SQL INSERT statements

## Database Service Usage

The `src/services/databaseService.js` file provides a complete API for interacting with your Supabase database:

```javascript
import { databaseService } from './src/services/databaseService.js'

// Get user progress
const progress = await databaseService.getUserProgress(userId)

// Add vocabulary
const newWord = await databaseService.addVocabulary({
  word: 'hola',
  translation: 'hello',
  level: 'beginner'
})

// Get chat history
const messages = await databaseService.getChatHistory(userId)
```

## Security Best Practices

1. **Never commit your `.env` file** - it's already in `.gitignore`
2. **Use Row Level Security** - already configured in the schema
3. **Validate user input** - always sanitize data before database operations
4. **Use the anon key for client-side** - never use the service role key in client code
5. **Enable 2FA** on your Supabase account

## Troubleshooting

### Connection Issues
- Verify your environment variables are correct
- Check that your Supabase project is active
- Ensure your internet connection is stable

### Authentication Issues
- Verify RLS policies are correctly configured
- Check that users are properly authenticated before database operations
- Review the Supabase logs in the dashboard

### Performance Issues
- Use the built-in indexes (already created in schema)
- Consider adding more indexes for frequently queried columns
- Monitor query performance in the Supabase dashboard

## Next Steps

After setting up Supabase:

1. **Implement AI Chat Integration** - Add OpenAI API for conversation practice
2. **Enhance Progress System** - Add more detailed analytics and progress tracking
3. **Add Vocabulary Management** - Create UI for adding/editing vocabulary
4. **Implement Spaced Repetition** - Use the vocabulary progress tracking for smart review scheduling

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com)
- [Supabase GitHub](https://github.com/supabase/supabase)

For project-specific issues, check the console logs and Supabase dashboard logs for detailed error messages.