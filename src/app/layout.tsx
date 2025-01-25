/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Metadata } from "next";
import { SolanaProvider } from "@/components/ContextProvider";
import { Inter } from "next/font/google"
import localFont from "next/font/local";
import "./globals.css";
import { getServerSession } from "next-auth";
import { authOptions } from "./lib/auth";
import { cn } from "@/lib/utils";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { WalletLoginInterface } from "@/components/auth/WalletLogin";
import { Toaster } from 'sonner'
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import Sidebar from "@/components/sidebar/sidebar";
import WalletLoginWrapper from "@/components/auth/WalletLoginWrapper";

export const metadata: Metadata = {
  title: "Belzin",
  description: "AI-Agent Powered Group Chat P2P Betting",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          "min-h-screen font-sans antialiased bg-gradient-to-b from-background to-background/80",
          GeistSans.className,
        )}
      >
        <div
          className="z--40 absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                     w-[48rem] h-[40rem] rounded-full opacity-50
                     bg-gradient-to-r from-blue-500/50 via-[rgb(111,28,255,0.3)] to-[rgb(1,255,255,0.5)]
                     blur-[220px] items-center my-auto mt-72 ml-32"
        ></div>
        <SolanaProvider session={session}>
          <WalletLoginWrapper>
            {children}
          </WalletLoginWrapper>
        </SolanaProvider>
      </body>
    </html>
  );
}