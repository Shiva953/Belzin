'use client';

import { WalletLoginInterface } from "./WalletLogin";
import { Toaster } from 'sonner';
import { ReactNode } from 'react';

export default function WalletLoginWrapper({ 
  children 
}: { 
  children: ReactNode 
}) {
  return (
    <WalletLoginInterface>
        <div className="flex h-screen">
          {/* <Sidebar /> */}
          <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
        </div>
        <Toaster position="top-center" />
    </WalletLoginInterface>
  );
}