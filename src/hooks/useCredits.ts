/**
 * useCredits Hook
 * 
 * Fetches and subscribes to user's credit balance.
 * Handles daily reset check on the client side for immediate UI update.
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface Credits {
  dailyRemaining: number;
  dailyTotal: number;
  monthlyRemaining: number;
  monthlyTotal: number;
  lastDailyReset: string;
}

export interface UseCreditsReturn {
  credits: Credits | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  hasCredits: boolean;
  totalAvailable: number;
}

const DEFAULT_DAILY_CREDITS = 100;

/**
 * Get current date in PST timezone (YYYY-MM-DD format)
 */
function getCurrentPSTDate(): string {
  const now = new Date();
  const pstDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  const year = pstDate.getFullYear();
  const month = String(pstDate.getMonth() + 1).padStart(2, '0');
  const day = String(pstDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function useCredits(): UseCreditsReturn {
  const { user, isAuthenticated } = useAuth();
  const [credits, setCredits] = useState<Credits | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCredits = useCallback(async () => {
    if (!user?.id) {
      setCredits(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 = no rows found, which is fine for new users
        throw fetchError;
      }

      if (!data) {
        // New user - they have default credits
        setCredits({
          dailyRemaining: DEFAULT_DAILY_CREDITS,
          dailyTotal: DEFAULT_DAILY_CREDITS,
          monthlyRemaining: 0,
          monthlyTotal: 0,
          lastDailyReset: getCurrentPSTDate(),
        });
        return;
      }

      // Check if daily reset is needed (client-side optimistic check)
      const currentPSTDate = getCurrentPSTDate();
      const lastReset = data.daily_credits_last_reset;
      
      let dailyRemaining = data.daily_credits_remaining;
      
      // If the last reset was before today (PST), show full daily credits
      // The actual reset will happen on the server when they use a credit
      if (lastReset < currentPSTDate) {
        dailyRemaining = DEFAULT_DAILY_CREDITS;
      }

      setCredits({
        dailyRemaining,
        dailyTotal: DEFAULT_DAILY_CREDITS,
        monthlyRemaining: data.monthly_credits_remaining,
        monthlyTotal: data.monthly_credits_total,
        lastDailyReset: lastReset,
      });

    } catch (err) {
      console.error('Error fetching credits:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch credits'));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Initial fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchCredits();
    } else {
      setCredits(null);
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchCredits]);

  // Real-time subscription to credit changes
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`user_credits:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_credits',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Credits updated:', payload);
          fetchCredits();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchCredits]);

  const hasCredits = credits 
    ? (credits.dailyRemaining > 0 || credits.monthlyRemaining > 0)
    : false;

  const totalAvailable = credits 
    ? credits.dailyRemaining + credits.monthlyRemaining
    : 0;

  return {
    credits,
    isLoading,
    error,
    refetch: fetchCredits,
    hasCredits,
    totalAvailable,
  };
}

