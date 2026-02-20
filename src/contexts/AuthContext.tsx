/* eslint-disable react-refresh/only-export-components */
import * as React from "react";

import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";
import { logActivityEvent } from "@/hooks/useActivityLog";

function getErrorMessage(err: unknown): string {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null && "message" in err) {
    const maybe = err as Record<string, unknown>;
    if (typeof maybe.message === "string") return maybe.message;
  }
  try {
    return String(err);
  } catch {
    return "Unknown error";
  }
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes. Ignore transient null session updates
    // (e.g. token refresh cycles) so the UI doesn't treat short-lived
    // transitions as a full sign-out and redirect the user.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        return;
      }

      // For other events, prefer updating user only when a non-null
      // session.user exists. This avoids briefly setting user to null
      // during token refreshes or other internal cycles.
      if (session?.user) {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Memoize user based on user.id to prevent new object references
  // from triggering dependent effects when Supabase returns a new User object
  const memoizedUser = useMemo(() => user, [user?.id]);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Account created successfully. Please check your email to verify your account.",
      });

      await logActivityEvent({
        action: 'user_signup',
        entityType: 'user',
        details: { email }
      });
    } catch (err: unknown) {
      const msg = getErrorMessage(err) || "Failed to create account";
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
      throw err;
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });

      await logActivityEvent({
        action: 'user_login',
        entityType: 'user',
        details: { email }
      });
    } catch (err: unknown) {
      const msg = getErrorMessage(err) || "Failed to sign in";
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
      throw err;
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;
    } catch (err: unknown) {
      const msg = getErrorMessage(err) || "Failed to sign in with Google";
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
      throw err;
    }
  }, []);

  const signInWithFacebook = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;
    } catch (err: unknown) {
      const msg = getErrorMessage(err) || "Failed to sign in with Facebook";
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
      throw err;
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Check your email",
        description: "We've sent you a password reset link.",
      });
    } catch (err: unknown) {
      const msg = getErrorMessage(err) || "Failed to send reset email";
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
      throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await logActivityEvent({
        action: 'user_logout',
        entityType: 'user',
        userId: memoizedUser?.id
      });

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
    } catch (err: unknown) {
      const msg = getErrorMessage(err) || "Failed to sign out";
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
      throw err;
    }
  }, [memoizedUser]);

  const contextValue = useMemo(
    () => ({ user: memoizedUser, loading, signUp, signIn, signInWithGoogle, signInWithFacebook, resetPassword, signOut }),
    [memoizedUser, loading, signUp, signIn, signInWithGoogle, signInWithFacebook, resetPassword, signOut]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
