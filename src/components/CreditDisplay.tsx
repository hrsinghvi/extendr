/**
 * CreditDisplay Component
 *
 * Shows remaining monthly credits with visual indicators.
 * Compact design suitable for headers/sidebars.
 */
import { Zap, Info, ChevronDown } from "lucide-react";
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
    subscription,
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

  const monthlyRemaining = credits.monthlyRemaining;
  const monthlyTotal = credits.monthlyTotal;

  const getColor = () => {
    if (monthlyRemaining === 0) return "text-destructive";
    if (monthlyRemaining <= monthlyTotal * 0.2) return "text-yellow-500";
    return "text-emerald-500";
  };

  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 cursor-help",
            className
          )}>
            <Zap className={cn("h-3.5 w-3.5", getColor())} />
            <span className="text-sm font-medium">{monthlyRemaining}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="p-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Credits:</span>
              <span className={cn("font-medium", getColor())}>
                {monthlyRemaining}/{monthlyTotal}
              </span>
            </div>
            <div className="pt-1 border-t border-border text-xs text-muted-foreground">
              {`${planName.charAt(0).toUpperCase() + planName.slice(1)} plan`}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  const percent = monthlyTotal > 0 ? (monthlyRemaining / monthlyTotal) * 100 : 0;

  // Default: Progress bar style with collapsible details
  return (
    <div className={cn("space-y-2", className)}>
      {/* Header with total remaining */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white">Credits</span>
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors">
              {monthlyRemaining} left
              <ChevronDown className={cn(
                "h-3 w-3 transition-transform duration-200",
                isOpen && "rotate-180"
              )} />
            </button>
          </CollapsibleTrigger>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-[#3a3a3a] rounded-full overflow-hidden mt-2 flex">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Collapsible details */}
        <CollapsibleContent className="mt-3 space-y-2 border-t border-[#3a3a3a] pt-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              Monthly
            </span>
            <span className={cn("font-medium", getColor())}>
              {monthlyRemaining}/{monthlyTotal}
            </span>
          </div>
          {subscription?.currentPeriodEnd && (
            <div className="text-xs text-gray-500 pt-1">
              Resets on {subscription.currentPeriodEnd.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </div>
          )}
          <div className="text-xs text-gray-500">
            {`${planName.charAt(0).toUpperCase() + planName.slice(1)} plan`}
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

  const monthlyPercent = credits.monthlyTotal > 0
    ? (credits.monthlyRemaining / credits.monthlyTotal) * 100
    : 0;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Credits
          </span>
          <span>{credits.monthlyRemaining}/{credits.monthlyTotal}</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-300",
              monthlyPercent > 33 ? "bg-emerald-500" : monthlyPercent > 0 ? "bg-yellow-500" : "bg-destructive"
            )}
            style={{ width: `${monthlyPercent}%` }}
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <Info className="h-3 w-3" />
        Credits reset each billing cycle
      </p>
    </div>
  );
}
