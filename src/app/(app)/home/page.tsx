import type { Metadata } from "next";
import HomeFeedServer from "@/components/feed/home-feed-server";

export const metadata: Metadata = {
  title: "Home | LabScity",
  description: "Discover research updates from the LabScity community.",
};

export default async function HomePage() {
  return <HomeFeedServer />;
}
