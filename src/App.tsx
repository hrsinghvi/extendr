import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import Build from "./pages/Build";
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

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Index />
            </motion.div>
          }
        />
        <Route
          path="/auth"
          element={
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Auth />
            </motion.div>
          }
        />
        <Route
          path="/features"
          element={
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Features />
            </motion.div>
          }
        />
        <Route
          path="/pricing"
          element={
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Pricing />
            </motion.div>
          }
        />
        <Route
          path="/build"
          element={
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Build />
            </motion.div>
          }
        />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route
          path="*"
          element={
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <NotFound />
            </motion.div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SwipeHandler>
            <AnimatedRoutes />
          </SwipeHandler>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
