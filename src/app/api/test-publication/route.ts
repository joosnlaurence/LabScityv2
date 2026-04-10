import { createPublication } from "@/lib/actions/publication";
import { NextResponse } from "next/server";

export async function GET() {
  const result = await createPublication({
    title: "Second Test Publication",
    doi: "12.1000/test-doi2",
    journal: "Test Journal",
    date_published: "2025-01-01",
    authors: ["Barbara Sharanowski", "Jane Smith"]
  });

  return NextResponse.json(result);
}