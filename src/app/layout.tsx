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
          <div className="z--20 absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] my-auto"></div>
          <div 
        className="z--10 absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                    w-96 h-72 rounded-full 
                    bg-gradient-to-r from-green-300/50 via-cyan-400/40 to-green-300/30 
                    blur-[110px] items-center my-auto"
      ></div>
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
