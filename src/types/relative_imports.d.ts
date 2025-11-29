declare module "../context/AuthContext" {
  export const useAuth: any;
  export type User = any;
  export type Session = any;
}

declare module "../core/errorBus" {
  export const errorBus: any;
  export function notifyError(payload: any): void;
}

