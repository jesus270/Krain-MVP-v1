import CreateWalletForm from "@/components/create-wallet-form";
import Image from "next/image";

export default async function Home({
  params,
}: {
  params: Promise<{ referredByCode?: string[] }>;
}) {
  const resolvedParams = await params;

  const referredByCode = resolvedParams.referredByCode?.[0];

  return (
    <main className="flex flex-col items-center max-w-md mx-auto">
      <Image width={300} height={150} src="/logo.png" alt="logo" />
      <div className="flex flex-col gap-4 w-full items-center">
        <h2 className="text-2xl font-bold">$KRAIN Airdrop List</h2>
        <CreateWalletForm referredByCode={referredByCode} />
      </div>
    </main>
  );
}
