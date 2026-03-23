/**
 * useCredits Hook
 *
 * Fetches and subscribes to user's credit balance.
 * Monthly credits only — reset each billing cycle.
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface Credits {
  monthlyRemaining: number;
  monthlyTotal: number;
}

export interface UseCreditsReturn {
  credits: Credits | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  hasCredits: boolean;
  totalAvailable: number;
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
        throw fetchError;
      }

      if (!data) {
        setCredits({
          monthlyRemaining: 0,
          monthlyTotal: 0,
        });
        return;
      }

      setCredits({
        monthlyRemaining: data.monthly_credits_remaining,
        monthlyTotal: data.monthly_credits_total,
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

  const hasCredits = credits ? credits.monthlyRemaining > 0 : false;
  const totalAvailable = credits ? credits.monthlyRemaining : 0;

  return {
    credits,
    isLoading,
    error,
    refetch: fetchCredits,
    hasCredits,
    totalAvailable,
  };
}
