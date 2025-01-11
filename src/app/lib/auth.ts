import { verifySignIn } from "@solana/wallet-standard-util";
import { SolanaSignInOutput, SolanaSignInInput } from "@solana/wallet-standard-features";
import { getCsrfToken } from "next-auth/react";
import { deserializeData } from "./utils";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { cookies } from "next/headers";
// import bs58 from 'bs58';

export const providers = [
    CredentialsProvider({
      name: "credentials",
      id: "credentials",
      credentials: {
        output: {
          label: "SigninOutput",
          type: "text"
        },
        input: {
          label: "SigninInput",
          type: "text",
        }
      },
        async authorize(credentials, req) {
          try {
            console.log("CSRF TOKEN FROM COOKIES: ",(await cookies()).get('next-auth.csrf-token'));
            console.log("CSRF TOKEN FROM SERVER: ",(await getCsrfToken({ req: { ...req, body: null } })))
            const csrf = (await cookies()).get('next-auth.csrf-token')?.value.split('|')[0] || (await getCsrfToken({ req: { ...req, body: null } }));
            const { input, output }: {
              input: SolanaSignInInput,
              output: SolanaSignInOutput
            } = await deserializeData(
              credentials?.input || "",
              credentials?.output || "",
              csrf
            );

            console.log("Server - Deserialized Input:", input);
            console.log("Server - Deserialized Output:", output);

            const verificationResult = verifySignIn(input, output);
            console.log("Server - Verification Result:", verificationResult);

            if (!verifySignIn(input, output)) {
              throw new Error("Invalid signature");
            }
            console.log("Successfully Verified")
            return {
              // id: bs58.encode(Buffer.from(output.account.publicKey)),
              name: input.address?.toString()
            };
          } catch (error) {
              console.log(error);
              return null;
          }
      },
    }),
  ];

export const authOptions: NextAuthOptions = {
    providers,
    secret: process.env.NEXTAUTH_SECRET!,
    pages: {
        signIn: "/",
    },
  //   callbacks: {
  //     async jwt({ token, user }) {
  //         // Add publicKey to token if it exists
  //         console.log("User from next-auth: ",user)
  //         if (user?.id) {
  //             token.sub = user.id;
  //         }
  //         console.log("Token from NextAuth: ",token)
  //         return token;
  //     },
  //     async session({ session, token }) {
  //         // Add publicKey to session
  //         console.log("Session Token: ",token)
  //         console.log("Session before token.sub check: ", session)
  //         if (token.sub) {
  //           console.log("Session before public key init: ",session)
  //             session.publicKey = token.sub;
  //             console.log("Session after public key init: ",session)
  //             if (session.user) {
  //                 session.user.name = token.sub;
  //                 console.log("Does username get set in the session: ",session)
  //             }
  //             console.log("Do we get the session up until here: ",session)
  //         }
  //         return session;
  //     }
  // }
}