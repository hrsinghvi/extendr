/**
 * useSubscription Hook
 * 
 * Fetches and subscribes to user's subscription status.
 * Provides plan info and helper methods for checking access.
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { getPlanInfo, type PlanName } from '@/lib/stripe';

export interface Subscription {
  id: string;
  planName: PlanName;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | 'incomplete_expired' | 'unpaid';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

export interface UseSubscriptionReturn {
  subscription: Subscription | null;
  planName: PlanName;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  isActive: boolean;
  isPro: boolean;
  isPremium: boolean;
  isFree: boolean;
}

export function useSubscription(): UseSubscriptionReturn {
  const { user, isAuthenticated } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSubscription = useCallback(async () => {
    if (!user?.id) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 = no rows found, which means free tier
        throw fetchError;
      }

      if (!data) {
        // No active subscription = free tier
        setSubscription(null);
        return;
      }

      setSubscription({
        id: data.id,
        planName: data.plan_name as PlanName,
        status: data.status as Subscription['status'],
        currentPeriodStart: new Date(data.current_period_start),
        currentPeriodEnd: new Date(data.current_period_end),
        cancelAtPeriodEnd: data.cancel_at_period_end,
      });

    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch subscription'));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Initial fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchSubscription();
    } else {
      setSubscription(null);
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchSubscription]);

  // Real-time subscription to subscription changes
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`subscriptions:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Subscription updated:', payload);
          fetchSubscription();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchSubscription]);

  const planName: PlanName = subscription?.planName ?? 'free';
  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing';
  const isPro = planName === 'pro' && isActive;
  const isPremium = planName === 'premium' && isActive;
  const isFree = !isActive || planName === 'free';

  return {
    subscription,
    planName,
    isLoading,
    error,
    refetch: fetchSubscription,
    isActive,
    isPro,
    isPremium,
    isFree,
  };
}

/**
 * Get readable plan info with features
 */
export function usePlanInfo() {
  const { planName } = useSubscription();
  return getPlanInfo(planName);
}

