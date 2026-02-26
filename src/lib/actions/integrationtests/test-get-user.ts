import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { getUser } from "../data";
import { get } from "http";


async function test() {
  console.log("start test");


  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_SECRET_SUPABASE_KEY!,
  )

  const data = getUser("02fe68aa-1c88-477d-9f0f-b9dd86736537", supabaseAdmin);
  console.log(data);
}

if (require.main === module) {
  test();
}
