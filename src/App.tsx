import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import { GlobalErrorListener } from "./components/ui/GlobalErrorListener";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import Build from "./pages/Build";
import Settings from "./pages/Settings";
import Resources from "./pages/Resources";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Swipe gesture handler component
const SwipeHandler = ({ children }: { children: React.ReactNode }) => {
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const isDragging = useRef(false);
  const minSwipeDistance = 50;

  const handleStart = (clientX: number) => {
    touchEndX.current = null;
    touchStartX.current = clientX;
    isDragging.current = true;
  };

  const handleMove = (clientX: number) => {
    if (!isDragging.current) return;
    touchEndX.current = clientX;
  };

  const handleEnd = () => {
    if (!touchStartX.current || !touchEndX.current || !isDragging.current) {
      isDragging.current = false;
      return;
    }

    const distance = touchStartX.current - touchEndX.current;
    const absDistance = Math.abs(distance);

    // Only trigger if it's a significant horizontal swipe
    if (absDistance < minSwipeDistance) {
      isDragging.current = false;
      touchStartX.current = null;
      touchEndX.current = null;
      return;
    }

    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    // Disable automatic history navigation to prevent unintended route changes

    isDragging.current = false;
    touchStartX.current = null;
    touchEndX.current = null;
  };

  useEffect(() => {
    const element = document.body;

    // Touch events for mobile/tablet
    const onTouchStart = (e: TouchEvent) => {
      handleStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: TouchEvent) => {
      handleMove(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
      handleEnd();
    };

    // Mouse drag for desktop (only when dragging horizontally)
    let mouseStartX: number | null = null;
    let mouseStartY: number | null = null;
    let isMouseDragging = false;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        mouseStartX = e.clientX;
        mouseStartY = e.clientY;
        isMouseDragging = false;
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (mouseStartX !== null && mouseStartY !== null && e.buttons === 1) {
        const deltaX = Math.abs(e.clientX - mouseStartX);
        const deltaY = Math.abs(e.clientY - mouseStartY);

        // Only trigger if horizontal movement is significant and greater than vertical
        if (deltaX > 20 && deltaX > deltaY * 1.5) {
          if (!isMouseDragging) {
            isMouseDragging = true;
            handleStart(mouseStartX);
          }
          handleMove(e.clientX);
        }
      }
    };

    const onMouseUp = () => {
      if (isMouseDragging && isDragging.current) {
        handleEnd();
      }
      mouseStartX = null;
      mouseStartY = null;
      isMouseDragging = false;
    };

    element.addEventListener("touchstart", onTouchStart, { passive: true });
    element.addEventListener("touchmove", onTouchMove, { passive: true });
    element.addEventListener("touchend", onTouchEnd, { passive: true });
    element.addEventListener("mousedown", onMouseDown);
    element.addEventListener("mousemove", onMouseMove);
    element.addEventListener("mouseup", onMouseUp);

    return () => {
      element.removeEventListener("touchstart", onTouchStart);
      element.removeEventListener("touchmove", onTouchMove);
      element.removeEventListener("touchend", onTouchEnd);
      element.removeEventListener("mousedown", onMouseDown);
      element.removeEventListener("mousemove", onMouseMove);
      element.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  return <>{children}</>;
};

/**
 * ScrollToTop - Resets scroll position on route changes.
 * Delays scroll until exit animation is mostly complete (~200ms)
 * to avoid visible jump on the outgoing page.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Disable browser's default scroll restoration to ensure we always start at top
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    
    // Immediate scroll on mount (refresh/initial load)
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    // For navigation changes, delay slightly to allow exit animation
    // But ensure we do scroll
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
};

/**
 * PageTransition - fade+slide entrance animation per route.
 * No exit animation or AnimatePresence to avoid stuck/overlapping pages.
 */
const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <>
      <ScrollToTop />
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/features" element={<PageTransition><Features /></PageTransition>} />
        <Route path="/pricing" element={<PageTransition><Pricing /></PageTransition>} />
        <Route path="/resources" element={<PageTransition><Resources /></PageTransition>} />
        <Route path="/build" element={<PageTransition><Build /></PageTransition>} />
        <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
    <SubscriptionProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <GlobalErrorListener />
      <BrowserRouter>
        <SwipeHandler>
          <AnimatedRoutes />
        </SwipeHandler>
      </BrowserRouter>
    </TooltipProvider>
    </SubscriptionProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
