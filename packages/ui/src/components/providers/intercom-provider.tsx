"use client";

import Intercom from "@intercom/messenger-js-sdk";
import { useEffect } from "react";

export interface IntercomConfig {
  appId: string | undefined;
  user?:
    | {
        email?: string;
        name?: string;
        id?: string;
        createdAt?: Date;
      }
    | undefined;
}

export function IntercomProvider({
  children,
  config,
}: {
  children: React.ReactNode;
  config: IntercomConfig;
}) {
  if (!config.appId) {
    throw new Error("Intercom App ID is not set");
  }

  Intercom(
    config.user
      ? {
          app_id: config.appId,
          email: config.user.email,
          name: config.user.name,
          user_id: config.user.id,
          created_at: config.user.createdAt?.getTime(),
        }
      : {
          app_id: config.appId,
        },
  );

  return <>{children}</>;
}
