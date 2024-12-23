import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@repo/ui/components/ui/button";
import { LogIn } from "lucide-react";

export function NavLoginButton() {
  const { login } = usePrivy();

  return (
    <Button variant="ghost" size="sm" onClick={login}>
      <LogIn key="login-icon" />
      <span className="ml-2">Log in</span>
    </Button>
  );
}
