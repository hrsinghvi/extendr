import { MorphingText } from "./ui/morphing-text";
import { motion } from "framer-motion";
import { PromptInputBox } from "./ui/prompt-input-box";
import { useState, useEffect } from "react";
import { AuthModal } from "./AuthModal";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { RecentProjects } from "./RecentProjects";

export function Hero() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      // Don't redirect on initial check - only redirect when user actually signs in
    });

    // Listen for auth changes (only redirect on actual sign-in events)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      // No automatic navigation; user stays on current page unless they explicitly navigate.
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSend = (message: string, files?: File[]) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Show sign up modal
      setShowAuthModal(true);
    } else {
      // User is authenticated, redirect to build screen with prompt
      navigate("/build", { state: { prompt: message, files } });
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col overflow-x-hidden bg-[#050609]">
      {/* Radial gradient background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050609]" />
        <motion.div
          className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[150vw] h-[130vh]"
          style={{
            background:
              "radial-gradient(ellipse at center bottom, rgba(28,100,242,0.9) 0%, rgba(131,171,199,1.0) 30%, rgba(110,170,121,0.9) 60%, rgba(12,17,17,0) 80%)",
            filter: "blur(45px)",
            opacity: 0.95,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
        />
        <motion.div
          className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[100vw] h-[90vh]"
          style={{
            background:
              "radial-gradient(ellipse at center bottom, rgba(56,189,248,0.9) 0%, rgba(131,171,199,0.7) 35%, rgba(110,170,121,0.25) 55%, rgba(90,150,101,0) 70%)",
            filter: "blur(30px)",
            opacity: 0.9,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
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

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 pt-56 pb-32">
        {/* Main headline */}
        <div className="text-center max-w-5xl mx-auto space-y-6 mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground"
          >
            What will you{" "}
            <MorphingText
              words={["build", "create", "design", "develop", "launch"]}
              className="text-5xl sm:text-6xl lg:text-7xl"
            />
            ?
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-xl sm:text-2xl text-white max-w-3xl mx-auto"
          >
            Create custom Chrome extensions in minutes with AI.
          </motion.p>
        </div>

        {/* AI Prompt Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="max-w-3xl mx-auto mb-40"
        >
          <PromptInputBox
            onSend={handleSend}
            placeholder="Describe your app idea..."
            textareaClassName="min-h-[110px]"
          />
        </motion.div>

        {/* Recent Projects Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="w-full"
        >
          <RecentProjects />
        </motion.div>

      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode="signup"
      />
    </section>
  );
}
