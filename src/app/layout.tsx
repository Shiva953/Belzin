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
import { Toaster } from "@/components/ui/toaster"

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
        <SolanaProvider session={session}>
          <WalletLoginInterface>
        {children}
        <Toaster />
        </WalletLoginInterface>
        </SolanaProvider>
      </body>
    </html>
  );
}
