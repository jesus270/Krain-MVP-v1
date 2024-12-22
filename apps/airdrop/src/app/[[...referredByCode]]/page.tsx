import { Dashboard } from "./dashboard";

export default async function Home({
  params,
}: {
  params: Promise<{ referredByCode?: string[] }>;
}) {
  const resolvedParams = await params;

  const referredByCode = resolvedParams.referredByCode?.[0];

  return <Dashboard referredByCode={referredByCode} />;
}
