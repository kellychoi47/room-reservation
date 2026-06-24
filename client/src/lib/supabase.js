import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const apiBaseUrl = import.meta.env.VITE_API_URL;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const isApiConfigured = Boolean(apiBaseUrl);

// A placeholder lets the UI report a useful configuration error instead of crashing at module load.
export const supabase = createClient(
  supabaseUrl || 'https://configuration-required.supabase.co',
  supabaseAnonKey || 'configuration-required',
);

export const api = async (path, options = {}) => {
  if (!isApiConfigured) {
    const error = new Error('Workspace service is not configured for this environment.');
    console.error('[ReserveFlow API] Missing VITE_API_URL for request:', path);
    throw error;
  }

  let abortTimer;

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;

    const controller = new AbortController();
    abortTimer = window.setTimeout(() => controller.abort(), 12000);
    const response = await fetch(`${apiBaseUrl}${path}`, {
      ...options,
      signal: options.signal || controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(session && { Authorization: `Bearer ${session.access_token}` }),
        ...options.headers,
      },
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || `Request failed (${response.status})`);
    return body;
  } catch (error) {
    const message = error.name === 'AbortError'
      ? 'Request timed out. Please check your connection and try again.'
      : error.message || 'Request failed.';
    console.error('[ReserveFlow API] Request failed:', { path, message });
    throw new Error(message);
  } finally {
    if (abortTimer) window.clearTimeout(abortTimer);
  }
};
