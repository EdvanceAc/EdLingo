# Authentication System Setup Guide

## Overview

This guide documents the complete authentication system implementation for EdLingo, including Google OAuth integration with Supabase.

## Architecture

### Components Created

1. **AuthContext** (`src/renderer/contexts/AuthContext.jsx`)
   - Manages global authentication state
   - Provides authentication methods
   - Handles user session management

2. **Login Page** (`src/renderer/pages/Login.jsx`)
   - Email/password login form
   - Google OAuth sign-in button
   - Navigation to sign-up page

3. **Sign-Up Page** (`src/renderer/pages/SignUp.jsx`)
   - User registration form
   - Password strength validation
   - Google OAuth sign-up option

4. **ProtectedRoute** (`src/renderer/components/auth/ProtectedRoute.jsx`)
   - Route protection component
   - Redirects unauthenticated users to login

5. **AuthCallback** (`src/renderer/pages/AuthCallback.jsx`)
   - Handles OAuth redirect callbacks
   - Processes authentication results

## Setup Instructions

### 1. Supabase Configuration

#### Enable Google OAuth Provider

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Providers
3. Enable Google provider
4. Configure OAuth settings:
   - **Client ID**: Your Google OAuth client ID
   - **Client Secret**: Your Google OAuth client secret
   - **Redirect URL**: `https://your-project-ref.supabase.co/auth/v1/callback`

#### Update Site URL

1. Go to Authentication > URL Configuration
2. Set **Site URL** to: `http://localhost:3000` (for development)
3. Add **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/auth/login`

### 2. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials > Create Credentials > OAuth 2.0 Client IDs
5. Configure OAuth consent screen
6. Add authorized redirect URIs:
   - `https://your-project-ref.supabase.co/auth/v1/callback`

### 3. Environment Variables

Ensure your `.env` file contains:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Schema

The authentication system works with the existing `users` table. Ensure your Supabase database has:

```sql
-- Users table should already exist
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
```

## Authentication Flow

### Email/Password Authentication

1. User enters credentials on login/signup page
2. AuthContext calls Supabase auth methods
3. On success, user record is created/updated in `users` table
4. User is redirected to dashboard

### Google OAuth Flow

1. User clicks "Sign in with Google" button
2. Redirected to Google OAuth consent screen
3. After consent, redirected to `/auth/callback`
4. AuthCallback processes the authentication
5. User record is created/updated in `users` table
6. User is redirected to dashboard

## Route Protection

All main application routes are protected using `ProtectedRoute`:

- `/` (Dashboard)
- `/chat`
- `/enhanced-chat`
- `/live-conversation`
- `/pronunciation`
- `/vocabulary`
- `/grammar`
- `/settings`

Public routes:
- `/auth/login`
- `/auth/signup`
- `/auth/callback`

## Key Features

### AuthContext Features

- **Session Management**: Automatic session restoration on app load
- **User Synchronization**: Ensures Supabase Auth user exists in `users` table
- **Loading States**: Provides loading indicators during auth operations
- **Error Handling**: Comprehensive error handling for auth operations

### Security Features

- **Row Level Security**: Database policies ensure users can only access their data
- **Protected Routes**: Automatic redirection for unauthenticated users
- **Session Validation**: Continuous session validation
- **Secure Redirects**: Safe redirect handling after authentication

## Testing

### Manual Testing Steps

1. **Sign Up Flow**:
   - Navigate to `/auth/signup`
   - Test email/password registration
   - Test Google OAuth registration
   - Verify user creation in database

2. **Sign In Flow**:
   - Navigate to `/auth/login`
   - Test email/password login
   - Test Google OAuth login
   - Verify session persistence

3. **Route Protection**:
   - Try accessing protected routes without authentication
   - Verify redirect to login page
   - Test access after authentication

4. **Sign Out**:
   - Test sign out functionality
   - Verify session cleanup
   - Verify redirect to login page

## Troubleshooting

### Common Issues

1. **Google OAuth Not Working**:
   - Check Google Cloud Console configuration
   - Verify redirect URIs match exactly
   - Ensure Google+ API is enabled

2. **Supabase Connection Issues**:
   - Verify environment variables
   - Check Supabase project settings
   - Ensure RLS policies are configured

3. **Redirect Issues**:
   - Check Site URL configuration in Supabase
   - Verify redirect URLs are whitelisted
   - Ensure callback route is properly configured

### Debug Tips

- Check browser console for authentication errors
- Monitor Supabase Auth logs in dashboard
- Verify database user records are being created
- Test with different browsers/incognito mode

## Next Steps

1. **Email Verification**: Implement email verification for new accounts
2. **Password Reset**: Add forgot password functionality
3. **Profile Management**: Create user profile editing interface
4. **Social Providers**: Add more OAuth providers (Facebook, GitHub, etc.)
5. **Two-Factor Authentication**: Implement 2FA for enhanced security

## File Structure

```
src/
├── renderer/
│   ├── contexts/
│   │   └── AuthContext.jsx
│   ├── components/
│   │   └── auth/
│   │       └── ProtectedRoute.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── SignUp.jsx
│   │   └── AuthCallback.jsx
│   └── App.jsx (updated with auth routes)
└── services/
    └── databaseService.js (updated with Google OAuth)
```

This authentication system provides a robust foundation for user management in the EdLingo application, with both traditional email/password and modern OAuth authentication options.