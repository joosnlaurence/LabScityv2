import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { ApiResponse } from "@/lib/types/api";
import { OpenAlexWork, ParsedOpenAlexWork } from "@/lib/types/publication";
import { orcidSchema } from "@/lib/validations/publication";
import { parseOpenAlexWork, resolveOpenAlexTypeDesignation } from "@/lib/utils/openalex";
import { OPENALEX_TYPE_DESIGNATIONS } from "@/lib/types/openalex";

export async function POST(request: Request) {
  const { orcid, profile_user_id } = await request.json();
  const cleanOrcid = String(orcid ?? "").trim();

  if (!cleanOrcid || !profile_user_id) {
    return NextResponse.json(
      { error: "Missing orcid or user_id" }, 
      { status: 400 }
    );
  }

  // fetching from openAlex using the cleaned ochidId
  // using map to transform openAlex topics into fields supabase expects: openalex_id, name, and tag_type
  const response = await fetch(
    `https://api.openalex.org/authors?filter=orcid:${cleanOrcid}`
  );

  if(!response.ok){
    return NextResponse.json(
      { error: "OpenAlex request failed"},
      {status: 502}
    );
  }

  const data = await response.json();
  const author = data?.results?.[0];

  if (!author) {
    return NextResponse.json(
      { error: "Author not found" }, 
      { status: 404 });
  }

  const topics = author.topics ?? [];
  const totalCount = topics.reduce((sum: number, topic: any) => sum + topic.count, 0);

  
  const cleanedTopicIds = topics.map((topic: any) =>
    topic.id.replace("https://openalex.org/", "")
  );


  // creating a supabase client for API route
  // reference: https://supabase.com/docs/reference/javascript/typescript-support
  // use openalex_id as the conflict key to see if the tags table already has for our transfored topics
  // then selecting the rows that exist in the table after the upsert operation and looping through each tag row
  // for each tag return a profile_user_id and a tag_id for the profile_tags table
  const supabase = await createClient();

  const { data: tagRows, error: tagError } = await supabase
    .from("tags")
    .select("id, openalex_id")
    .in("openalex_id", cleanedTopicIds)
    .eq("level", 3);

  if (tagError) return NextResponse.json(
    { error: tagError.message }, 
    { status: 500 }
  );

  const tagMap = new Map<string, number>((tagRows ?? []).map((tag: any) => [tag.openalex_id, tag.id]));


  const profileTags = topics
  .map((topic: any) => {
      const cleanId = topic.id.replace("https://openalex.org/", "");
      const tagId = tagMap.get(cleanId);

      if (!tagId) return null;

      return {
        profile_user_id,
        tag_id: tagId,
        raw_count: topic.count,
        weight: totalCount > 0 ? topic.count / totalCount : 0,
      };
    })
    .filter(Boolean);

   const { error: profileTagsErr } = await supabase
    .from("profile_tags")
    .upsert(profileTags, {
      onConflict: "profile_user_id,tag_id",
    });

  if (profileTagsErr) {
    return NextResponse.json({ error: profileTagsErr.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    topics_inserted: profileTags.length,
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orcid = searchParams.get("orcid");

  if(!orcid) {
    return NextResponse.json<ApiResponse<ParsedOpenAlexWork[]>>(
      { success: false, error: "ORCID iD required" },
      { status: 400 }
    );
  }

  const parsed = orcidSchema.safeParse(orcid);
  
  if(!parsed.success) {
    return NextResponse.json<ApiResponse<ParsedOpenAlexWork[]>>(
      {success: false, error: "Invalid ORCID iD"},
      {status: 400}
    );
  }

  const normalizedOrcid = parsed.data;

  const url = `https://api.openalex.org/works?filter=authorships.author.orcid:${normalizedOrcid}&per_page=200&sort=publication_date:desc`;
  try {
    const res = await fetch(url);
    if(!res.ok) {
      const errorBody = await res.json().catch(() => null);
      return NextResponse.json<ApiResponse<ParsedOpenAlexWork[]>>(
        {success:false, error: errorBody?.message ?? `OpenAlex request failed with status ${res.status}`},
        {status: 502}
      )
    }
    const data = await res.json();
    const parsedWorks: ParsedOpenAlexWork[] = 
      (data.results ?? [])
      .map((raw: OpenAlexWork) => {
        const parsed = parseOpenAlexWork(raw);
        const typeDesignation = OPENALEX_TYPE_DESIGNATIONS[parsed.type] ?? 'product';
        return typeDesignation === 'publication' || typeDesignation === 'publication_product' ? parsed : null; 
      })
      .filter((work: ParsedOpenAlexWork | null): work is ParsedOpenAlexWork => work !== null && work.doi !== null);

    return NextResponse.json<ApiResponse<ParsedOpenAlexWork[]>>({
      success: true,
      data: parsedWorks
    })
  } catch(err) {
    console.error('OpenAlex fetch failed', err);
    return NextResponse.json<ApiResponse<ParsedOpenAlexWork[]>>(
      {success: false, error: 'OpenAlex fetch failed'},
      {status: 502}
    )
  }  
}