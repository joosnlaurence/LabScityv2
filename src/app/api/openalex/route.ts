import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";

export async function POST(request: Request) {
  const { orcid, profile_user_id } = await request.json();
  const cleanOrcid = String(orcid ?? "").trim();

  if (!cleanOrcid || !profile_user_id) {
    return NextResponse.json({ 
      error: "Missing orcid or user_id" 
    }, 
    { 
      status: 400 ,
      statusText: 'Bad Request'
    });
  }

  // // fetching from openAlex using the cleaned ochidId
  // using map to transform openAlex topics into fields supabase expects: openalex_id, name, and tag_type
  const response = await fetch(`https://api.openalex.org/authors?filter=orcid:${cleanOrcid}`);

  if(!response.ok){
    return NextResponse.json(
      { error: "OpenAlex request failed"},
      {status: 502}
    );
  }

  const data = await response.json();

  const author = data?.results?.[0];
  if (!author) return NextResponse.json({ error: "Author not found" }, { 
    status: 404,
    statusText: 'Author Not Found' 
  });

  const topics = (author.topics ?? []).map((topic: any) => ({
    openalex_id: topic.id.replace("https://openalex.org/", ""),  // cleaning because an id looks like this "id": "https://openalex.org/T10135",
    name: topic.display_name,
    tag_type: "topic",
  }));

  // creating a supabase client for API route
  // reference: https://supabase.com/docs/reference/javascript/typescript-support
  // use openalex_id as the conflict key to see if the tags table already has for our transfored topics
  // then selecting the rows that exist in the table after the upsert operation and looping through each tag row
  // for each tag return a profile_user_id and a tag_id for the profile_tags table
  const supabase = await createClient();

  const { data: tagRows, error: tagError } = await supabase
    .from("tags")
    .upsert(topics, { 
      onConflict: "openalex_id" 
    })
    .select("id, openalex_id");

  if (tagError) return NextResponse.json({ 
    error: tagError.message 
  }, { 
    status: 500 
  });

  const profileTags = (tagRows ?? []).map((tag: any) => ({
    profile_user_id,
    tag_id: tag.id,
  }));

  const { error: profileTagsErr } = await supabase
    .from("profile_tags")
    .upsert(profileTags, { onConflict: "profile_user_id,tag_id" });

  if (profileTagsErr) return NextResponse.json(
    { 
      error: profileTagsErr.message 
    }, 
    { 
      status: 500 
    }
  );

  return NextResponse.json({ 
    ok: true, 
    inserted: (tagRows ?? []).length // to tell frontend how many rows were inserted 
  });
}