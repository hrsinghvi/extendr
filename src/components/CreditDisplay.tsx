/**
 * CreditDisplay Component
 * 
 * Shows remaining daily and monthly credits with visual indicators.
 * Compact design suitable for headers/sidebars.
 */
import { Zap, Sparkles, Info, ChevronDown } from "lucide-react";
import { useSubscriptionContext } from "@/context/SubscriptionContext";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface CreditDisplayProps {
  className?: string;
  showLabels?: boolean;
  compact?: boolean;
}

export function CreditDisplay({ 
  className, 
  showLabels = true,
  compact = false 
}: CreditDisplayProps) {
  const { 
    credits, 
    isLoadingCredits, 
    planName,
    isPro,
    isPremium,
  } = useSubscriptionContext();
  const [isOpen, setIsOpen] = useState(false);

  if (isLoadingCredits) {
    return (
      <div className={cn("flex items-center gap-2 text-muted-foreground", className)}>
        <div className="h-4 w-16 animate-pulse bg-muted rounded" />
      </div>
    );
  }

  if (!credits) {
    return null;
  }

  const dailyRemaining = credits.dailyRemaining;
  const dailyTotal = credits.dailyTotal;
  const monthlyRemaining = credits.monthlyRemaining;
  const monthlyTotal = credits.monthlyTotal;

  const totalRemaining = dailyRemaining + monthlyRemaining;
  const hasMonthlyCredits = monthlyTotal > 0;
  const totalCredits = dailyTotal + monthlyTotal;

  // Calculate progress percentages for the combined bar
  // Daily credits fill first (green), then monthly (blue-ish gray)
  const dailyPercent = dailyTotal > 0 ? (dailyRemaining / totalCredits) * 100 : 0;
  const monthlyPercent = monthlyTotal > 0 ? (monthlyRemaining / totalCredits) * 100 : 0;

  // Color based on remaining credits
  const getDailyColor = () => {
    if (dailyRemaining === 0) return "text-destructive";
    if (dailyRemaining === 1) return "text-yellow-500";
    return "text-emerald-500";
  };

  const getMonthlyColor = () => {
    if (monthlyRemaining === 0) return "text-destructive";
    if (monthlyRemaining <= monthlyTotal * 0.2) return "text-yellow-500";
    return "text-blue-500";
  };

  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 cursor-help",
            className
          )}>
            <Zap className={cn("h-3.5 w-3.5", getDailyColor())} />
            <span className="text-sm font-medium">{totalRemaining}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="p-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Daily:</span>
              <span className={cn("font-medium", getDailyColor())}>
                {dailyRemaining}/{dailyTotal}
              </span>
            </div>
            {hasMonthlyCredits && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Monthly:</span>
                <span className={cn("font-medium", getMonthlyColor())}>
                  {monthlyRemaining}/{monthlyTotal}
                </span>
              </div>
            )}
            <div className="pt-1 border-t border-border text-xs text-muted-foreground">
              {planName === 'free' ? 'Free plan' : `${planName.charAt(0).toUpperCase() + planName.slice(1)} plan`}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  // Default: Progress bar style with collapsible details
  return (
    <div className={cn("space-y-2", className)}>
      {/* Header with total remaining */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white">Credits</span>
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors">
              {totalRemaining} left
              <ChevronDown className={cn(
                "h-3 w-3 transition-transform duration-200",
                isOpen && "rotate-180"
              )} />
            </button>
          </CollapsibleTrigger>
        </div>

        {/* Combined progress bar */}
        <div className="h-2 bg-[#3a3a3a] rounded-full overflow-hidden mt-2 flex">
          {/* Daily credits segment (green) */}
          <div 
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${dailyPercent}%` }}
          />
          {/* Monthly credits segment (slate) */}
          {hasMonthlyCredits && (
            <div 
              className="h-full bg-slate-500 transition-all duration-300"
              style={{ width: `${monthlyPercent}%` }}
            />
          )}
        </div>

        {/* Info text */}
        <div className="flex items-center gap-1.5 mt-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-xs text-gray-400">Daily credits used first</span>
        </div>

        {/* Collapsible details */}
        <CollapsibleContent className="mt-3 space-y-2 border-t border-[#3a3a3a] pt-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              Daily
            </span>
            <span className={cn("font-medium", getDailyColor())}>
              {dailyRemaining}/{dailyTotal}
            </span>
          </div>
          {hasMonthlyCredits && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-slate-500" />
                Monthly
              </span>
              <span className={cn("font-medium", getMonthlyColor())}>
                {monthlyRemaining}/{monthlyTotal}
              </span>
            </div>
          )}
          <div className="text-xs text-gray-500 pt-1">
            {planName === 'free' ? 'Free plan' : `${planName.charAt(0).toUpperCase() + planName.slice(1)} plan`}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

/**
 * Credit bar progress indicator
 * Visual representation of remaining credits
 */
export function CreditBar({ className }: { className?: string }) {
  const { credits, planName } = useSubscriptionContext();

  if (!credits) return null;

  const dailyPercent = (credits.dailyRemaining / credits.dailyTotal) * 100;
  const monthlyPercent = credits.monthlyTotal > 0 
    ? (credits.monthlyRemaining / credits.monthlyTotal) * 100 
    : 0;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Daily progress */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Daily credits
          </span>
          <span>{credits.dailyRemaining}/{credits.dailyTotal}</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full transition-all duration-300",
              dailyPercent > 33 ? "bg-emerald-500" : dailyPercent > 0 ? "bg-yellow-500" : "bg-destructive"
            )}
            style={{ width: `${dailyPercent}%` }}
          />
        </div>
      </div>

      {/* Monthly progress (only for paid plans) */}
      {credits.monthlyTotal > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Monthly credits
            </span>
            <span>{credits.monthlyRemaining}/{credits.monthlyTotal}</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-300",
                monthlyPercent > 20 ? "bg-blue-500" : monthlyPercent > 0 ? "bg-yellow-500" : "bg-destructive"
              )}
              style={{ width: `${monthlyPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Reset info */}
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <Info className="h-3 w-3" />
        Daily credits reset at 12 AM PST
      </p>
    </div>
  );
}

