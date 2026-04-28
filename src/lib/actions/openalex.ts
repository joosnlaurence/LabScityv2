"use server"

import { createClient } from "@/supabase/server";

interface OpenAlexTopic {
    id: string;
    count: number;
}

interface OpenAlexAuthor {
    topics?: OpenAlexTopic[];
}

interface OpenAlexResponse {
    results?: OpenAlexAuthor[];
}

type ActionResponse = {
    success: boolean;
    error?: string;
    topicsInserted?: number;
}

interface TagRow {
    id: number;
    openalex_id: string;
}

export async function syncOpenAlexTopics(
    orcid: string, 
    profile_user_id: string
): Promise<ActionResponse> {
    const cleanOrcid = String(orcid ?? "").trim();

    // validating cleanOrcid and profile_user_id both exist
    if (!cleanOrcid || !profile_user_id) {
        return { success: false, error: "Missing orcid or user_id"};
    }

    const response = await fetch(
        `https://api.openalex.org/authors?filter=orcid:${cleanOrcid}`
    )

    if (!response.ok){
        return {success: false, error: "OpenAlex request failed"};
    }

    const data : OpenAlexResponse = await response.json();
    const author: OpenAlexAuthor | undefined = data.results?.[0];

    if (!author ){
        return {success: false, error: "Author not found"};
    }

    const topics: OpenAlexTopic[] = author.topics ?? [];

    // transform
    const totalTopicCount: number = topics.reduce(
        (sum: number, topic: OpenAlexTopic) => sum + topic.count, 0
    );

    const cleanedTopicIds: string[] = topics.map((topic: OpenAlexTopic) =>
        topic.id.replace("https://openalex.org/", "")
    );

    const supabase = await createClient();

    // upsert the topics into supabase
    const {data: tagRows, error: tagError } = await supabase
        .from("tags")
        .select("id, openalex_id")
        .in("openalex_id", cleanedTopicIds)
        .eq("level", 3);
    
    if(tagError){
        return { success: false, error: tagError.message };
    }

    const tagMap: Map<string, number> = new Map(
        (tagRows ?? []).map((tag: TagRow) => [
            tag.openalex_id,
            tag.id,
        ])
    );

    console.log("hello");
}