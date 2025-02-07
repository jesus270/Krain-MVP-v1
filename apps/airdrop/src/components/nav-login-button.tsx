import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@krain/ui/components/ui/button";
import { LogIn } from "lucide-react";
import { cn } from "@krain/ui/lib/utils";

export function NavLoginButton() {
  const { ready, authenticated, login } = usePrivy();

  // Disable login when Privy is not ready or the user is already authenticated
  const disableLogin = !ready || authenticated;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={login}
      disabled={disableLogin}
      className="group relative overflow-hidden w-full bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10 hover:text-primary transition-all duration-300"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 animate-gradient-x" />
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      <LogIn
        key="login-icon"
        className="relative z-10 text-primary/80 group-hover:text-primary transition-colors group-hover:scale-110 duration-300"
      />
      <span className="relative z-10 ml-2 bg-gradient-to-r from-purple-500/90 to-blue-500/90 bg-clip-text text-transparent group-hover:from-purple-500 group-hover:to-blue-500 transition-all">
        Log in
      </span>
    </Button>
  );
}
