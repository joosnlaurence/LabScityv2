'use server'

import { createClient } from "@/supabase/server"
import { SupabaseClient } from "@supabase/supabase-js"


export async function createChat(invitees: string[], supabaseClient?: SupabaseClient) {

  const supabase = supabaseClient || await createClient();

}
