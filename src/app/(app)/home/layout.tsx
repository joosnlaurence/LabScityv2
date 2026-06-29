import { HomeLayoutClient } from "./home-layout-client";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HomeLayoutClient>{children}</HomeLayoutClient>;
}
