import { NextResponse } from "next/server";
import { ApiResponse } from "@/lib/types/api";
import { OpenAlexWork, ParsedOpenAlexWork } from "@/lib/types/publication";
import { orcidSchema } from "@/lib/validations/publication";
import { parseOpenAlexWork, resolveOpenAlexTypeDesignation } from "@/lib/utils/openalex";
import { OPENALEX_TYPE_DESIGNATIONS, OpenAlexTypeDesignation } from "@/lib/types/openalex";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orcid = searchParams.get("orcid");
  const rawType = searchParams.get('type') ?? 'publication';
  const type: OpenAlexTypeDesignation | null = 
    ['publication', 'product', 'publication_product'].includes(rawType as OpenAlexTypeDesignation)
    ? (rawType as OpenAlexTypeDesignation)
    : null;

  if(!orcid) {
    return NextResponse.json<ApiResponse<ParsedOpenAlexWork[]>>(
      { success: false, error: "ORCID iD required" },
      { status: 400 }
    );
  }

  if(!type) {
    return NextResponse.json<ApiResponse<ParsedOpenAlexWork[]>>(
      { success: false, error: "Invalid work type. Allowed types: 'publication', 'product', 'publication_product" },
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
        return typeDesignation === type || typeDesignation === 'publication_product' ? parsed : null; 
      })
      .filter((work: ParsedOpenAlexWork | null): work is ParsedOpenAlexWork => work !== null && (type === 'publication' ? work.doi !== null : true));

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