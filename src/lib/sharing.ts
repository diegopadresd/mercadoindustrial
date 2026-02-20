/**
 * Generate a share URL that goes through the dynamic-render edge function
 * so social bots (WhatsApp, Facebook, Twitter) get proper OG meta tags.
 *
 * Human visitors are instantly redirected to the SPA by the edge function.
 */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export function getSocialShareUrl(path: string): string {
  return `${SUPABASE_URL}/functions/v1/dynamic-render?path=${encodeURIComponent(path)}`;
}
