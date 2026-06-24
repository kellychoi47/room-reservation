import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const AuthContext = createContext();
const loadingMessage = 'Unable to load workspace. Please check your connection or try again.';

const withTimeout = (promise, ms = 12000) => Promise.race([
  promise,
  new Promise((_, reject) => window.setTimeout(() => reject(new Error('Request timed out.')), ms)),
]);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const hydrate = useCallback(async (session) => {
    setUser(session?.user ?? null);

    if (!session?.user) {
      setProfile(null);
      return;
    }

    const { data, error: profileError } = await withTimeout(
      supabase.from('profiles').select('*').eq('id', session.user.id).single(),
    );
    if (profileError) throw profileError;
    setProfile(data);
  }, []);

  const loadWorkspace = useCallback(async () => {
    setLoading(true);
    setError('');

    if (!isSupabaseConfigured) {
      console.error('[ReserveFlow Auth] Supabase environment variables are missing.');
      setUser(null);
      setProfile(null);
      setError(loadingMessage);
      setLoading(false);
      return;
    }

    try {
      const { data, error: sessionError } = await withTimeout(supabase.auth.getSession());
      if (sessionError) throw sessionError;
      await hydrate(data.session);
    } catch (cause) {
      console.error('[ReserveFlow Auth] Workspace bootstrap failed:', {
        message: cause?.message || 'Unknown error',
      });
      setUser(null);
      setProfile(null);
      setError(loadingMessage);
    } finally {
      setLoading(false);
    }
  }, [hydrate]);

  useEffect(() => {
    let active = true;
    loadWorkspace();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!active) return;
      try {
        setLoading(true);
        setError('');
        await hydrate(session);
      } catch (cause) {
        console.error('[ReserveFlow Auth] Auth state refresh failed:', {
          message: cause?.message || 'Unknown error',
        });
        setError(loadingMessage);
      } finally {
        if (active) setLoading(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [hydrate, loadWorkspace]);

  return <AuthContext.Provider value={{
    user,
    profile,
    loading,
    error,
    retry: loadWorkspace,
    signOut: () => supabase.auth.signOut(),
  }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
