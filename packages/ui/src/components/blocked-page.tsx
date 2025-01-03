import React from "react";
import { clsx } from "clsx";

interface BlockedPageProps {
  title?: string;
  message?: string;
  className?: string;
}

export function BlockedPage({
  title = "Access Restricted",
  message = "Sorry, this service is not available in your region.",
  className,
}: BlockedPageProps) {
  return (
    <div
      className={clsx(
        "flex flex-grow flex-col items-center justify-center p-4 h-screen w-screen max-w-md mx-auto",
        className,
      )}
    >
      <h1 className="text-4xl font-bold pb-4">{title}</h1>
      <p className="text-lg text-muted-foreground text-center">{message}</p>
    </div>
  );
}
