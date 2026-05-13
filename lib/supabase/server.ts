import { createClient } from '@supabase/supabase-js';
import { env, hasSupabaseServerEnv } from '@/lib/env';

export function getSupabaseAdminClient() {
  if (!hasSupabaseServerEnv()) return null;

  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
