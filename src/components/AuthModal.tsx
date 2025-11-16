import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "signup" | "login";
}

export function AuthModal({ isOpen, onClose, mode }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/build`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error with Google auth:", error);
      setIsLoading(false);
    }
  };

  const handleGitHubAuth = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/build`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error with GitHub auth:", error);
      setIsLoading(false);
    }
  };

  const handleEmailAuth = () => {
    onClose();
    navigate("/auth");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[350px] bg-[#0C1111] border-[#2a2a2a] text-white p-0 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        >
          <X className="h-4 w-4 text-white" />
          <span className="sr-only">Close</span>
        </button>
        <div className="relative p-4">
          {/* Title and subtitle */}
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-1">Start building.</h2>
            <p className="text-sm text-gray-500">
              {mode === "signup" ? "Create your free account and start building!" : "Log in to your account!"}
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
              <span className="text-xs font-medium">Continue with Google</span>
            </button>

            {/* GitHub button */}
            <button
              onClick={handleGitHubAuth}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-[#2a2a2a] hover:bg-[#333333] border border-[#3a3a3a] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              <span className="text-xs font-medium">Continue with GitHub</span>
            </button>

            {/* Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#3a3a3a]"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-[#0C1111] text-gray-500 font-medium">OR</span>
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

