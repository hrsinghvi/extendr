"use client";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { Briefcase, CheckCheck, Database, Server, Zap, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { redirectToCheckout, STRIPE_PRICES, type BillingInterval } from "@/lib/stripe";
import { AuthModal } from "@/components/AuthModal";

interface Plan {
  name: string;
  description: string;
  price: number | null;
  yearlyPrice: number | null;
  buttonText: string;
  buttonVariant: "outline" | "default";
  features: { text: string; icon: React.ReactNode }[];
  includes: string[];
  popular?: boolean;
  isCustom?: boolean;
  planId?: "pro" | "premium" | "ultra";
  monthlyCredits: number;
  yearlyCredits: number;
}

const plans: Plan[] = [
  {
    name: "Pro",
    planId: "pro",
    description:
      "Great for getting started with AI-powered extension building",
    price: 12,
    yearlyPrice: 120,
    buttonText: "Get Pro",
    buttonVariant: "outline" as const,
    monthlyCredits: 15,
    yearlyCredits: 180,
    features: [
      { text: "AI-powered generation", icon: <Briefcase size={20} /> },
      { text: "Live preview", icon: <Database size={20} /> },
      { text: "Email support", icon: <Server size={20} /> },
    ],
    includes: [
      "Pro includes:",
      "AI-powered generation",
      "Live preview",
      "Export as zip to Chrome",
      "Personal API key access",
      "Email Support",
    ],
  },
  {
    name: "Premium",
    planId: "premium",
    description:
      "For power users who need advanced tools and priority support",
    price: 24,
    yearlyPrice: 240,
    popular: true,
    buttonText: "Get Premium",
    buttonVariant: "default" as const,
    monthlyCredits: 30,
    yearlyCredits: 360,
    features: [
      { text: "Priority support", icon: <Briefcase size={20} /> },
      { text: "Access to Premium Models", icon: <Database size={20} /> },
      { text: "Advanced analytics", icon: <Server size={20} /> },
    ],
    includes: [
      "Everything in Pro, plus:",
      "Priority Support",
      "Access to Premium Models",
      "Advanced Analytics",
    ],
  },
  {
    name: "Ultra",
    planId: "ultra",
    description:
      "For professionals who need the full suite of tools and maximum power",
    price: 40,
    yearlyPrice: 400,
    buttonText: "Get Ultra",
    buttonVariant: "outline" as const,
    monthlyCredits: 55,
    yearlyCredits: 660,
    features: [
      { text: "Elite API access", icon: <Briefcase size={20} /> },
      { text: "Advanced customization", icon: <Database size={20} /> },
      { text: "Webhook / API access", icon: <Server size={20} /> },
    ],
    includes: [
      "Everything in Premium, plus:",
      "Elite API Access",
      "Advanced Customization",
      "Increased Storage",
      "Version history & rollback",
      "Webhook / API access",
    ],
  },
];

const PricingSwitch = ({
  onSwitch,
  className,
}: {
  onSwitch: (value: string) => void;
  className?: string;
}) => {
  const [selected, setSelected] = useState("1");

  const handleSwitch = (value: string) => {
    setSelected(value);
    onSwitch(value);
  };

  return (
    <div className={cn("flex justify-center", className)}>
      <div className="relative z-10 mx-auto flex w-full max-w-md rounded-full bg-muted border border-border p-1 overflow-hidden">
        <button
          onClick={() => handleSwitch("0")}
          className={cn(
            "relative z-10 flex-1 flex items-center justify-center sm:h-10 h-8 cursor-pointer rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors",
            selected === "0"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {selected === "0" && (
            <motion.span
              layoutId={"switch"}
              className="absolute inset-0 h-full w-full rounded-full border border-border/80 shadow-sm bg-background"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative">Monthly</span>
        </button>

        <button
          onClick={() => handleSwitch("1")}
          className={cn(
            "relative z-10 flex-1 flex items-center justify-center cursor-pointer sm:h-10 h-8 rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors",
            selected === "1"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {selected === "1" && (
            <motion.span
              layoutId={"switch"}
              className="absolute inset-0 h-full w-full rounded-full border border-border/80 shadow-sm bg-background"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative flex items-center gap-2">
            Yearly
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              Save 17%
            </span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default function PricingSection3() {
  const [isYearly, setIsYearly] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<{ plan: "pro" | "premium" | "ultra"; interval: BillingInterval } | null>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.4,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
  };

  const togglePricingPeriod = (value: string) =>
    setIsYearly(Number.parseInt(value) === 1);

  /**
   * Handle plan button click
   * - Free: Go to build page
   * - Pro/Premium: Redirect to Stripe Checkout (if authenticated)
   * - Custom: Contact sales (placeholder)
   */
  const handlePlanClick = async (plan: Plan) => {
    const interval: BillingInterval = isYearly ? "yearly" : "monthly";

    // Custom enterprise - contact sales
    if (plan.isCustom) {
      window.location.href = "mailto:sales@extendr.dev?subject=Enterprise%20Inquiry";
      return;
    }

    // Paid plans - check auth first
    if (!isAuthenticated) {
      setPendingPlan({ plan: plan.planId as "pro" | "premium" | "ultra", interval });
      setShowAuthModal(true);
      return;
    }

    // Proceed with checkout
    await handleCheckout(plan.planId as "pro" | "premium" | "ultra", interval);
  };

  /**
   * Handle Stripe Checkout redirect
   */
  const handleCheckout = async (planId: "pro" | "premium" | "ultra", interval: BillingInterval) => {
    setLoadingPlan(planId);
    
    try {
      await redirectToCheckout(planId, interval);
    } catch (error) {
      console.error("Checkout error:", error);
      // If checkout fails, show error (toast would be better)
      alert("Failed to start checkout. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  };

  /**
   * Handle auth modal close - if user just signed in and had pending plan, proceed with checkout
   */
  const handleAuthModalClose = () => {
    setShowAuthModal(false);
    
    // If user signed in and had a pending plan, proceed with checkout
    if (isAuthenticated && pendingPlan) {
      handleCheckout(pendingPlan.plan, pendingPlan.interval);
      setPendingPlan(null);
    }
  };

  return (
    <div
      className="px-4 pt-24 sm:pt-32 lg:pt-44 pb-16 max-w-7xl mx-auto relative"
      ref={pricingRef}
    >
      <article className="flex sm:flex-row flex-col sm:pb-0 pb-4 sm:items-center items-start justify-between">
        <div className="text-left mb-6">
          <h2 className="text-4xl font-bold leading-[130%] text-foreground mb-4 pt-8">
            <VerticalCutReveal
              splitBy="words"
              staggerDuration={0.15}
              staggerFrom="first"
              reverse={true}
              containerClassName="justify-start"
              transition={{
                type: "spring",
                stiffness: 250,
                damping: 40,
                delay: 0,
              }}
            >
              Plans & Pricing
            </VerticalCutReveal>
          </h2>

          <TimelineContent
            as="p"
            animationNum={0}
            timelineRef={pricingRef}
            customVariants={revealVariants}
            className="text-muted-foreground w-[80%]"
          >
            Trusted by millions, We help teams all around the world, Explore
            which option is right for you.
          </TimelineContent>
        </div>

        <TimelineContent
          as="div"
          animationNum={1}
          timelineRef={pricingRef}
          customVariants={revealVariants}
        >
          <PricingSwitch onSwitch={togglePricingPeriod} className="shrink-0" />
        </TimelineContent>
      </article>

      <TimelineContent
        as="div"
        animationNum={2}
        timelineRef={pricingRef}
        customVariants={revealVariants}
        className="grid md:grid-cols-3 gap-4 mx-auto bg-muted/30 sm:p-2 rounded-lg"
      >
        {plans.map((plan, index) => (
          <TimelineContent
            as="div"
            key={plan.name}
            animationNum={index + 3}
            timelineRef={pricingRef}
            customVariants={revealVariants}
          >
            <Card
              className={`relative flex flex-col h-full ${
                plan.popular
                  ? "scale-105 ring-2 ring-primary bg-gradient-to-t from-primary to-primary/90 text-primary-foreground"
                  : "border bg-card text-card-foreground pt-4"
              }`}
            >
              <CardContent className="pt-0">
                <div className="space-y-2 pb-3">
                  {plan.popular && (
                    <div className="pt-4">
                      <span className="bg-primary-foreground/20 text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                        Popular
                      </span>
                    </div>
                  )}

                  <div>
                    {plan.isCustom ? (
                      <span className="text-3xl font-semibold">Custom Enterprise</span>
                    ) : (
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-semibold">
                          $
                          <NumberFlow
                            format={{
                              currency: "USD",
                            }}
                            value={isYearly ? Math.round(plan.yearlyPrice! / 12) : plan.price!}
                            className="text-4xl font-semibold"
                          />
                        </span>
                        <span
                          className={cn(
                            "text-sm",
                            plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"
                          )}
                        >
                          {isYearly ? "per month, billed yearly" : "per month"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <h3 className="text-3xl font-semibold mb-2">{plan.name}</h3>
                </div>
                <p
                  className={
                    plan.popular
                      ? "text-sm text-primary-foreground/70 mb-4"
                      : "text-sm text-muted-foreground mb-4"
                  }
                >
                  {plan.description}
                </p>

                {/* Credits highlight */}
                {!plan.isCustom && (
                  <div className={cn(
                    "flex items-center gap-2 mb-4 p-2 rounded-lg",
                    plan.popular
                      ? "bg-primary-foreground/10"
                      : "bg-muted"
                  )}>
                    <Zap className={cn(
                      "h-4 w-4",
                      plan.popular ? "text-primary-foreground" : "text-primary"
                    )} />
                    <span className={cn(
                      "text-sm font-medium",
                      plan.popular ? "text-primary-foreground" : "text-foreground"
                    )}>
                      {isYearly ? plan.yearlyCredits : plan.monthlyCredits} credits / {isYearly ? "year" : "month"}
                    </span>
                  </div>
                )}

                <div className="space-y-3 pt-4 border-t border-border">
                  <h4 className="font-medium text-base  mb-3">
                    {plan.includes[0]}
                  </h4>
                  <ul className="space-y-2 font-semibold">
                    {plan.includes.slice(1).map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <span
                          className={
                            plan.popular
                              ? "text-primary-foreground h-6 w-6 bg-primary-foreground/20 border border-primary-foreground/30 rounded-full grid place-content-center mt-0.5 mr-3"
                              : "text-foreground h-6 w-6 bg-muted border border-border rounded-full grid place-content-center mt-0.5 mr-3"
                          }
                        >
                          <CheckCheck className="h-4 w-4  " />
                        </span>
                        <span
                          className={
                            plan.popular
                              ? "text-sm text-primary-foreground/80"
                              : "text-sm text-muted-foreground"
                          }
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="mt-auto pt-4">
                <button
                  onClick={() => handlePlanClick(plan)}
                  disabled={loadingPlan === plan.planId}
                  className={cn(
                    "w-full p-4 text-xl rounded-xl transition-colors flex items-center justify-center gap-2",
                    "disabled:opacity-70 disabled:cursor-not-allowed",
                    plan.popular
                      ? "bg-primary-foreground text-primary font-semibold shadow-lg border border-primary-foreground/20 hover:bg-primary-foreground/90"
                      : plan.buttonVariant === "outline"
                        ? "bg-primary text-primary-foreground shadow-lg border border-primary/20 hover:bg-primary/90"
                        : ""
                  )}
                >
                  {loadingPlan === plan.planId ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    plan.buttonText
                  )}
                </button>
              </CardFooter>
            </Card>
          </TimelineContent>
        ))}
      </TimelineContent>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={handleAuthModalClose}
        mode="signup"
      />
    </div>
  );
}
