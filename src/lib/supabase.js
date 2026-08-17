import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Whether the build carries usable Supabase credentials.
 *
 * This module used to throw at import time when the variables were absent.
 * Because it sits at the root of the import graph, that took the whole
 * application down with an unexplained blank screen - the same failure mode as
 * a deploy built without its environment variables, which is exactly when you
 * most need the app to say what is wrong. It now degrades instead, and the UI
 * renders an explanation.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

/** Details for the configuration screen; never includes the key itself. */
export const supabaseConfigStatus = {
  hasUrl: Boolean(supabaseUrl),
  hasAnonKey: Boolean(supabaseAnonKey),
  missing: [
    !supabaseUrl && 'VITE_SUPABASE_URL',
    !supabaseAnonKey && 'VITE_SUPABASE_ANON_KEY',
  ].filter(Boolean),
}

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.warn(
    `[SUMRY] Supabase is not configured. Missing: ${supabaseConfigStatus.missing.join(', ')}. ` +
    'Add them to .env (local) or the project environment variables (deployed). ' +
    'The VITE_ prefix is required - Vite only exposes variables carrying it.'
  )
}

/**
 * Null when unconfigured. Callers reach this only behind `isSupabaseConfigured`,
 * because App renders the configuration screen before mounting anything that
 * touches data.
 */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null
