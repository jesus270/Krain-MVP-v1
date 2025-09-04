import { Button } from "@krain/ui/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@krain/ui/components/ui/card";
import Link from "next/link";

export default function BlockedPage() {
  return (
    <main className="flex-grow flex flex-col items-center justify-center p-4 text-center">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-4xl">
            <h1>Access Restricted</h1>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl sm:text-2xl mb-4">
            We apologize, but access to KRAIN services is not available in your
            region due to regulatory requirements.
          </p>
          <p className="text-md sm:text-lg text-gray-500">
            KRAIN complies with international regulations and cannot provide
            services to users in certain jurisdictions.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/" target="_blank">
            <Button size="lg">Visit Main Website</Button>
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
