import { MorphingText } from "./ui/morphing-text";
import { motion } from "framer-motion";
import { PromptInputBox } from "./ui/prompt-input-box";
import { useState } from "react";
import { AuthModal } from "./AuthModal";
import { useNavigate } from "react-router-dom";
import { RecentProjects } from "./RecentProjects";
import { useAuth } from "@/context/AuthContext";

export function Hero() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  /**
   * Handle prompt submission
   * Shows auth modal if not authenticated, otherwise navigates to build page
   */
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
    <section className="relative min-h-screen flex flex-col overflow-x-hidden">

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
            Create custom Chrome extensions in seconds.
          </motion.p>
        </div>

        {/* Authenticated user badge removed for restart; header handles login state */}

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

        {/* Recent Projects Section remains below the hero as part of the landing page */}
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
