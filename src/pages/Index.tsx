import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";
import { GradientBackground } from "@/components/GradientBackground";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useSubscriptionContext } from "@/context/SubscriptionContext";
import { syncSubscription } from "@/lib/stripe";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const { refetchSubscription, refetchCredits } = useSubscriptionContext();
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // Handle checkout success redirect
  useEffect(() => {
    if (searchParams.get('checkout') !== 'success' || !isAuthenticated) return;

    // Remove query param immediately
    searchParams.delete('checkout');
    setSearchParams(searchParams, { replace: true });

    // Sync subscription from Stripe
    const doSync = async () => {
      setIsSyncing(true);
      try {
        const result = await syncSubscription();
        if (result.synced) {
          toast({
            title: "Subscription activated!",
            description: `Your ${result.planName} plan is active with ${result.monthlyCredits} credits. Start building!`,
          });
        } else {
          toast({
            title: "Subscription processing",
            description: "Your payment is being processed. It may take a moment to activate.",
          });
        }
        // Refetch subscription and credits to update the UI
        await Promise.all([refetchSubscription(), refetchCredits()]);
      } catch (error) {
        console.error('Sync error:', error);
        toast({
          title: "Payment received",
          description: "Your subscription is being set up. Please refresh if it doesn't appear shortly.",
        });
      } finally {
        setIsSyncing(false);
      }
    };

    doSync();
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-[#050609] relative">
      <GradientBackground />
      <div className="relative z-10">
        <Header />
        <main>
          <Hero />
        </main>
        <Footer />
      </div>

      {/* Syncing overlay */}
      {isSyncing && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="bg-[#232323] rounded-xl p-6 flex flex-col items-center gap-3 border border-[#3a3a3a]">
            <Loader2 className="w-8 h-8 animate-spin text-[#5A9665]" />
            <p className="text-white font-medium">Activating your subscription...</p>
            <p className="text-sm text-gray-400">This will only take a moment</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
