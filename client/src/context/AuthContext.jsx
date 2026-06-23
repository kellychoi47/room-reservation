import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
const AuthContext = createContext();
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); const [profile, setProfile] = useState(null); const [loading, setLoading] = useState(true);
  const hydrate = async (session) => { setUser(session?.user ?? null); if (session?.user) { const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single(); setProfile(data); } else setProfile(null); setLoading(false); };
  useEffect(() => {
    let active = true;

    async function loadData() {
      const { data } = await supabase.auth.getSession();
      if (active) await hydrate(data.session);
    }

    loadData();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (active) await hydrate(session);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);
  return <AuthContext.Provider value={{ user, profile, loading, signOut: () => supabase.auth.signOut() }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
