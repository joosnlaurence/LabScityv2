import { NextResponse } from "next/server";
import { createProduct } from "@/lib/actions/product";

export async function GET() {
    const result = await createProduct({
        title: "Local Test Product",
        short_summary: "This is a test product!!.",
        website_link: "https://testtesttest.com",
        publication_id: 1,
        image_path: undefined,
        github_link: "https://github.com/example/test-product",
        other_links: ["https://example.com/docs"],
        contributors: ["Hannah Sands"],
        is_featured: false,
        product_type: "tool",
    });

    return NextResponse.json(result);
}



/*
export async function GET(){
    const result = await getUserProducts(
        "b798c0c3-bd97-4595-8ac1-d05029206303"
    )
    return NextResponse.json(result);
}
*/
