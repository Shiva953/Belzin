import { verifySignIn } from "@solana/wallet-standard-util";
import { SolanaSignInOutput, SolanaSignInInput } from "@solana/wallet-standard-features";
import { getCsrfToken } from "next-auth/react";
import { deserializeData } from "./utils";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bs58 from 'bs58';

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

            const { input, output }: {
              input: SolanaSignInInput,
              output: SolanaSignInOutput
            } = await deserializeData(
              credentials?.input || "",
              credentials?.output || "",
              await getCsrfToken({ req: { ...req, body: null } })
            );

            if (!verifySignIn(input, output)) {
              throw new Error("Invalid signature");
            }

            return {
              id: bs58.encode(Buffer.from(output.account.publicKey)),
            };
          } catch (error) {
              console.log(error);
              return null;
          }
      },
    }),
  ];

export const authOptions: NextAuthOptions = {
    session: {                                                                                                                                        
        strategy: "jwt",
    },
    providers,
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/",
    },
    callbacks: {
        async session({ session, token }) {
        // @ts-ignore
        session.publicKey = token.sub;
        if (session.user) {
            session.user.name = token.sub;
        }
        return session;
        }
    }
}