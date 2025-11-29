// Lightweight global error bus to surface errors via the existing toast system
export type ErrorPayload = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | "warning";
};

type Listener = (payload: ErrorPayload) => void;

const listeners: Listener[] = [];

export const errorBus = {
  subscribe: (cb: Listener) => {
    listeners.push(cb);
    return () => {
      const idx = listeners.indexOf(cb);
      if (idx >= 0) listeners.splice(idx, 1);
    };
  },
  emit: (payload: ErrorPayload) => {
    for (const listener of listeners) listener(payload);
  }
};

// Convenience helper for emitting errors from anywhere
export const notifyError = (payload: ErrorPayload) => {
  errorBus.emit(payload);
};


