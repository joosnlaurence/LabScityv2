import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import type { ApiResponse, Publication } from "@/lib/types/api";

// this api is used to get your own publications to put them on your profile
export async function GET() {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
        return NextResponse.json<ApiResponse<Publication[]>>(
            { success: false, error: "Authentication required" },
            { status: 401 }
        );
    }

    const { data: userPublicationData, error: userPublicationLinkError } = await supabase
        .from("user_publications")
        .select("publication_id")
        .eq("user_id", authData.user.id);

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