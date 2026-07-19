import { NextResponse } from "next/server";
import type { ApiResponse } from "@/lib/types/api";
import type { LocationResult } from "@/lib/types/data";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    if (!q) {
        return NextResponse.json<ApiResponse<null>>(
            { 
                success: false, 
                error: "Query required" 
            },
            { status: 400 }
        );
    }

    const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=10`,
        { headers: 
            { "User-Agent": "LabScity/1.0" } 
        }
    );

    if (!response.ok) {
        console.error('Nominatim error:', response.status, await response.text());
        return NextResponse.json<ApiResponse<null>>(
            { success: false, error: "Location search failed" },
            { status: 500 }
        );
    }

    const data: LocationResult[] = await response.json();
    const deduplicated = data.filter(
        (item, index, arr) => arr.findIndex(i => i.display_name === item.display_name) === index
    );

    // frontend can use the display_name field to display the name of the location
    // lat and lon are also returned with the response if we want to use that
    return NextResponse.json<ApiResponse<LocationResult[]>>({
        success: true,
        data: deduplicated
    });
}