
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
}
if (require.main === module) {
  test();
}

