import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Access Blocked",
  description: "This service is not available in your region",
};

export default function BlockedPage() {
  return (
    <div className="flex min-h-[100vh] flex-col items-center justify-center p-4 bg-background">
      <div className="max-w-md text-center">
        <h1 className="mb-4 text-4xl font-bold text-foreground">
          Access Blocked
        </h1>
        <p className="mb-8 text-lg text-muted-foreground">
          We apologize, but this service is not available in your region due to
          regulatory requirements.
        </p>
      </div>
    </div>
  );
}
