"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useWallets, useSolanaWallets } from "@privy-io/react-auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { Skeleton } from "@repo/ui/components/ui/skeleton";

export default function Profile() {
  const {
    ready,
    authenticated,
    user,
    logout,
    linkEmail,
    connectWallet,
    unlinkEmail,
    unlinkPhone,
    unlinkWallet,
    linkGoogle,
    unlinkGoogle,
    linkTwitter,
    unlinkTwitter,
    linkDiscord,
    unlinkDiscord,
  } = usePrivy();

  const { wallets: solanaWallets } = useSolanaWallets();

  const handleConnectWallet = async () => {
    try {
      await connectWallet({
        walletList: ["phantom", "detected_solana_wallets"],
      });
      // After connection, use loginOrLink on the most recently connected wallet
      if (solanaWallets[0]) {
        await solanaWallets[0].loginOrLink();
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  if (!ready) {
    return (
      <main className="flex flex-grow flex-col items-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col gap-2">
            <Skeleton className="h-8 w-full mb-2 bg-foreground/10" />
          </CardContent>
        </Card>
      </main>
    );
  }

  console.log("user", user);

  const numAccounts = user?.linkedAccounts?.length || 0;
  const canRemoveAccount = numAccounts > 1;

  const email = user?.email;
  const wallet = user?.wallet;

  const twitterSubject = user?.twitter?.subject || null;

  return (
    <main className="flex flex-grow flex-col items-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            <h1 className="text-2xl">Account Integrations</h1>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {ready ? (
            <>
              <p>
                <span className="font-semibold">Email:</span>{" "}
                <span className="mr-2">
                  {user?.email?.address ?? "Not connected"}
                </span>
                {email ? (
                  <Button
                    onClick={() => {
                      unlinkEmail(email.address);
                    }}
                    disabled={!canRemoveAccount}
                  >
                    Unlink email
                  </Button>
                ) : (
                  <Button onClick={linkEmail}>Connect email</Button>
                )}
              </p>
              <p>
                <span className="font-semibold">Wallet:</span>{" "}
                <span className="mr-2">
                  {user?.wallet?.address ?? "Not connected"}
                </span>
                {wallet ? (
                  <Button
                    onClick={() => {
                      unlinkWallet(wallet.address);
                    }}
                    disabled={!canRemoveAccount}
                  >
                    Unlink wallet
                  </Button>
                ) : (
                  <Button onClick={handleConnectWallet}>Connect wallet</Button>
                )}
              </p>
              <p>
                <span className="font-semibold">Twitter:</span>{" "}
                <span className="mr-2">
                  {user?.twitter?.username ?? "Not connected"}
                </span>
                {twitterSubject ? (
                  <Button
                    onClick={() => {
                      unlinkTwitter(twitterSubject);
                    }}
                    disabled={!canRemoveAccount}
                  >
                    Unlink Twitter
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      linkTwitter();
                    }}
                  >
                    Connect Twitter
                  </Button>
                )}
              </p>
            </>
          ) : (
            <>
              <Skeleton className="h-8 w-full mb-2 bg-foreground/10" />
              <Skeleton className="h-8 w-full mb-2 bg-foreground/10" />
              <Skeleton className="h-8 w-full mb-2 bg-foreground/10" />
              <Skeleton className="h-8 w-full mb-2 bg-foreground/10" />
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
