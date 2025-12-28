/**
 * SubscriptionContext - Subscription and credits state management
 * 
 * Provides:
 * - Current subscription plan (free/pro/premium)
 * - Credit balance (daily + monthly)
 * - Methods for using credits and checking access
 */
import { createContext, useContext, ReactNode, useCallback, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSubscription, type Subscription } from "@/hooks/useSubscription";
import { useCredits, type Credits } from "@/hooks/useCredits";
import { useCredit as callUseCredit, type CreditResponse, type PlanName } from "@/lib/stripe";

interface SubscriptionContextType {
  // Subscription state
  subscription: Subscription | null;
  planName: PlanName;
  isActive: boolean;
  isPro: boolean;
  isPremium: boolean;
  isFree: boolean;
  
  // Credits state
  credits: Credits | null;
  hasCredits: boolean;
  totalCreditsAvailable: number;
  
  // Loading states
  isLoadingSubscription: boolean;
  isLoadingCredits: boolean;
  
  // Actions
  useCredit: () => Promise<CreditResponse>;
  refetchSubscription: () => Promise<void>;
  refetchCredits: () => Promise<void>;
  
  // Credit usage state (for blocking UI during credit check)
  isUsingCredit: boolean;
  lastCreditResult: CreditResponse | null;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  // Use the hooks
  const {
    subscription,
    planName,
    isLoading: isLoadingSubscription,
    refetch: refetchSubscription,
    isActive,
    isPro,
    isPremium,
    isFree,
  } = useSubscription();

  const {
    credits,
    isLoading: isLoadingCredits,
    refetch: refetchCredits,
    hasCredits,
    totalAvailable: totalCreditsAvailable,
  } = useCredits();

  // Credit usage state
  const [isUsingCredit, setIsUsingCredit] = useState(false);
  const [lastCreditResult, setLastCreditResult] = useState<CreditResponse | null>(null);

  /**
   * Use a credit for an AI message
   * Returns the result and updates local state
   */
  const useCredit = useCallback(async (): Promise<CreditResponse> => {
    if (!isAuthenticated) {
      const result: CreditResponse = {
        allowed: false,
        message: 'Not authenticated',
        dailyRemaining: 0,
        monthlyRemaining: 0,
        monthlyTotal: 0,
        planName: 'free',
      };
      setLastCreditResult(result);
      return result;
    }

    setIsUsingCredit(true);
    try {
      const result = await callUseCredit();
      setLastCreditResult(result);
      
      // Refetch credits to sync UI
      await refetchCredits();
      
      return result;
    } catch (error) {
      console.error('Error using credit:', error);
      const result: CreditResponse = {
        allowed: false,
        message: error instanceof Error ? error.message : 'Failed to use credit',
        dailyRemaining: credits?.dailyRemaining ?? 0,
        monthlyRemaining: credits?.monthlyRemaining ?? 0,
        monthlyTotal: credits?.monthlyTotal ?? 0,
        planName,
      };
      setLastCreditResult(result);
      return result;
    } finally {
      setIsUsingCredit(false);
    }
  }, [isAuthenticated, refetchCredits, credits, planName]);

  const value: SubscriptionContextType = {
    // Subscription
    subscription,
    planName,
    isActive,
    isPro,
    isPremium,
    isFree,
    
    // Credits
    credits,
    hasCredits,
    totalCreditsAvailable,
    
    // Loading
    isLoadingSubscription,
    isLoadingCredits,
    
    // Actions
    useCredit,
    refetchSubscription,
    refetchCredits,
    
    // Credit usage
    isUsingCredit,
    lastCreditResult,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

/**
 * Hook to access subscription context
 * Must be used within SubscriptionProvider
 */
export function useSubscriptionContext() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscriptionContext must be used within a SubscriptionProvider");
  }
  return context;
}

/**
 * Convenience hook for just checking if user has credits
 */
export function useHasCredits(): boolean {
  const { hasCredits } = useSubscriptionContext();
  return hasCredits;
}

/**
 * Convenience hook for plan checks
 */
export function usePlanAccess() {
  const { isPro, isPremium, isFree, planName } = useSubscriptionContext();
  return { isPro, isPremium, isFree, planName };
}

