import { Product } from "@/lib/types/data";

export const sampleProducts: Product[] = [
  {
    product_id: 1,
    title: "SeqAlign-GPU",
    short_summary:
      "GPU-accelerated short-read sequence aligner with a Python API, benchmarked against BWA-MEM on whole-genome datasets.",
    website_link: "https://seqalign-gpu.org",
    publication_id: 42, // links back to a publication
    images: ["products/seqalign/architecture.png", "products/seqalign/benchmark.png"],
    github_link: "https://github.com/labscity-demo/seqalign-gpu",
    other_links: ["https://pypi.org/project/seqalign-gpu", "https://hub.docker.com/r/labscity/seqalign-gpu"],
    contributors: ["Maria Alvarez", "Devin Okafor", "Liang Chen"],
    is_featured: true,
    product_type: "tool",
    topics: ["Bioinformatics", "Genomics", "High-Performance Computing"],
  },
  {
    product_id: 2,
    title: "Nearctic Pollinator Occurrence Dataset (2019–2023)",
    short_summary:
      "Curated occurrence records for 312 native bee species across North America, with cleaned taxonomy and georeferencing.",
    website_link: null,
    publication_id: 57,
    images: null,
    github_link: null,
    other_links: ["https://doi.org/10.5061/dryad.example1234"],
    contributors: ["Priya Raman", "Tomás Herrera"],
    is_featured: false,
    product_type: "platform",
    topics: ["Entomology", "Biodiversity", "Ecology"],
  },
  {
    product_id: 3,
    title: "FoldView",
    short_summary: "Browser-based protein structure viewer for teaching, no install required.",
    website_link: "https://foldview.app",
    publication_id: null, // standalone product, not tied to a paper
    images: ["products/foldview/screenshot.png"],
    github_link: "https://github.com/labscity-demo/foldview",
    other_links: null,
    contributors: ["Sarah Kim"],
    is_featured: true,
    product_type: "ai_tool",
    topics: ["Structural Biology", "Science Education"],
  },
  {
    // intentionally sparse — most optional fields null, to test empty-state rendering
    product_id: 4,
    title: "Untitled Lab Protocol Draft",
    short_summary: null,
    website_link: null,
    publication_id: null,
    images: null,
    github_link: null,
    other_links: null,
    contributors: null,
    is_featured: null,
    product_type: null,
    topics: null,
  },
];