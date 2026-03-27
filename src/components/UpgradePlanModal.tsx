/**
 * UpgradePlanModal Component
 *
 * Shown when a free-plan user tries to access a feature not included in their plan.
 */
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface UpgradePlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureName?: string;
}

export function UpgradePlanModal({ open, onOpenChange, featureName = "This feature" }: UpgradePlanModalProps) {
  const navigate = useNavigate();

  const handleCheckPricing = () => {
    onOpenChange(false);
    navigate("/pricing");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm p-6 gap-5 bg-[#232323] border border-[#3a3a3a]">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#5A9665]/10 border border-[#5A9665]/30">
            <Lock className="h-5 w-5 text-[#5A9665]" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-lg font-semibold text-white">
              Not included in your plan
            </h2>
            <p className="text-sm text-gray-400">
              {featureName} is available on paid plans. Upgrade to export your extension and access more credits.
            </p>
          </div>

          <Button
            onClick={handleCheckPricing}
            className="w-full bg-[#5A9665] hover:bg-[#4A8655] text-white"
          >
            Check Pricing
          </Button>

          <button
            onClick={() => onOpenChange(false)}
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            Maybe later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
