import { AirdropCards } from "./airdrop-cards";

export default async function Home({
  params,
}: {
  params: Promise<{ referredByCode?: string[] }>;
}) {
  const resolvedParams = await params;

  const referredByCode = resolvedParams.referredByCode?.[0];

  return <AirdropCards referredByCode={referredByCode} />;
}
