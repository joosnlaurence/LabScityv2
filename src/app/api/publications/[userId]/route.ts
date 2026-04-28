import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import type { ApiResponse, Publication } from "@/lib/types/api";

// this api is used to get any user's publications using their user id 
export async function GET(
    request: Request,
    { params } : { params: Promise<{ userId: string }>}
) {
    const { userId } = await params;
    const supabase = await createClient();

    const { data: userPublicationData, error: userPublicationLinkError } = await supabase
        .from("user_publications")
        .select("publication_id")
        .eq("user_id", userId);

    if (userPublicationLinkError) {
        return NextResponse.json(
            { 
                success: false, 
                error: userPublicationLinkError.message 
            }, { status: 500 }
        );
    }

    // extracting publication_id from each row in usePublicationData to get a plain array of ids
    const userPublicationIds = (userPublicationData ?? []).map((row) => row.publication_id);

    // .in filters results based on if a column's value matches any item in the userPublicationIds array
    const { data, error } = await supabase
        .from("publications")
        .select("*")
        .in("publication_id", userPublicationIds);

    if (error) {
        return NextResponse.json(
            { 
                success: false, 
                error: error.message 
            }, { status: 500 }
        );
    }

    return NextResponse.json<{success: boolean; data: Publication[]}>(
        { 
            success: true, 
            data: data ?? [] 
        }
    );
}