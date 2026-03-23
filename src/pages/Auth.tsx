/**
 * Auth page - Email+password sign-in/sign-up and Google OAuth
 *
 * Supports:
 * - Email + password (sign up with confirmation email, sign in)
 * - Google OAuth
 * - Forgot password flow
 *
 * Detects duplicate accounts (e.g., email already used with Google)
 */
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { notifyError } from "@/core/errorBus";
import { PromptInputBox } from "@/components/ui/prompt-input-box";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

type AuthMode = "login" | "signup" | "forgot";

export default function Auth() {
  const location = useLocation();
  const [mode, setMode] = useState<AuthMode>(location.state?.isSignUp ? "signup" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  /**
   * Handle email+password sign up
   */
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      notifyError({ title: "Password too short", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      notifyError({ title: "Passwords don't match", description: "Please make sure your passwords match.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        // Detect if email is already registered
        if (error.message?.toLowerCase().includes("already registered") || error.message?.toLowerCase().includes("already been registered")) {
          notifyError({
            title: "Account already exists",
            description: "This email is already registered. Try logging in instead, or use Google if you signed up with Google.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      // Supabase returns a user with identities=[] if the email is taken by another provider
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        notifyError({
          title: "Account already exists",
          description: "This email is already associated with a Google account. Please sign in with Google instead.",
          variant: "destructive",
        });
        return;
      }

      setEmailSent(true);
      toast({
        title: "Check your email!",
        description: "We sent you a confirmation link. Please verify your email to complete sign up.",
      });
    } catch (error: any) {
      notifyError({
        title: "Sign up failed",
        description: error?.message ?? "Unable to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle email+password sign in
   */
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message?.toLowerCase().includes("invalid login credentials")) {
          notifyError({
            title: "Invalid credentials",
            description: "Incorrect email or password. If you signed up with Google, use the Google button instead.",
            variant: "destructive",
          });
          return;
        }
        if (error.message?.toLowerCase().includes("email not confirmed")) {
          notifyError({
            title: "Email not confirmed",
            description: "Please check your email and click the confirmation link before logging in.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      navigate("/");
    } catch (error: any) {
      notifyError({
        title: "Login failed",
        description: error?.message ?? "Unable to sign in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle forgot password
   */
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      notifyError({ title: "Email required", description: "Please enter your email address.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      });

      if (error) throw error;

      setEmailSent(true);
      toast({
        title: "Reset link sent!",
        description: "Check your email for a password reset link.",
      });
    } catch (error: any) {
      notifyError({
        title: "Reset failed",
        description: error?.message ?? "Unable to send reset link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Google OAuth sign-in
   */
  const handleGoogleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      notifyError({
        title: "Google sign-in failed",
        description: error?.message ?? "Unable to sign in with Google. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSend = (message: string, files?: File[]) => {
    console.log("Auth page prompt (placeholder):", message, files);
  };

  const getTitle = () => {
    if (mode === "forgot") return "Reset password";
    return mode === "signup" ? "Sign up" : "Log in";
  };

  const getSubmitText = () => {
    if (loading) {
      if (mode === "forgot") return "Sending...";
      return mode === "signup" ? "Creating account..." : "Logging in...";
    }
    if (mode === "forgot") return "Send reset link";
    return mode === "signup" ? "Create account" : "Log in";
  };

  // Show confirmation message after signup or forgot password
  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-elevated p-8">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <span className="text-3xl">&#9993;</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Check your email</h1>
          <p className="text-muted-foreground">
            {mode === "forgot"
              ? `We sent a password reset link to ${email}. Click the link in the email to reset your password.`
              : `We sent a confirmation link to ${email}. Click the link in the email to verify your account.`}
          </p>
          <div className="space-y-3 pt-4">
            <Button
              variant="outline"
              className="w-full h-12 bg-surface border-border hover:bg-surface-overlay text-white"
              onClick={() => { setEmailSent(false); setMode("login"); }}
            >
              Back to login
            </Button>
            <p className="text-xs text-muted-foreground">
              Didn't receive an email? Check your spam folder or{" "}
              <button
                onClick={() => setEmailSent(false)}
                className="text-white underline hover:text-primary transition-colors"
              >
                try again
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

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
              key={mode}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="text-4xl font-bold text-white"
            >
              {getTitle()}
            </motion.h1>
          </AnimatePresence>

          {/* Google OAuth - not shown on forgot password */}
          {mode !== "forgot" && (
            <>
              <div className="space-y-3">
                <Button
                  onClick={handleGoogleAuth}
                  variant="outline"
                  className="w-full h-12 bg-surface border-border hover:bg-surface-overlay text-white"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="white">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
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
            </>
          )}

          {/* Email+Password Form */}
          <form
            onSubmit={mode === "signup" ? handleSignUp : mode === "login" ? handleSignIn : handleForgotPassword}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="email" className="text-white mb-2 block">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="bg-surface border-border text-white placeholder:text-muted-foreground h-12"
              />
            </div>

            {mode !== "forgot" && (
              <div>
                <Label htmlFor="password" className="text-white mb-2 block">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                    className="bg-surface border-border text-white placeholder:text-muted-foreground h-12 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {mode === "signup" && (
              <div>
                <Label htmlFor="confirmPassword" className="text-white mb-2 block">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  minLength={6}
                  className="bg-surface border-border text-white placeholder:text-muted-foreground h-12"
                />
              </div>
            )}

            {/* Forgot password link - only on login */}
            {mode === "login" && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-white text-black hover:bg-white/90 font-medium"
              disabled={loading}
            >
              {getSubmitText()}
            </Button>
          </form>

          {/* Toggle between modes */}
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="text-center text-sm text-muted-foreground"
            >
              {mode === "signup" ? (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => setMode("login")}
                    className="text-white underline hover:text-primary transition-colors"
                  >
                    Log in
                  </button>
                </>
              ) : mode === "login" ? (
                <>
                  Don't have an account?{" "}
                  <button
                    onClick={() => setMode("signup")}
                    className="text-white underline hover:text-primary transition-colors"
                  >
                    Create your account
                  </button>
                </>
              ) : (
                <>
                  Remember your password?{" "}
                  <button
                    onClick={() => setMode("login")}
                    className="text-white underline hover:text-primary transition-colors"
                  >
                    Back to login
                  </button>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Right Panel - Decorative gradient with prompt box */}
      <div className="hidden lg:flex lg:w-1/2 relative min-h-screen items-center justify-center overflow-hidden bg-[#050609]">
        <div className="absolute inset-4 z-0 rounded-3xl border border-border/30 pointer-events-none" />
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
          <div
            className="absolute inset-0 opacity-35 mix-blend-soft-light pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 250 250'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.75'/%3E%3C/svg%3E")`,
              backgroundRepeat: "repeat",
              backgroundSize: "260px 260px",
            }}
          />
        </div>
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
