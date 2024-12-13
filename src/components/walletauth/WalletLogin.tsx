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
import CreateUserProfile from '../user-profile';

export function WalletLoginInterface({children}: {children: React.ReactNode}){
  const { data: session, status } = useSession();
  const wallet = useWallet();
  const walletModal = useWalletModal()
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [userProfile, setUserProfile] = useState<{
    username: string | null, 
    walletPublicKey: string 
  } | null>(null);
  const [showProfileCreation, setShowProfileCreation] = useState(false);

  const handleSignIn = async () => {

    if (!wallet.connected) {
      walletModal.setVisible(true);
      return;
    }

    if (!wallet.publicKey || !wallet.signMessage || !wallet.signIn) return;

    // Creation of SignInInput to be passed to wallet.signIn
    const input: SolanaSignInInput = {
      domain: window.location.host,
      address: wallet.publicKey?.toBase58() || '',
      statement: 'Sign in to the App',
      nonce: await getCsrfToken(),
    }

    // const data = new TextEncoder().encode(`${input.statement}${input.nonce}`);
    // const signature = await wallet.signMessage(data);
    // const serializedSignature = bs58.encode(signature);
  
    // Actual signature by the user through the wallet
    const output: SolanaSignInOutput = await wallet.signIn(input)

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
      const response = await fetch(`/api/getProfile?pubkey=${publicKey}`);
  
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
  }, [wallet.connected, status]);

  return (
    <>
      {showProfileCreation && (
        <CreateUserProfile pubkey={wallet.publicKey?.toString() || ''} onProfileCreated={handleProfileCreated} />
      )}
      <header>
        <noscript>
          <style>{`.nojs-show { opacity: 1; top: 0; }`}</style>
        </noscript>
        <div className={styles.signedInStatus}>
          <p
            className={`nojs-show ${
              (status === "loading") ? styles.loading : styles.loaded
            }`}
          >
            {!isAuthenticated && (
              <>
                <span className={styles.notSignedInText}>
                  You are not signed in
                </span>
                <span className={styles.buttonPrimary} onClick={handleSignIn}>
                  Sign in
                </span>
              </>
            )}
            {isAuthenticated && userProfile && (
              <>
              <div>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white mr-2">
                    {userProfile.username?.[0]?.toUpperCase() || ''}
                  </div>
                  <span className="mr-4">{userProfile.username}</span>
                  <a
                    href={`/api/auth/signout`}
                    className={styles.button}
                    onClick={(e) => {
                      e.preventDefault();
                      handleSignOut();
                    }}
                  >
                    Sign out
                  </a>
                </div>
                {children}
                </div>
              </>
            )}
          </p>
        </div>
        <nav>
        </nav>
      </header>
    </>
  );
}