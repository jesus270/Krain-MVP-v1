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
    <>
      {/* Full-page background container with specific styles for viewport coverage */}
      <div
        className="marketplace-bg-container"
        style={{
          position: "fixed",
          top: "-5vh", // Extend beyond viewport edges
          left: "-5vw",
          right: "-5vw",
          bottom: "-5vh",
          width: "110vw", // Wider than viewport to ensure no gaps
          height: "110vh", // Taller than viewport to ensure no gaps
          zIndex: -1,
          backgroundImage: "url('/bg-main.svg')",
          backgroundSize: "cover", // Stretch to fit container dimensions
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
          opacity: 0.33, // Make the background more transparent
          pointerEvents: "none", // Ensures clicks pass through to elements below
        }}
      />

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
          <SidebarNav />
          <SidebarInset className="overflow-y-auto overflow-x-hidden">
            <Header />
            {children}
          </SidebarInset>
        </SidebarProvider>
      </AppRootLayout>
    </>
  );
}
