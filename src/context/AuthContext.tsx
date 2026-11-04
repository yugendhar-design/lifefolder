import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLiveSupabase: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (fullName: string, email: string, password: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  updatePassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (fullName: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  enterPreviewMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = 'lifefolder_local_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      // Safety timeout: Never stay stuck on "Opening secure vault..." for more than 1.5 seconds
      const timeoutId = setTimeout(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      }, 1500);

      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) {
            console.warn('Session check error:', error);
          }
          if (session?.user && isMounted) {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              fullName: session.user.user_metadata?.full_name || 'Vault Owner',
              role: 'Vault Owner',
              created_at: session.user.created_at,
            });
          }

          const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!isMounted) return;
            if (session?.user) {
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                fullName: session.user.user_metadata?.full_name || 'Vault Owner',
                role: 'Vault Owner',
                created_at: session.user.created_at,
              });
            } else {
              setUser(null);
            }
          });

          return () => {
            isMounted = false;
            clearTimeout(timeoutId);
            subscription.unsubscribe();
          };
        } catch (err) {
          console.error('Supabase session load error:', err);
        }
      } else {
        // Local Vault storage fallback
        const saved = localStorage.getItem(LOCAL_USER_KEY);
        if (saved && isMounted) {
          try {
            setUser(JSON.parse(saved));
          } catch {
            localStorage.removeItem(LOCAL_USER_KEY);
          }
        }
      }

      if (isMounted) {
        clearTimeout(timeoutId);
        setIsLoading(false);
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: error.message };
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || email,
          fullName: data.user.user_metadata?.full_name || 'Vault Owner',
          role: 'Vault Owner',
          created_at: data.user.created_at,
        });
        return { success: true };
      }
    }

    // Local authentication fallback
    if (!email || !password) {
      return { success: false, error: 'Please enter both email and password.' };
    }
    const localUser: UserProfile = {
      id: 'local-vault-owner-1',
      email: email.trim().toLowerCase(),
      fullName: email.split('@')[0] || 'Alex Morgan',
      role: 'Vault Owner',
      created_at: new Date().toISOString(),
    };
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(localUser));
    setUser(localUser);
    return { success: true };
  };

  const signUp = async (fullName: string, email: string, password: string) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      if (error) return { success: false, error: error.message };
      if (data.session) {
        setUser({
          id: data.user!.id,
          email: data.user!.email || email,
          fullName: fullName,
          role: 'Vault Owner',
          created_at: data.user!.created_at,
        });
        return { success: true, message: 'Account created successfully.' };
      }
      return {
        success: true,
        message: 'Confirmation email sent. Please check your inbox to activate your account.',
      };
    }

    // Local mode signup
    const localUser: UserProfile = {
      id: 'local-vault-owner-' + Date.now(),
      email: email.trim().toLowerCase(),
      fullName: fullName.trim() || 'Alex Morgan',
      role: 'Vault Owner',
      created_at: new Date().toISOString(),
    };
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(localUser));
    setUser(localUser);
    return { success: true, message: 'Account created successfully.' };
  };

  const resetPassword = async (email: string) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/#reset-password`,
      });
      if (error) return { success: false, error: error.message };
      return { success: true, message: 'Password reset link sent to your email.' };
    }
    return {
      success: true,
      message: `Reset instructions sent to ${email} (Demonstration mode: email link simulation).`,
    };
  };

  const updatePassword = async (password: string) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) return { success: false, error: error.message };
      return { success: true };
    }
    return { success: true };
  };

  const updateProfile = async (fullName: string) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.updateUser({
        data: { full_name: fullName },
      });
      if (error) return { success: false, error: error.message };
      if (data.user) {
        setUser(prev => prev ? { ...prev, fullName } : null);
      }
      return { success: true };
    }
    if (user) {
      const updated = { ...user, fullName };
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updated));
      setUser(updated);
    }
    return { success: true };
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(LOCAL_USER_KEY);
    setUser(null);
  };

  const enterPreviewMode = () => {
    const previewUser: UserProfile = {
      id: 'preview-alex-morgan',
      email: 'alex.morgan@lifefolder.vault',
      fullName: 'Alex Morgan',
      role: 'Vault Owner',
      created_at: new Date().toISOString(),
    };
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(previewUser));
    setUser(previewUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isLiveSupabase: isSupabaseConfigured,
        signIn,
        signUp,
        resetPassword,
        updatePassword,
        updateProfile,
        signOut,
        enterPreviewMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
