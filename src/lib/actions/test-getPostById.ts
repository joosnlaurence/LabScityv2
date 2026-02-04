import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { getPostById } from "../actions/data";
import { GetPostByIdInput, GetUserPostsInput } from "../types/data";
import { getUserPosts } from "../actions/data";

async function testGetPostById() {
  console.log("Starting testing");

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_SECRET_SUPABASE_KEY!,
  )

  const test_id: GetPostByIdInput = {
    post_id: 10
  }

  const result1 = await getPostById(test_id, supabaseAdmin);

  console.log("Result: ", result1);

  const test_user: GetUserPostsInput = {
    user_id: "02fe68aa-1c88-477d-9f0f-b9dd86736537"
  }

  const result2 = await getUserPosts(test_user, supabaseAdmin);

  console.log("Result: ", result2);

  const result3 = await getUserPosts({
    user_id: "02fe68aa-1c88-477d-9f0f-b9dd86736537",
    limit: 1,
  }, supabaseAdmin);

  console.log("Result3 ", result3);
}

if (require.main === module) {
  testGetPostById();
}
