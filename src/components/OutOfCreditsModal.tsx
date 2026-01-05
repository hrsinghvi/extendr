/**
 * OutOfCreditsModal Component
 * 
 * Compact modal that displays when user runs out of credits.
 * Shows current plan, credits remaining, reset timer, and upgrade options.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Crown } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useSubscriptionContext } from "@/context/SubscriptionContext";
import { redirectToCheckout, redirectToPortal } from "@/lib/stripe";
import { cn } from "@/lib/utils";

interface OutOfCreditsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OutOfCreditsModal({ open, onOpenChange }: OutOfCreditsModalProps) {
  const navigate = useNavigate();
  const { planName, isFree, isPro, credits } = useSubscriptionContext();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async (plan: 'pro' | 'premium') => {
    setIsLoading(true);
    try {
      await redirectToCheckout(plan, 'monthly');
    } catch (error) {
      console.error('Checkout error:', error);
      navigate('/pricing');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsLoading(true);
    try {
      await redirectToPortal();
    } catch (error) {
      console.error('Portal error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeUntilReset = () => {
    const now = new Date();
    const pst = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
    const midnight = new Date(pst);
    midnight.setHours(24, 0, 0, 0);
    
    const diff = midnight.getTime() - pst.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const totalRemaining = (credits?.dailyRemaining ?? 0) + (credits?.monthlyRemaining ?? 0);
  const totalMax = (credits?.dailyTotal ?? 100) + (credits?.monthlyTotal ?? 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm p-5 gap-4 bg-[#232323] border border-[#5A9665]/50">
        {/* Title */}
        <h2 className="text-xl font-semibold text-white text-center">
          Out of Credits
        </h2>

        {/* Status card */}
        <div className="rounded-xl bg-[#1a1a1a] border border-[#3a3a3a] p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400 uppercase tracking-wide text-xs font-medium">Current Plan</span>
            <span className="font-semibold capitalize text-white">{planName}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400 uppercase tracking-wide text-xs font-medium">Remaining Credits</span>
            <span className="font-semibold text-destructive">{totalRemaining}/{totalMax}</span>
          </div>
        </div>

        {/* Reset timer */}
        <p className="text-center text-sm text-gray-400">
          Daily credits reset in {getTimeUntilReset()}
        </p>

        {/* Upgrade options - side by side for free users */}
        {isFree && (
          <div className="grid grid-cols-2 gap-3">
            {/* Pro */}
            <button
              onClick={() => handleUpgrade('pro')}
              disabled={isLoading}
              className={cn(
                "flex flex-col items-center p-4 rounded-xl border border-[#3a3a3a] bg-[#1a1a1a]",
                "hover:border-[#5A9665]/50 hover:bg-[#5A9665]/5 transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5A9665]/10 mb-2">
                <Sparkles className="h-5 w-5 text-[#5A9665]" />
              </div>
              <span className="font-medium text-sm text-white">Pro</span>
              <span className="text-xs text-gray-400">+40/mo</span>
              <span className="text-sm font-semibold mt-1 text-white">$20</span>
            </button>

            {/* Premium */}
            <button
              onClick={() => handleUpgrade('premium')}
              disabled={isLoading}
              className={cn(
                "flex flex-col items-center p-4 rounded-xl border border-blue-500/30 bg-[#1a1a1a]",
                "hover:border-blue-500/50 transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 mb-2">
                <Crown className="h-5 w-5 text-blue-400" />
              </div>
              <span className="font-medium text-sm text-white">Premium</span>
              <span className="text-xs text-gray-400">+80/mo</span>
              <span className="text-sm font-semibold mt-1 text-white">$40</span>
            </button>
          </div>
        )}

        {/* Pro users - upgrade to premium */}
        {isPro && (
          <button
            onClick={() => handleUpgrade('premium')}
            disabled={isLoading}
            className={cn(
              "flex items-center justify-center gap-3 p-4 rounded-xl border border-blue-500/30 bg-[#1a1a1a]",
              "hover:border-blue-500/50 transition-colors w-full",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <Crown className="h-5 w-5 text-blue-400" />
            <span className="font-medium text-white">Upgrade to Premium</span>
            <span className="font-semibold text-white">$40/mo</span>
          </button>
        )}

        {/* Premium users */}
        {planName === 'premium' && (
          <button
            onClick={handleManageSubscription}
            disabled={isLoading}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Manage subscription
          </button>
        )}
      </DialogContent>
    </Dialog>
  );
}

