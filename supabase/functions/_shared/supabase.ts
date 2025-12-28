/**
 * Supabase client for Edge Functions
 * Uses service role key for admin operations
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

/**
 * Admin client with service role - bypasses RLS
 * Use for webhook handlers and admin operations
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Create a client scoped to a specific user's JWT
 * Use for user-facing operations that should respect RLS
 */
export function createUserClient(authHeader: string) {
  return createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Extract user from JWT token
 */
export async function getUserFromToken(authHeader: string) {
  const token = authHeader.replace('Bearer ', '');
  const supabase = createUserClient(authHeader);
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    throw new Error('Invalid or expired token');
  }
  
  return user;
}

