import React, { useState } from 'react';
import { Heart, Mail, Lock, LogIn, UserPlus, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';

interface HubLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Optional: if you still want to lift auth up */
  onLogin?: (email: string, password: string) => void;
}

export default function HubLoginModal({ isOpen, onClose, onLogin }: HubLoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const ensureProfile = async (userId: string, userEmail?: string | null) => {
    // Create a profiles row if missing (safe upsert)
    await supabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          email: userEmail ?? undefined,
          full_name: userEmail?.split('@')[0] ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      if (onLogin) {
        // Allow legacy parent handler if provided
        onLogin(email, password);
        setLoading(false);
        return;
      }

      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) throw error;
        if (data.user) await ensureProfile(data.user.id, data.user.email);

        // Let user know to verify their email
        setErr('Check your inbox to confirm your email, then sign in.');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) await ensureProfile(data.user.id, data.user.email);
        onClose();
      }
    } catch (e: any) {
      setErr(e.message ?? 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md mx-4 rounded-2xl border-0 shadow-2xl">
        <DialogHeader className="space-y-4 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8 text-green-600" />
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {isSignUp ? 'Create your account' : 'Welcome to NourishSA'}
          </DialogTitle>
          <p className="text-gray-600">
            {isSignUp
              ? 'Sign up to access local food hubs and resources'
              : 'Sign in to find food assistance in your community'}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                id="password"
                type="password"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>
          </div>

          {err && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {err}
            </div>
          )}

          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" size="lg" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait…
              </>
            ) : isSignUp ? (
              <>
                <UserPlus className="mr-2 h-4 w-4" /> Create Account
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" /> Sign In
              </>
            )}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-green-600 hover:text-green-700"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
