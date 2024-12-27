import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@repo/ui/components/ui/button";
import { LogIn } from "lucide-react";

export function NavLoginButton() {
  const { ready, authenticated, login } = usePrivy();

  // Disable login when Privy is not ready or the user is already authenticated
  const disableLogin = !ready || authenticated;

  return (
    <Button variant="ghost" size="sm" onClick={login} disabled={disableLogin}>
      <LogIn key="login-icon" />
      <span className="ml-2">Log in</span>
    </Button>
  );
}
