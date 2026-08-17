import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Session handling on top of Supabase Auth.
 *
 * Replaces the previous local scheme, which kept accounts in localStorage under
 * `sumry_users_v1` and "hashed" passwords with `((h << 5) - h)` - not a hash,
 * and trivially reversible. Those credentials cannot be migrated, so existing
 * users register again.
 *
 * `status` distinguishes the three states the UI has to tell apart: still
 * resolving the session on load, signed out, and signed in. Rendering the login
 * screen while the session is still resolving causes a visible flash for anyone
 * already signed in.
 */
export function useSupabaseAuth() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | signedOut | signedIn

  useEffect(() => {
    let active = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        setSession(data.session ?? null);
        setStatus(data.session ? "signedIn" : "signedOut");
      })
      .catch(() => {
        // If the session can't be resolved - offline, or the project is
        // unreachable - fall through to the sign-in screen. Leaving the status
        // on "loading" would strand the user on the boot screen indefinitely.
        if (active) setStatus("signedOut");
      });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession ?? null);
      setStatus(nextSession ? "signedIn" : "signedOut");
      if (!nextSession) setProfile(null);
    });

    return () => {
      active = false;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  // Load the profile row that the handle_new_user trigger creates on signup.
  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;

    let active = true;
    supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (active && data) setProfile(data);
      });

    return () => { active = false; };
  }, [session?.user?.id]);

  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async ({ email, password, name, organization }) => {
    const [first, ...rest] = String(name ?? "").trim().split(/\s+/).filter(Boolean);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: first ?? "",
          last_name: rest.join(" "),
          role: "teacher",
          organization: organization ?? "",
        },
      },
    });
    if (error) throw error;

    // With email confirmation enabled (the Supabase default) no session is
    // returned; the caller needs to say "check your inbox" rather than assume
    // the user is now signed in.
    return { needsEmailConfirmation: !data.session };
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const resetPassword = useCallback(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/`,
    });
    if (error) throw error;
  }, []);

  const user = session?.user ?? null;
  const displayName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    user?.email?.split("@")[0] ||
    "";

  return {
    status,
    session,
    user,
    profile,
    displayName,
    organization: profile?.organization ?? null,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
}
