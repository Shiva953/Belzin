/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { getCsrfToken, signIn, signOut, useSession } from "next-auth/react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import React, { useEffect, useState } from "react";
import { SignInResponse } from 'next-auth/react';
import { SolanaSignInInput,SolanaSignInOutput } from '@solana/wallet-standard-features';
import { serializeData } from '@/app/lib/utils';
import CreateUserProfile from '../UserProfile';
import { UserT } from "@/types";
import { WelcomePage } from "../WelcomePage";
import Sidebar from "../chat/sidebar/sidebar";
import { SidebarProvider } from "../ui/sidebar";

export function WalletLoginInterface({
  children
}: {
  children: React.ReactNode
}){
  const { data: session, status } = useSession();
  const wallet = useWallet();
  const walletModal = useWalletModal()
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [userProfile, setUserProfile] = useState<UserT|null>(null);
  const [showProfileCreation, setShowProfileCreation] = useState(false);

  const handleSignIn = async () => {
    if (!wallet.connected) {
      walletModal.setVisible(true);
    }
    
    if(!wallet.publicKey || !wallet.signMessage || !wallet.signIn){
      return;
    }

    const nonce = await getCsrfToken();

    // Creation of SignInInput to be passed to wallet.signIn
    const input: SolanaSignInInput = {
      domain: window.location.host,
      address: wallet.publicKey?.toBase58() || '',
      statement: 'Sign in to the App',
      nonce: nonce,
    }
  
    const output: SolanaSignInOutput = await wallet.signIn!(input)

    // Serialisation of the input and output data
    const { jsonInput, jsonOutput }: { jsonInput: string, jsonOutput: string } = serializeData(input, output);

    // Signing in the user with NextAuth.js signIn()
    await signInWallet(jsonInput, jsonOutput);
  }

  const handleSignOut = async () => {
    wallet.disconnect();
    await signOut({ redirect: false });
    setUserProfile(null);
    setIsAuthenticated(false);
  }

  const signInWallet = async (jsonInput: string, jsonOutput: string) => {
    try {
      const result: SignInResponse | undefined = await signIn('credentials', {
          output: jsonOutput,
          input: jsonInput,
          redirect: false,
      });
      console.log(result)
      if(result?.ok == true){
        setIsAuthenticated(true); //maintaining the state in the frontend using useState instead of useSession
        const publicKey = wallet.publicKey?.toBase58();
        await fetchUserProfile(publicKey || '');
      }
      if (result?.ok != true) {
        throw new Error("Failed to sign in");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const fetchUserProfile = async (publicKey: string) => {
    try {
      const response = await fetch(`/api/getProfile`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            pubkey: publicKey,
            userId: 0
        })
    });
  
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
  
      const data = await response.json();
  
      if (data.exists) {
        setUserProfile(data.user);
      } else {
        setShowProfileCreation(true);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('401')) {
        handleSignOut();
      }
    }
  }

  const handleProfileCreated = () => {
    setShowProfileCreation(false);
    fetchUserProfile(wallet.publicKey?.toBase58() || '');
  }

  const buttonText:string = wallet.publicKey ? "Sign In With Solana" : "Connect Wallet";

  return (
    <>
      <div className="h-screen flex flex-col">
        {showProfileCreation && !userProfile && (
          <CreateUserProfile 
            pubkey={wallet.publicKey?.toString() || ''} 
            onProfileCreated={handleProfileCreated} 
          />
        )}
        <header className="fixed flex-shrink-0 top-0 left-0 right-0 rounded-full bg-transparent mx-auto p-4 shadow-sm z-40">
          <div className="container mx-auto h-full flex justify-center items-center">
            {isAuthenticated && userProfile ? (
                <></>
            ) : (
              <div key={"outerdivX"}>
                <WelcomePage handleSignIn={handleSignIn} buttonText={buttonText}/>
              </div>
            )}
          </div>
        </header>

        {isAuthenticated && userProfile && (
          <main className="flex flex-1 overflow-hidden">
             <SidebarProvider>
            <Sidebar 
          userProfile={userProfile} 
          onSignOut={handleSignOut}
        />
            {children}
            </SidebarProvider>
          </main>
        )}
      </div>
    </>
  );
}