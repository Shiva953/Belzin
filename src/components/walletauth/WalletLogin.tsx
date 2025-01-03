// wallet auth(signing in with wallet + adding user to db + persisting user session)
//1. ONCLICK WALLET SIGN IN BUTTON -> SIGN IN -> IF USER EXISTS IN DB FETCH USER PROFILE, ELSE PROMPT USER TO CREATE PROFILE -> ADD USER IN DB -> FETCH USER
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { verifySignIn } from '@solana/wallet-standard-util';
import Link from "next/link";
import { getCsrfToken, signIn, signOut, useSession } from "next-auth/react";
import styles from "./header.module.css";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { SigninMessage } from "@/app/lib/signMessage";
import bs58 from "bs58";
import React, { useEffect, useState } from "react";
import { SignInResponse } from 'next-auth/react';
import { SolanaSignInInput,SolanaSignInOutput } from '@solana/wallet-standard-features';
import { serializeData } from '@/app/lib/utils';
import CreateUserProfile, { UserProfile } from '../user-profile';
import { UserT } from '../user-profile';

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
    

    // const data = new TextEncoder().encode(`${input.statement}${input.nonce}`);
    // const signature = await wallet.signMessage(data);
    // const serializedSignature = bs58.encode(signature);
  
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
        setIsAuthenticated(true);
        const publicKey = wallet.publicKey?.toBase58(); // Get the public key from the wallet
        await fetchUserProfile(publicKey || ''); // Pass the public key to fetch user profile
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
      // const response = await fetch(`/api/getProfile`, {
      //   body: JSON.stringify({
      //     pubkey: publicKey,
      //     userId: ''
      //   })
      // });
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
      <div className="min-h-screen flex flex-col">
          {showProfileCreation && (
            <CreateUserProfile 
              pubkey={wallet.publicKey?.toString() || ''} 
              onProfileCreated={handleProfileCreated} 
            />
          )}

            <header className="fixed top-0 left-0 right-0 h-16 p-4 bg-background shadow-sm z-20">
              <div className="container mx-auto flex justify-between items-center h-full">
              {isAuthenticated && userProfile && (
                <UserProfile user={userProfile} onSignOut={handleSignOut}/>
              )}

              {!isAuthenticated && (
                <div className="flex flex-col items-center space-x-4 mx-auto">
                  <span className="text-muted-foreground m-4 pt-16">
                    You are not signed in
                  </span>
                  <button 
                    onClick={handleSignIn} 
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Sign in
                  </button>
                </div>
              )}

              {isAuthenticated && userProfile && (
                <button
                  onClick={handleSignOut}
                  className="px-3 font-medium py-2 bg-[rgb(46,10,23)] text-[rgb(236,72,153)] hover:text-opacity-70 rounded-md transition-colors"
                >
                  Sign out
                </button>
              )}
            </div>
          </header>

        {isAuthenticated && userProfile && (
          <main className="flex flex-1 pt-16">
            {children}
          </main>
        )}
      </div>
    </>
  );
}