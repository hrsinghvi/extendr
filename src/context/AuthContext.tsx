/**
 * AuthContext - Single source of truth for authentication state
 * 
 * Handles:
 * - Initial session hydration (including OAuth redirect tokens)
 * - Real-time auth state changes (sign-in, sign-out, token refresh)
 * - Exposes user, session, loading state, and sign-out method
 */
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { notifyError } from "@/core/errorBus";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Update auth state from session
   * Centralized to avoid duplication
   */
  const updateAuthState = useCallback((newSession: Session | null) => {
    setSession(newSession);
    setUser(newSession?.user ?? null);
  }, []);

  useEffect(() => {
    let mounted = true;
    let initialSessionResolved = false;

    /**
     * Session hydration flow:
     * 1. Set up auth state listener FIRST (catches OAuth redirect events)
     * 2. Then call getSession() to get any existing session
     * 
     * This order is critical per Supabase docs to prevent race conditions
     * with OAuth redirects that happen before getSession() returns.
     */

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, currentSession: Session | null) => {
        if (!mounted) return;

        console.log("[AuthContext] Auth event:", event, currentSession?.user?.email ?? "no user");

        // Update state on any auth event
        updateAuthState(currentSession);

        // If we encountered the initial session with no user yet, try a short retry to hydrate
        if (event === 'INITIAL_SESSION' && !currentSession) {
          // Small retry loop to catch a session that becomes available momentarily after redirect
          let pollCount = 0;
          const pollInterval = setInterval(async () => {
            try {
              const { data: { session: polledSession } } = await supabase.auth.getSession();
              if (polledSession) {
                updateAuthState(polledSession);
                setIsLoading(false);
                clearInterval(pollInterval);
              } else {
                pollCount++;
                if (pollCount >= 10) {
                  // give up after ~2s
                  setIsLoading(false);
                  clearInterval(pollInterval);
                }
              }
            } catch {
              pollCount++;
              if (pollCount >= 10) {
                setIsLoading(false);
                clearInterval(pollInterval);
              }
            }
          }, 200);
        }

        // If we haven't resolved initial session yet and this is a SIGNED_IN event
        // (OAuth redirect), mark loading as complete
        if (!initialSessionResolved && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
          initialSessionResolved = true;
          setIsLoading(false);
        }

        // Always mark loading complete on these events
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          setIsLoading(false);
        }
      }
    );

    // Get initial session (for page refresh with existing session in localStorage)
    supabase.auth.getSession()
      .then(({ data: { session: initialSession }, error }) => {
        if (!mounted) return;

        if (error) {
          console.error("[AuthContext] Error getting session:", error);
          notifyError({
            title: "Session error",
            description: "Failed to restore your session. Please sign in again.",
            variant: "destructive"
          });
        }

        console.log("[AuthContext] Initial session:", initialSession?.user?.email ?? "no session");

        // Only update if listener hasn't already handled it
        if (!initialSessionResolved) {
          updateAuthState(initialSession);
          initialSessionResolved = true;
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [updateAuthState]);

  /**
   * Sign out the current user
   * Clears session from Supabase and local state
   */
  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // State will be cleared by onAuthStateChange listener
    } catch (error: any) {
      console.error("[AuthContext] Sign out error:", error);
      notifyError({
        title: "Sign out failed",
        description: error?.message ?? "Unable to sign out. Please try again.",
        variant: "destructive"
      });
      throw error; // Re-throw so callers can handle if needed
    }
  }, []);

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: !!session && !!user,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context
 * Must be used within AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
