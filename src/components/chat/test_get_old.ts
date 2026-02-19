
import { createClient } from "@supabase/supabase-js";
import { getOldMessages, getChatsWithPreview as getChatsWithPreview } from "./use-chat";

async function test() {

  console.log("start test");


  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_SECRET_SUPABASE_KEY!,
  )

  const result1 = getOldMessages(1, supabaseAdmin);
  console.log(result1);

  // WARN: The view in the database (chat_sidebar) uses the authid, so it cannot be tested here
  const result2 = getChatsWithPreview("66d5fb76-fa15-4edf-8f1c-3b645465a94c", supabaseAdmin)

  console.log(result2);
}
if (require.main === module) {
  test();
}

