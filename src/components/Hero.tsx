import { MorphingText } from "./ui/morphing-text";
import { motion } from "framer-motion";
import { PromptInputBox } from "./ui/prompt-input-box";
import { useState } from "react";
import { AuthModal } from "./AuthModal";
import { useNavigate } from "react-router-dom";
import { RecentProjects } from "./RecentProjects";
import { useAuth } from "@/context/AuthContext";
import { useSubscriptionContext } from "@/context/SubscriptionContext";
import { ModelSelector } from "./ModelSelector";
import { useModelConfig } from "@/hooks/useModelConfig";
import { SubscriptionRequiredModal } from "./SubscriptionRequiredModal";

export function Hero() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSubRequiredModal, setShowSubRequiredModal] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState<{ message: string; files?: File[] } | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isActive } = useSubscriptionContext();
  const { config: modelConfig, setPrimary, getApiKeyForProvider } = useModelConfig();

  /**
   * Handle prompt submission
   * 1. Not authenticated → auth modal
   * 2. No active subscription → subscription required modal
   * 3. Otherwise → navigate to build
   */
  const handleSend = (message: string, files?: File[]) => {
    if (!isAuthenticated) {
      setPendingPrompt({ message, files });
      setShowAuthModal(true);
      return;
    }

    if (!isActive) {
      setShowSubRequiredModal(true);
      return;
    }

    navigate("/build", { state: { prompt: message, files } });
  };

  return (
    <section className="relative min-h-screen flex flex-col overflow-x-hidden">

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 pt-64 pb-32">
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
            leftSlot={
              <ModelSelector
                config={modelConfig}
                setPrimary={setPrimary}
                getApiKeyForProvider={getApiKeyForProvider}
              />
            }
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
        onClose={() => {
          setShowAuthModal(false);
          // If user just signed in and had a pending prompt, check subscription
          if (isAuthenticated && pendingPrompt) {
            if (isActive) {
              navigate("/build", { state: { prompt: pendingPrompt.message, files: pendingPrompt.files } });
            } else {
              setShowSubRequiredModal(true);
            }
            setPendingPrompt(null);
          }
        }}
        mode="signup"
      />

      {/* Subscription Required Modal */}
      <SubscriptionRequiredModal
        open={showSubRequiredModal}
        onOpenChange={setShowSubRequiredModal}
      />
    </section>
  );
}
