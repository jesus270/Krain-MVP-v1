"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";

interface ProfileCompletionMessageProps {
  show: boolean;
}

export function ProfileCompletionMessage({
  show,
}: ProfileCompletionMessageProps) {
  if (!show) return null;
  return (
    <div className="flex items-start gap-2 text-muted-foreground">
      <AlertCircle className="h-5 w-5 shrink-0 text-yellow-500" />
      <p>
        Complete your{" "}
        <Link
          href="/profile"
          className="text-blue-300 hover:underline font-medium"
        >
          Profile
        </Link>{" "}
        to earn more points by connecting your email, X account, and joining our
        Telegram channels!
      </p>
    </div>
  );
}
