declare module '@/types/database' {
  export type Project = any;
  export type Database = any;
}

declare module '@/context/AuthContext' {
  export const useAuth: any;
  export type User = any;
  export type Session = any;
}

declare module '@/core/errorBus' {
  export function notifyError(payload: any): void;
  export const errorBus: any;
}

