import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, isConfigured } from '../lib/supabase';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isConfigured) {
      console.log('Supabase not configured');
      setLoading(false);
      return;
    }

    console.log('Setting up auth...');

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
      }
      console.log('Initial session:', session?.user?.id || 'No user');
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id || 'No user');
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in, creating/updating profile...');
          // Create or update profile
          const { error } = await supabase
            .from('profiles')
            .upsert({
              id: session.user.id,
              name: session.user.user_metadata?.full_name || session.user.email!,
              email: session.user.email!,
              full_name: session.user.user_metadata?.full_name,
              avatar: session.user.user_metadata?.avatar_url,
              updated_at: new Date().toISOString(),
            });
          
          if (error) {
            console.error('Error updating profile:', error);
            toast.error('Error setting up profile: ' + error.message);
          } else {
            console.log('Profile updated successfully');
            toast.success('Welcome to TaskFlow!');
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    if (!isConfigured) {
      toast.error('Supabase not configured. Please set up your environment variables.');
      return;
    }

    try {
      console.log('Attempting email sign in...');
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Email sign in error:', error);
        toast.error('Failed to sign in: ' + error.message);
        throw error;
      }
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    if (!isConfigured) {
      toast.error('Supabase not configured. Please set up your environment variables.');
      return;
    }

    try {
      console.log('Attempting email sign up...');
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}`
        }
      });
      
      if (error) {
        console.error('Email sign up error:', error);
        toast.error('Failed to create account: ' + error.message);
        throw error;
      }
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    if (!isConfigured) {
      toast.error('Supabase not configured. Please set up your environment variables.');
      return;
    }

    try {
      console.log('Attempting Google sign in...');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`
        }
      });
      
      if (error) {
        console.error('Google sign in error:', error);
        toast.error('Failed to sign in with Google: ' + error.message);
        throw error;
      }
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signInWithGithub = async () => {
    if (!isConfigured) {
      toast.error('Supabase not configured. Please set up your environment variables.');
      return;
    }

    try {
      console.log('Attempting GitHub sign in...');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}`
        }
      });
      
      if (error) {
        console.error('GitHub sign in error:', error);
        toast.error('Failed to sign in with GitHub: ' + error.message);
        throw error;
      }
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    if (!isConfigured) {
      toast.error('Supabase not configured');
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error('Failed to sign out');
        throw error;
      }
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithGithub,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};