import { verifySignIn } from "@solana/wallet-standard-util";
import { SolanaSignInOutput, SolanaSignInInput } from "@solana/wallet-standard-features";
import { getCsrfToken } from "next-auth/react";
import { deserializeData } from "./utils";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { cookies } from "next/headers";

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
}