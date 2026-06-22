import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
export const api = async (path, options = {}) => {
  const { data: { session } } = await supabase.auth.getSession();
  const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(session && { Authorization: `Bearer ${session.access_token}` }), ...options.headers } });
  const body = await response.json(); if (!response.ok) throw new Error(body.error || 'Request failed'); return body;
};
