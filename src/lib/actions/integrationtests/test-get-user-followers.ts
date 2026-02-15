import { createClient } from "@supabase/supabase-js";
import { getUserFollowers, getUserFollowing } from "../profile";

async function test() {

  console.log("start test");


  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_SECRET_SUPABASE_KEY!,
  )


  const result1 = getUserFollowers("de94bc67-e7a7-46d3-b819-bb069c96fa4c", supabaseAdmin)
  const result2 = getUserFollowing("de94bc67-e7a7-46d3-b819-bb069c96fa4c", supabaseAdmin)
  const result3 = getUserFollowers("02fe68aa-1c88-477d-9f0f-b9dd86736537", supabaseAdmin)
  const result4 = getUserFollowing("02fe68aa-1c88-477d-9f0f-b9dd86736537", supabaseAdmin)

  console.log("Get Colton followers: ", (await result1).data)
  console.log("Get Colton following: ", (await result2).data)
  console.log("Get Chris followers: ", (await result3).data)
  console.log("Get Chris following: ", (await result4).data)

}

if (require.main === module) {
  test();
}
