/**
 * SubscriptionRequiredModal
 *
 * Shown when a user tries to use the app without an active subscription.
 * Directs them to the pricing page to subscribe.
 */
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SubscriptionRequiredModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubscriptionRequiredModal({ open, onOpenChange }: SubscriptionRequiredModalProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm p-6 gap-5 bg-[#232323] border border-[#5A9665]/50">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#5A9665]/10">
            <Sparkles className="h-7 w-7 text-[#5A9665]" />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Subscription Required
            </h2>
            <p className="text-sm text-gray-400">
              You need an active plan to start building extensions. Choose a plan to get started.
            </p>
          </div>

          <Button
            onClick={() => {
              onOpenChange(false);
              navigate('/pricing');
            }}
            className="w-full bg-[#5A9665] hover:bg-[#4a8655] text-white py-3"
          >
            Go to Pricing
          </Button>

          <button
            onClick={() => onOpenChange(false)}
            className="text-sm text-gray-500 hover:text-white transition-colors"
          >
            Maybe later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
