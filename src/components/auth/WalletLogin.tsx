/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { getCsrfToken, signIn, signOut, useSession } from "next-auth/react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import React, { useEffect, useState } from "react";
import { SignInResponse } from 'next-auth/react';
import { SolanaSignInInput,SolanaSignInOutput } from '@solana/wallet-standard-features';
import { serializeData } from '@/app/lib/utils';
import CreateUserProfile, { UserProfile } from '../UserProfile';
import { UserT } from "@/types";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { WelcomePage } from "../WelcomePage";

export function WalletLoginInterface({children}: {children: React.ReactNode}){
  const { data: session, status } = useSession();
  const wallet = useWallet();
  const walletModal = useWalletModal()
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [userProfile, setUserProfile] = useState<UserT|null>(null);
  const [showProfileCreation, setShowProfileCreation] = useState(false);

  const handleSignIn = async () => {
    if (!wallet.connected) {
      walletModal.setVisible(true);
      return;
    }

    if (!wallet.publicKey || !wallet.signMessage || !wallet.signIn) return;

    const nonce = await getCsrfToken();
    console.log("CSRF Token from frontend: ",nonce)

    // Creation of SignInInput to be passed to wallet.signIn
    const input: SolanaSignInInput = {
      domain: window.location.host,
      address: wallet.publicKey?.toBase58() || '',
      statement: 'Sign in to the App',
      nonce: nonce,
    }
  
    // Actual signature by the user through the wallet
    console.log("Client - Original Input:", input);
    const output: SolanaSignInOutput = await wallet.signIn(input)
    console.log("Client - Original Output:", output);

    // Serialisation of the input and output data
    const { jsonInput, jsonOutput }: { jsonInput: string, jsonOutput: string } = serializeData(input, output);
    console.log("Client - Serialized Input:", jsonInput);
    console.log("Client - Serialized Output:", jsonOutput);

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
        console.log("Session when I get apt result: ",session)
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
      console.error('Failed to fetch user profile', error);
      if (error instanceof Error && error.message.includes('401')) {
        handleSignOut();
      }
    }
  }

  const handleProfileCreated = () => {
    setShowProfileCreation(false);
    fetchUserProfile(wallet.publicKey?.toBase58() || '');
  }

  useEffect(() => {
    const handleAuth = async () => {
      if (wallet.connected && status === "unauthenticated") {
        try {
          await handleSignIn();
        } catch (error) {
          console.error("Sign-in failed", error);
        }
      } else if (!wallet.connected && status === "authenticated") {
        try {
          await handleSignOut();
        } catch (error) {
          console.error("Sign-out failed", error);
        }
      }
    };
  
    handleAuth();
  }, [wallet.connected]);

  return (
    <>
      <div className="h-screen flex flex-col">
          {showProfileCreation && (
            <CreateUserProfile 
              pubkey={wallet.publicKey?.toString() || ''} 
              onProfileCreated={handleProfileCreated} 
            />
          )}
          <header className="fixed flex-shrink-0 top-0 left-0 right-0 rounded-full bg-transparent mx-auto p-4 shadow-sm z-40">
            <div className="container mx-auto h-full flex justify-center items-center">
              {isAuthenticated && userProfile ? (
                <HoverBorderGradient 
                  containerClassName="rounded-full"
                  className="bg-[rgb(18,17,20)] flex items-center gap-4"
                >
                  <div className="flex items-center gap-4">
                    <UserProfile user={userProfile} onSignOut={handleSignOut} />
                    <button
                      onClick={handleSignOut}
                      className="px-3 font-bold tracking-tight rounded-full text-white py-2 bg-[rgb(241,17,73)] hover:bg-opacity-50 hover:text-opacity-70 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                </HoverBorderGradient>
              ) : (
                <div key={"outerdivX"}>
                  <WelcomePage handleSignIn={handleSignIn}/>
            </div>
              )}
            </div>
          </header>

        {isAuthenticated && userProfile && (
          <main className="flex flex-1 overflow-hidden">
            {children}
          </main>
        )}
      </div>
    </>
  );
}