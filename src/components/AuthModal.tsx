/**
 * AuthModal - Quick auth modal for inline sign-up/sign-in
 * 
 * Used when user tries to perform authenticated action (e.g., build prompt)
 * without being signed in. Offers Google OAuth and email auth options.
 */
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { notifyError } from "@/core/errorBus";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "signup" | "login";
}

export function AuthModal({ isOpen, onClose, mode }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  /**
   * Handle Google OAuth sign-in
   */
  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;
      // Browser will redirect to Google
    } catch (error: any) {
      console.error("Error with Google auth:", error);
      notifyError({
        title: "Google sign-in failed",
        description: error?.message ?? "Unable to sign in with Google. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  /**
   * Navigate to email auth page
   */
  const handleEmailAuth = () => {
    onClose();
    navigate("/auth", { state: { isSignUp: mode === "signup" } });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[350px] bg-[#212121] border-[#2a2a2a] text-white p-0 overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4 text-white" />
          <span className="sr-only">Close</span>
        </button>

        <div className="relative p-4">
          {/* Title and subtitle */}
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-1" role="heading" aria-level={2}>
              Start building.
            </h2>
            <p className="text-sm text-gray-500" role="contentinfo">
              {mode === "signup" 
                ? "Create your free account and start building!" 
                : "Log in to your account!"}
            </p>
          </div>

          {/* Auth buttons */}
          <div className="space-y-2">
            {/* Google button */}
            <button
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-[#2a2a2a] hover:bg-[#333333] border border-[#3a3a3a] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#fff"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#fff"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#fff"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#fff"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-xs font-medium">
                {isLoading ? "Connecting..." : "Continue with Google"}
              </span>
            </button>

            {/* Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#3a3a3a]"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-[#212121] text-gray-500 font-medium">OR</span>
              </div>
            </div>

            {/* Email button */}
            <button
              onClick={handleEmailAuth}
              disabled={isLoading}
              className="w-full px-3 py-2.5 bg-white hover:bg-gray-100 text-black rounded-lg transition-colors font-medium text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue with email
            </button>
          </div>

          {/* Terms and privacy - only show for signup */}
          {mode === "signup" && (
            <div className="mt-4 text-center text-xs text-gray-500">
              By continuing, you agree to the{" "}
              <a href="/terms" className="underline hover:text-gray-400">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="underline hover:text-gray-400">
                Privacy Policy
              </a>
              .
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
