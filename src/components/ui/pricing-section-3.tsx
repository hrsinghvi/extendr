"use client";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { Briefcase, CheckCheck, Database, Server } from "lucide-react";
import { motion } from "framer-motion";
import { useRef, useState } from "react";

const plans = [
  {
    name: "Free",
    description:
      "Perfect for trying out Extendr and building your first extension",
    price: 0,
    yearlyPrice: 0,
    buttonText: "Get started",
    buttonVariant: "outline" as const,
    features: [
      { text: "Up to 3 extensions", icon: <Briefcase size={20} /> },
      { text: "Basic templates", icon: <Database size={20} /> },
      { text: "Community support", icon: <Server size={20} /> },
    ],
    includes: [
      "Free includes:",
      "AI-powered generation",
      "Live preview",
      "Export to ZIP",
    ],
  },
  {
    name: "Pro",
    description:
      "Best for indie developers building multiple extensions",
    price: 20,
    yearlyPrice: 190,
    buttonText: "Get started",
    buttonVariant: "outline" as const,
    features: [
      { text: "Unlimited extensions", icon: <Briefcase size={20} /> },
      { text: "All templates", icon: <Database size={20} /> },
      { text: "Priority AI generation", icon: <Server size={20} /> },
    ],
    includes: [
      "Everything in Free, plus:",
      "Advanced customization",
      "Version history",
      "Email support",
    ],
  },
  {
    name: "Premium",
    description:
      "For power users who need advanced features and faster generation",
    price: 40,
    yearlyPrice: 380,
    popular: true,
    buttonText: "Get started",
    buttonVariant: "default" as const,
    features: [
      { text: "Unlimited everything", icon: <Briefcase size={20} /> },
      { text: "Custom branding", icon: <Database size={20} /> },
      { text: "Fastest AI generation", icon: <Server size={20} /> },
    ],
    includes: [
      "Everything in Pro, plus:",
      "Priority support",
      "Advanced analytics",
      "API access",
    ],
  },
  {
    name: "Enterprise",
    description:
      "Custom solutions for teams with dedicated support and SLAs",
    price: null,
    yearlyPrice: null,
    isCustom: true,
    buttonText: "Contact sales",
    buttonVariant: "outline" as const,
    features: [
      { text: "Custom integrations", icon: <Briefcase size={20} /> },
      { text: "Dedicated support", icon: <Database size={20} /> },
      { text: "SLA guarantees", icon: <Server size={20} /> },
    ],
    includes: [
      "Everything in Premium, plus:",
      "SSO & SAML",
      "Custom contracts",
      "Dedicated account manager",
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
  const [selected, setSelected] = useState("0");

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
              Save 20%
            </span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default function PricingSection3() {
  const [isYearly, setIsYearly] = useState(false);
  const pricingRef = useRef<HTMLDivElement>(null);

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

  return (
    <div
      className="px-4 pt-20 min-h-screen max-w-7xl mx-auto relative"
      ref={pricingRef}
    >
      <article className="flex sm:flex-row flex-col sm:pb-0 pb-4 sm:items-center items-start justify-between">
        <div className="text-left mb-6">
          <h2 className="text-4xl font-medium leading-[130%] text-foreground mb-4 pt-8">
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
        className="grid md:grid-cols-4 gap-4 mx-auto bg-muted/30 sm:p-2 rounded-lg"
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

                  <div className="flex items-baseline">
                    {plan.isCustom ? (
                      <span className="text-3xl font-semibold">Custom</span>
                    ) : (
                      <>
                        <span className="text-4xl font-semibold ">
                          $
                          <NumberFlow
                            format={{
                              currency: "USD",
                            }}
                            value={isYearly ? plan.yearlyPrice! : plan.price!}
                            className="text-4xl font-semibold"
                          />
                        </span>
                        <span
                          className={
                            plan.popular
                              ? "text-primary-foreground/70 ml-1"
                              : "text-muted-foreground ml-1"
                          }
                        >
                          /{isYearly ? "year" : "month"}
                        </span>
                      </>
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
                  className={`w-full p-4 text-xl rounded-xl transition-colors ${
                    plan.popular
                      ? "bg-primary-foreground text-primary font-semibold shadow-lg border border-primary-foreground/20 hover:bg-primary-foreground/90"
                      : plan.buttonVariant === "outline"
                        ? "bg-primary text-primary-foreground shadow-lg border border-primary/20 hover:bg-primary/90"
                        : ""
                  }`}
                >
                  {plan.buttonText}
                </button>
              </CardFooter>
            </Card>
          </TimelineContent>
        ))}
      </TimelineContent>
    </div>
  );
}
