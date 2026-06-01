import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

// Cliente com service role — IGNORA RLS. Usar SOMENTE no servidor
// (route handlers de checkout/webhook e ações administrativas). Nunca no browser.
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
