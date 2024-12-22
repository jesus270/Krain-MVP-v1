import { usePrivy } from "@privy-io/react-auth";
import { LogIn } from "lucide-react";
import { SidebarMenuButton } from "@repo/ui/components/ui/sidebar";

export function NavLoginButton() {
  const { ready, authenticated, login } = usePrivy();
  // Disable login when Privy is not ready or the user is already authenticated
  const disableLogin = !ready || (ready && authenticated);

  return (
    <SidebarMenuButton
      disabled={disableLogin}
      onClick={login}
      className="w-full bg-primary text-primary-foreground"
    >
      <LogIn />
      <span>Log in</span>
    </SidebarMenuButton>
  );
}
