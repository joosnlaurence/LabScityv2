import { createProduct, getUserProducts } from "@/lib/actions/product";
import { NextResponse } from "next/server";

// this is just for testing

/*
export async function GET() {
  const result = await createProduct({
    title: "Second test Product",
    short_summary: "Second product for LabScity",
    website_link: "https://testwebsite.com",
    publication_id: 2,
  });

  return NextResponse.json(result);
}
  */



export async function GET(){
    const result = await getUserProducts(
        "b798c0c3-bd97-4595-8ac1-d05029206303"
    )
    return NextResponse.json(result);
}
