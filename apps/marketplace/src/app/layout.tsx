import type { Metadata } from "next";
import { RootLayout as AppRootLayout } from "@krain/ui/layouts/root-layout";
import { SidebarNav } from "./components/nav-sidebar";
import Header from "./components/header";
import { SidebarInset, SidebarProvider } from "@krain/ui/components/ui/sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Krain AI - Agent Portal",
  description: "Krain AI Agent Portal",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AppRootLayout
      authConfig={{
        privyAppId: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
        loadingTitle: "Welcome to the Krain AI Agent Portal",
        loadingDescription: "Please wait while we validate your session...",
        validateSession: false,
      }}
      intercomAppId={process.env.NEXT_PUBLIC_INTERCOM_APP_ID}
    >
      <SidebarProvider>
        <>
          <SidebarNav />
          <SidebarInset className="overflow-y-auto overflow-x-hidden">
            <Header />
            {children}
          </SidebarInset>
        </>
      </SidebarProvider>
    </AppRootLayout>
  );
}
