import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PromptInputBox } from "@/components/ui/prompt-input-box";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function Auth() {
  const location = useLocation();
  const [isSignUp, setIsSignUp] = useState(location.state?.isSignUp ?? false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
      toast({
        title: "Check your email!",
        description: "We sent you a magic link to sign in.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/build`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };


  const handleSend = (message: string, files?: File[]) => {
    console.log("Message:", message);
    console.log("Files:", files);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Auth Form */}
      <div className="w-full lg:w-1/2 bg-surface-elevated flex items-center justify-center p-8 lg:p-12 relative">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="absolute top-6 left-6 gap-2 text-white hover:bg-primary hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="w-full max-w-md space-y-8">
          {/* Title */}
          <AnimatePresence mode="wait">
            <motion.h1
              key={isSignUp ? "signup" : "signin"}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="text-4xl font-bold text-white"
            >
              {isSignUp ? "Sign up" : "Log in"}
            </motion.h1>
          </AnimatePresence>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleGoogleAuth}
              variant="outline"
              className="w-full h-12 bg-surface border-border hover:bg-surface-overlay text-white"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="white">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
          </div>

          {/* OR Separator */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-surface-elevated text-muted-foreground">OR</span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-white mb-2 block">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="bg-surface border-border text-white placeholder:text-muted-foreground h-12"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-white text-black hover:bg-white/90 font-medium"
              disabled={loading}
            >
              {loading ? "Loading..." : "Continue"}
            </Button>
          </form>

          {/* Account Link */}
          <AnimatePresence mode="wait">
            <motion.div
              key={isSignUp ? "signup-link" : "signin-link"}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="text-center text-sm text-muted-foreground"
            >
              {isSignUp ? (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => setIsSignUp(false)}
                    className="text-white underline hover:text-primary transition-colors"
                  >
                    Log in
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{" "}
                  <button
                    onClick={() => setIsSignUp(true)}
                    className="text-white underline hover:text-primary transition-colors"
                  >
                    Create your account
                  </button>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Right Panel - Hero with Gradient */}
      <div className="hidden lg:flex lg:w-1/2 relative min-h-screen items-center justify-center overflow-hidden bg-[#050609]">
        {/* Rounded rectangle border around gradient */}
        <div className="absolute inset-4 z-0 rounded-3xl border border-border/30 pointer-events-none" />
        
        {/* Radial gradient background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050609]" />
          <div
            className="absolute bottom-[-300px] left-1/2 -translate-x-1/2 w-[1900px] h-[900px]"
            style={{
              background:
                "radial-gradient(ellipse at center bottom, rgba(111,151,179,0.95) 0%, rgba(125,167,194,0.92) 25%, rgba(90,150,101,0.9) 55%, rgba(12,17,17,0) 75%)",
              filter: "blur(45px)",
              opacity: 0.95,
            }}
          />
          <div
            className="absolute bottom-[-240px] left-1/2 -translate-x-1/2 w-[1200px] h-[620px]"
            style={{
              background:
                "radial-gradient(ellipse at center bottom, rgba(152,193,218,0.7) 0%, rgba(111,151,179,0.5) 35%, rgba(90,150,101,0.25) 55%, rgba(90,150,101,0) 70%)",
              filter: "blur(30px)",
              opacity: 0.9,
            }}
          />
          {/* Noise texture overlay */}
          <div
            className="absolute inset-0 opacity-35 mix-blend-soft-light pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 250 250'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.75'/%3E%3C/svg%3E")`,
              backgroundRepeat: "repeat",
              backgroundSize: "260px 260px",
            }}
          />
        </div>

        {/* Chat Input Box */}
        <div className="relative z-10 w-full max-w-2xl px-8">
          <PromptInputBox
            onSend={handleSend}
            placeholder="Ask extendr to build your landing page."
          />
        </div>
      </div>
    </div>
  );
}
