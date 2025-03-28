"use client";

import { Construction } from "lucide-react";

export function AdditionalPointsMessage() {
  return (
    <div className="flex flex-col items-start gap-2 text-muted-foreground">
      <div className="flex items-center gap-2">
        <Construction className="h-5 w-5 shrink-0 text-yellow-500" />
        <p className="text-muted-foreground">
          Additional points opportunities will be added to the dashboard soon
          for X Engagement Actions and Telegram Community Participation.
        </p>
      </div>
    </div>
  );
}
