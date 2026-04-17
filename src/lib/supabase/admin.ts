import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Admin Supabase client — uses the service_role key so it can call
 * privileged APIs like auth.admin.generateLink().
 *
 * ⚠️  NEVER import this in Client Components or expose it to the browser.
 *     Only use in Route Handlers (app/api/**) or Server Actions.
 */
export function createAdminClient() {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key  = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables.',
    );
  }

  return createSupabaseClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
