import { HomePageClient } from "./home-page-client";
import { log } from "@krain/utils";

export default async function Home({
  params,
}: {
  params: Promise<{ referredByCode?: string[] }>;
}) {
  const resolvedParams = await params;

  log.info("Server page component rendering", {
    entity: "SERVER",
    operation: "page_render",
    params: resolvedParams,
    timestamp: new Date().toISOString(),
  });

  return <HomePageClient params={resolvedParams} />;
}
