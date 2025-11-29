import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { errorBus, type ErrorPayload } from "@/core/errorBus";

// Global listener that forwards error events to the existing toast UI
export const GlobalErrorListener = () => {
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = errorBus.subscribe((payload: ErrorPayload) => {
      toast({
        title: payload.title ?? "Error",
        description: payload.description,
        variant: payload.variant ?? "destructive",
      });
    });

    return () => unsubscribe();
  }, [toast]);

  return null;
};


