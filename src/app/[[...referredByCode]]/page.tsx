import CreateWalletForm from "@/components/create-wallet-form";

export default async function Home({
  params,
}: {
  params: Promise<{ referredByCode?: string[] }>;
}) {
  const resolvedParams = await params;

  const referredByCode = resolvedParams.referredByCode?.[0];
  console.log("Home referredByCode", referredByCode);

  return <CreateWalletForm referredByCode={referredByCode} />;
}
