import React, { createContext, useContext, useState, useEffect } from 'react';
import supabaseService from '../services/supabaseService.js';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  // Initialize auth state and listen for changes
  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { success, session: currentSession } = await supabaseService.getSession();
        if (mounted && success && currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabaseService.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);
  
  const signUp = async (email, password, metadata = {}) => {
    try {
      setLoading(true);
      const result = await supabaseService.signUp(email, password, metadata);
      
      if (result.success) {
        return { data: result.data, error: null };
      } else {
        return { data: null, error: new Error(result.error) };
      }
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const result = await supabaseService.signIn(email, password);
      
      if (result.success) {
        return { data: result.data, error: null };
      } else {
        return { data: null, error: new Error(result.error) };
      }
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const result = await supabaseService.signInWithGoogle();
      
      if (result.success) {
        return { data: result.data, error: null };
      } else {
        return { data: null, error: new Error(result.error) };
      }
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const result = await supabaseService.signOut();
      
      if (result.success) {
        setUser(null);
        setSession(null);
        return { error: null };
      } else {
        return { error: new Error(result.error) };
      }
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    try {
      const result = await supabaseService.resetPassword(email);
      
      if (result.success) {
        return { data: result.data, error: null };
      } else {
        return { data: null, error: new Error(result.error) };
      }
    } catch (error) {
      return { data: null, error };
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      const result = await supabaseService.updatePassword(newPassword);
      
      if (result.success) {
        return { data: result.data, error: null };
      } else {
        return { data: null, error: new Error(result.error) };
      }
    } catch (error) {
      return { data: null, error };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;