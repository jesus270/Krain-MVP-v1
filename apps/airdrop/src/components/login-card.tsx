import { usePrivyAuth } from "@krain/ui/hooks/index";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@krain/ui/components/ui/card";
import { Button } from "@krain/ui/components/ui/button";

export const LoginCard = () => {
  const { login } = usePrivyAuth();
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
