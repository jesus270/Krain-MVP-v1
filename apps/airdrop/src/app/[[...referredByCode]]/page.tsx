import { HomePageClient } from "./home-page-client";

export default async function Home({
  params,
}: {
  params: Promise<{ referredByCode?: string[] }>;
}) {
  const resolvedParams = await params;

  return <HomePageClient params={resolvedParams} />;
}
