import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, Session, AuthError, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase, Profile } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

// Extend AuthChangeEvent to include EMAIL_CONFIRMED (custom convenience)
type ExtendedAuthChangeEvent = AuthChangeEvent | 'EMAIL_CONFIRMED';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, profile: Partial<Profile>) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
  hasRole: (role: Profile['role']) => boolean;
  isAdmin: boolean;
  isDonor: boolean;
  isRecipient: boolean;
  isVolunteer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const POST_LOGIN_ROUTE = '/dashboard'; // <-- change if needed

  /** 🔒 helper: redirect without causing reload-loops */
  const didRouteRef = useRef(false);
  const safeRouteReplace = (path: string) => {
    if (typeof window === 'undefined') return;
    const { pathname, search, hash } = window.location;
    if (pathname === path && !search && !hash) return; // already there
    // Use history.replaceState to avoid full reloads/HMR loops during dev
    window.history.replaceState({}, '', path);
    didRouteRef.current = true;
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (error) {
        console.warn('No profile found or error fetching profile:', error.message);
        return null;
      }
      return data as Profile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  const clearAuthState = () => {
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  // ✅ Handle /auth/callback once, without hard reloads
  const handleAuthCallbackIfNeeded = async () => {
    try {
      if (typeof window === 'undefined') return false;

      const isCallbackPath = window.location.pathname.startsWith('/auth/callback');
      const hasFragment = window.location.hash.includes('access_token');
      const hasCode = new URLSearchParams(window.location.search).get('code');

      if (isCallbackPath && (hasFragment || hasCode)) {
        const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (error) {
          console.error('exchangeCodeForSession error:', error.message);
          toast({ title: 'Sign-in error', description: error.message, variant: 'destructive' });
        }
        // Clean the URL and move to the app *without* reloading
        safeRouteReplace(POST_LOGIN_ROUTE);
        return true;
      }
    } catch (e: any) {
      console.error('Auth callback handling failed:', e?.message || e);
    }
    return false;
  };

  useEffect(() => {
    let unsub = () => {};

    const init = async () => {
      setLoading(true);

      // ⚠️ Do not signOut on load — causes loops
      const handled = await handleAuthCallbackIfNeeded();
      if (handled) {
        // We already routed; let onAuthStateChange populate state after exchangeCodeForSession
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('getSession error:', error.message);
          clearAuthState();
        } else {
          const current = data?.session ?? null;
          setSession(current);
          setUser(current?.user ?? null);
          if (current?.user) {
            const p = await fetchProfile(current.user.id);
            setProfile(p);
          }
        }
      } finally {
        setLoading(false);
      }

      const { data: listener } = supabase.auth.onAuthStateChange(async (event: ExtendedAuthChangeEvent, newSession) => {
        console.log('Auth state changed:', event, newSession?.user?.email);
        try {
          setSession(newSession ?? null);
          const u = newSession?.user ?? null;
          setUser(u);
          setProfile(u ? await fetchProfile(u.id) : null);

          // ✅ Only route after a true fresh SIGNED_IN, and only if not already on the target
          if (event === 'SIGNED_IN' && !didRouteRef.current) {
            safeRouteReplace(POST_LOGIN_ROUTE);
          }
        } catch (err) {
          console.error('Error in auth state change:', err);
          clearAuthState();
        } finally {
          setLoading(false);
        }
      });

      unsub = () => listener.subscription.unsubscribe();
    };

    init();

    // Safety timeout
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('Timeout: Forcing loading=false due to delay');
        setLoading(false);
      }
    }, 5000);

    return () => {
      unsub();
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signUp = async (email: string, password: string, profileData: Partial<Profile>) => {
    try {
      console.log('Starting sign up process for:', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: profileData.full_name,
            role: profileData.role || 'recipient',
            phone: profileData.phone,
            address: profileData.address,
            city: profileData.city,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('Sign up error:', error);
        toast({ title: 'Registration failed', description: error.message, variant: 'destructive' });
        return { error };
      }

      if (data.user && !data.session) {
        toast({
          title: 'Registration successful!',
          description: 'Please check your email and click the confirmation link to complete your registration.',
        });
      } else if (data.user && data.session) {
        toast({ title: 'Welcome to NourishSA!', description: 'Your account has been created successfully.' });
      }

      return { error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      toast({ title: 'Registration failed', description: 'An unexpected error occurred. Please try again.', variant: 'destructive' });
      return { error: error as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        console.error('Sign in error:', error);
        toast({ title: 'Sign in failed', description: error.message, variant: 'destructive' });
        return { error };
      }

      if (data.user) {
        const userProfile = await fetchProfile(data.user.id);
        setProfile(userProfile);
        toast({
          title: `Welcome back, ${userProfile?.full_name || data.user.user_metadata?.full_name || 'Friend'}!`,
          description: 'Successfully signed in.',
        });
        // Route softly (no reload) if not already there
        safeRouteReplace(POST_LOGIN_ROUTE);
      }

      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      toast({ title: 'Sign in failed', description: 'An unexpected error occurred. Please try again.', variant: 'destructive' });
      return { error: error as AuthError };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });

      if (error) {
        console.error('Google sign in error:', error);
        toast({ title: 'Google sign in failed', description: error.message, variant: 'destructive' });
        return { error };
      }
      return { error: null };
    } catch (error) {
      console.error('Google sign in error:', error);
      toast({ title: 'Google sign in failed', description: 'An unexpected error occurred. Please try again.', variant: 'destructive' });
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    console.log('Sign out function called');
    try {
      setLoading(true);
      await supabase.auth.signOut({ scope: 'local' });
      await supabase.auth.signOut({ scope: 'global' });
      clearAuthState();

      toast({ title: 'Signed out', description: 'You have been signed out successfully.' });

      // Soft route to login without forcing reload
      safeRouteReplace('/login');
    } catch (error) {
      console.error('Sign out error:', error);
      clearAuthState();
      toast({
        title: 'Sign out failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        variant: 'destructive',
      });
      safeRouteReplace('/login');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) {
        console.error('Profile update error:', error);
        toast({ title: 'Profile update failed', description: error.message, variant: 'destructive' });
        return { error };
      }

      if (profile) setProfile({ ...profile, ...updates });
      toast({ title: 'Profile updated', description: 'Your profile has been successfully updated.' });
      return { error: null };
    } catch (error) {
      console.error('Profile update error:', error);
      toast({ title: 'Profile update failed', description: 'An unexpected error occurred. Please try again.', variant: 'destructive' });
      return { error };
    }
  };

  const hasRole = (role: Profile['role']) => profile?.role === role;
  const isAdmin = profile?.role === 'admin';
  const isDonor = profile?.role === 'donor';
  const isRecipient = profile?.role === 'recipient';
  const isVolunteer = profile?.role === 'volunteer';

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
    hasRole,
    isAdmin,
    isDonor,
    isRecipient,
    isVolunteer,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
