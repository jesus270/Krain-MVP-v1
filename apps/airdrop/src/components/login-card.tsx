import { usePrivy } from "@privy-io/react-auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@krain/ui/components/ui/card";
import { Button } from "@krain/ui/components/ui/button";

export const LoginCard = () => {
  const { login } = usePrivy();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={() => login()}>Login</Button>
      </CardContent>
    </Card>
  );
};
