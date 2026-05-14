import { NextResponse } from "next/server";
import { createPublication } from "@/lib/actions/publication";

export async function GET() {
    const result = await createPublication({
        title: "Local Test Publication",
        doi: "10.1000/test",
        journal: "Test Journal",
        date_published: "2024-01-01",
        authors: ["Alice Anderson", "Hannah Sans"],
        is_oa: false,
        type: "other",
    });

    return NextResponse.json(result);
}