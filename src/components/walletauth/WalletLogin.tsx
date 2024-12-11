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
import { useEffect, useState } from "react";
import { SignInResponse } from 'next-auth/react';
import { SolanaSignInInput,SolanaSignInOutput } from '@solana/wallet-standard-features';
import { serializeData } from '@/app/lib/utils';
import CreateUserProfile from '../user-profile';

export function WalletLoginInterface(){
  const { status } = useSession();
  const wallet = useWallet();
  const { signMessage } = useWallet()
  const walletModal = useWalletModal()
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [userProfile, setUserProfile] = useState<{
    username: string | null, 
    walletPublicKey: string 
  } | null>(null);
  const [showProfileCreation, setShowProfileCreation] = useState(false);

  // const handleSignIn = async () => {
  //   try {
      // if (!wallet.connected) {
      //   walletModal.setVisible(true);
      //   return;
      // }
  
  //     const csrf = await getCsrfToken();
  //     console.log("CSRF: ", csrf)
      // if (!wallet.publicKey || !csrf || !wallet.signMessage) return;
  
  //     // Construct sign-in message
  //     const message = new SigninMessage({
  //       domain: window.location.host,
  //       publicKey: wallet.publicKey?.toBase58(),
  //       statement: `Sign this message to sign in to the app.`,
  //       nonce: csrf,
  //     });
  //     console.log("SignIn Message: ", message)
  
  //     // Sign and send request
      // const data = new TextEncoder().encode(message.prepare());
      // const signature = await wallet.signMessage(data);
      // const serializedSignature = bs58.encode(signature);
  
  //     console.log("It does reach here")
  //     const result = await signIn("credentials", {
  //       message: JSON.stringify(message),
  //       signature: serializedSignature,
  //       redirect: false,
  //     });

  //     console.log("We get the result")
  
  //     if (result?.error) {
  //       console.error("Sign-in error:", result.error);
  //     }
  //     console.log("Result: ", result)
  //   } catch (error) {
  //     console.error("Sign-in process error:", error);
  //   }
  // }; 
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

  // Simple handler for NextAuth.js signOut()
  const handleSignOut = async () => {
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
        setIsAuthenticated(true);
        await fetchUserProfile();
      }
      if (result?.ok != true) {
        throw new Error("Failed to sign in");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/getProfile');
      const data = await response.json();

      if (data.exists) {
        setUserProfile(data.user);
      } else {
        setShowProfileCreation(true);
      }
    } catch (error) {
      console.error('Failed to fetch user profile', error);
    }
  }

  const handleProfileCreated = () => {
    setShowProfileCreation(false);
    fetchUserProfile();
  }

  useEffect(() => {
    if (wallet.connected && status === "unauthenticated") {
      handleSignIn();
      console.log("Status after signIn: ", status)
    }
    else if(!wallet.connected && status === "authenticated"){
      handleSignOut();
    }
    // console.log(status)
  }, [wallet.connected, status]);

  return (
    <>
      {showProfileCreation && (
        <CreateUserProfile onProfileCreated={handleProfileCreated} />
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
              </>
            )}
          </p>
        </div>
        <nav>
          <ul className={styles.navItems}>
            <li className={styles.navItem}>
              <Link legacyBehavior href="/">
                <a>Home</a>
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link legacyBehavior href="/api/userProfile">
                <a>Protected User Profile Route</a>
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link legacyBehavior href="/me">
                <a>Me</a>
              </Link>
            </li>
          </ul>
        </nav>
      </header>
    </>
  );
}