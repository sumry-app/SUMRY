import { useCallback, useState } from "react";

import { createTimestamp } from "@/lib/data";
import { buildDemoStore, DEMO_AUTH } from "@/lib/demoCaseload";
import { ensureUuids } from "@/lib/supabaseMappers";

/**
 * Demo mode: the real interface, sample records, no account and no network.
 *
 * Every screen in this app sits behind Supabase credentials and a signed-in
 * user, which means a deployed build without them can only ever show the
 * configuration screen. That is correct for a production deployment and useless
 * for everyone else: a preview URL on a pull request, a teacher seeing the
 * product for the first time, a designer reviewing the report layout.
 *
 * So this is opt-in and explicit, in either of two ways:
 *
 *   ?demo=1                     - any deployment, by adding the query string
 *   VITE_DEMO_MODE=true         - baked in at build time, for a preview build
 *
 * Demo mode never constructs a Supabase client and never writes anywhere: the
 * store below lives in React state and disappears on reload. Nothing typed into
 * a demo session can reach a real student record.
 */
export const isDemoMode = (() => {
  if (import.meta.env.VITE_DEMO_MODE === "true") return true;
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("demo") === "1";
})();

/** Whether demo mode was asked for by the build rather than the address. */
export const demoBakedIn = import.meta.env.VITE_DEMO_MODE === "true";

/**
 * The address that turns demo mode off again, for the banner's link - or null
 * when there is no way to leave it, which is the case in a build that bakes
 * demo mode in. Offering a link that does nothing would be worse than none.
 */
export function demoExitHref() {
  if (typeof window === "undefined") return null;
  if (!new URLSearchParams(window.location.search).has("demo")) return null;
  const url = new URL(window.location.href);
  url.searchParams.delete("demo");
  return url.pathname + url.search + url.hash;
}

/**
 * Stands in for useSupabaseAuth. There is no account behind it, so sign-out
 * cannot do anything meaningful and the banner offers the way back instead.
 */
export function useDemoAuth() {
  const signOut = useCallback(async () => {}, []);
  return { ...DEMO_AUTH, signIn: async () => {}, signUp: async () => {}, resetPassword: async () => {}, signOut };
}

/**
 * Stands in for useSupabaseStore, exposing the identical
 * `{ store, setStore, replaceStore, loading, saving, error, reload }` surface so
 * the workspace cannot tell the two apart. It applies updates synchronously -
 * there is nothing to wait for - and always reports `saving: false`, because
 * pretending to save would be a lie the UI would then display.
 */
export function useDemoStore() {
  // ids are normalised to uuids up front, exactly as the real store does on the
  // first write, so React keys do not change under the UI mid-session.
  const [store, setLocalStore] = useState(() => {
    const seeded = buildDemoStore();
    return { ...ensureUuids(seeded), lastUpdated: seeded.lastUpdated };
  });

  const setStore = useCallback(updater => {
    setLocalStore(prev => {
      const candidate = typeof updater === "function" ? updater(prev) : updater;
      if (!candidate || typeof candidate !== "object") return prev;
      return { ...ensureUuids(candidate), lastUpdated: createTimestamp() };
    });
  }, []);

  const replaceStore = useCallback(nextStore => setStore(nextStore), [setStore]);

  const reload = useCallback(async () => {
    const seeded = buildDemoStore();
    setLocalStore({ ...ensureUuids(seeded), lastUpdated: seeded.lastUpdated });
  }, []);

  return { store, setStore, replaceStore, loading: false, saving: false, error: null, reload };
}
