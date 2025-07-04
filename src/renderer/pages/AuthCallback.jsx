import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Card } from '../components/ui/Card';
import { AlertCircle, CheckCircle } from 'lucide-react';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [status, setStatus] = useState('processing'); // 'processing', 'success', 'error'
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check for error parameters first
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        if (error) {
          console.error('OAuth error:', error, errorDescription);
          setStatus('error');
          setMessage(errorDescription || 'Authentication failed. Please try again.');
          setTimeout(() => {
            navigate('/auth/login', { replace: true });
          }, 3000);
          return;
        }

        // For Supabase OAuth, we need to handle the session exchange
        // Supabase automatically processes the OAuth callback and updates the session
        console.log('Processing OAuth callback...');
        
        // Get the current session to see if authentication was successful
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setStatus('error');
          setMessage('Failed to retrieve authentication session.');
          setTimeout(() => {
            navigate('/auth/login', { replace: true });
          }, 3000);
          return;
        }

        if (session && session.user) {
          console.log('Authentication successful:', session.user.email);
          setStatus('success');
          setMessage('Authentication successful! Redirecting...');
          
          // Wait a moment for the auth context to update
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 2000);
        } else {
          // Wait a bit more for the session to be established
          console.log('No session found, waiting for auth state change...');
          // The useEffect below will handle the redirect once user is set
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred during authentication.');
        setTimeout(() => {
          navigate('/auth/login', { replace: true });
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [searchParams, navigate]);

  // Monitor auth state changes
  useEffect(() => {
    if (!loading) {
      if (user) {
        console.log('User authenticated via context:', user.email);
        setStatus('success');
        setMessage('Authentication successful! Redirecting...');
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1000);
      } else if (status === 'processing') {
        // If we're still processing and no user after loading is complete,
        // wait a bit more before showing error
        setTimeout(() => {
          if (!user && status === 'processing') {
            setStatus('error');
            setMessage('Authentication failed - no user data received.');
            setTimeout(() => {
              navigate('/auth/login', { replace: true });
            }, 3000);
          }
        }, 3000);
      }
    }
  }, [user, loading, status, navigate]);

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-8 h-8 text-red-500" />;
      default:
        return <LoadingSpinner className="w-8 h-8 text-blue-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-700 dark:text-green-400';
      case 'error':
        return 'text-red-700 dark:text-red-400';
      default:
        return 'text-blue-700 dark:text-blue-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="p-8 shadow-xl max-w-md w-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl font-bold text-white">EL</span>
          </div>
          
          <div className="mb-6">
            {getStatusIcon()}
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {status === 'processing' && 'Processing Authentication'}
            {status === 'success' && 'Authentication Successful'}
            {status === 'error' && 'Authentication Failed'}
          </h1>
          
          <p className={`text-sm ${getStatusColor()}`}>
            {message}
          </p>
          
          {status === 'error' && (
            <div className="mt-6">
              <button
                onClick={() => navigate('/auth/login', { replace: true })}
                className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                Return to Login
              </button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AuthCallback;