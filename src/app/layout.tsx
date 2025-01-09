/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Metadata } from "next";
import { SolanaProvider } from "@/components/ContextProvider";
import { Inter } from "next/font/google"
import localFont from "next/font/local";
import "./globals.css";
import { getServerSession } from "next-auth";
import { getSession } from "next-auth/react";
import { authOptions } from "./lib/auth";
import { cn } from "@/lib/utils";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { WalletLoginInterface } from "@/components/walletauth/WalletLogin";
import { Toaster } from 'sonner'
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = {
  title: "Group Chat Betting using Blinks",
  description: "Bet without leaving the chat, using solana blinks!",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const session = await getServerSession(authOptions);
  return (
    <html lang="en" className="dark">
      <body className={cn(
          "min-h-screen font-sans antialiased",
          GeistSans.className
        )}>
          <div 
        className="z--40 absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                    w-[48rem] h-[40rem] rounded-full 
                    bg-gradient-to-r from-blue-300/50 via-cyan-400/30 to-green-300/30 
                    blur-[220px] items-center my-auto mt-72 ml-32"
      ></div>
    <SolanaProvider session={session}>
      <WalletLoginInterface>
      <SidebarProvider>
        <AppSidebar/>
        <main>
          <SidebarTrigger />
          {children}
        </main>
        <Toaster />
        </SidebarProvider>
        </WalletLoginInterface>
        </SolanaProvider>
      </body>
    </html>
  );
}
