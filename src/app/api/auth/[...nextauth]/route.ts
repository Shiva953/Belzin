/* eslint-disable @typescript-eslint/no-unused-vars */
// import { NextApiRequest, NextApiResponse } from "next";
// import NextAuth from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { getCsrfToken } from "next-auth/react";
// import { SigninMessage } from "@/app/lib/signMessage";

// 2. ADD USER PROFILE CREATION(FOR FIRST TIME SIGN-IN) + USER PROFILE FETCH(IF USER ALREADY EXISTS IN DB), INTEGRATE PRISMA
// 3. ADD USER PROFILE COMPONENT(CreateUser + UserProfile)

// export default async function auth(req: NextApiRequest, res: NextApiResponse) {
//   const providers = [
//     CredentialsProvider({
//       name: "Solana",
//       credentials: {
//         message: {
//           label: "Message",
//           type: "text",
//         },
//         signature: {
//           label: "Signature",
//           type: "text",
//         },
//       },
//       async authorize(credentials, req) {
//         try {
//           const signinMessage = new SigninMessage(
//             JSON.parse(credentials?.message || "{}")
//           );
//           const nextAuthUrl = new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000');
//           if (signinMessage.domain !== nextAuthUrl.host) {
//             return null;
//           }

//           const csrfToken = await getCsrfToken({ req: { ...req, body: null } });

//           if (signinMessage.nonce !== csrfToken) {
//             return null;
//           }

//           const validationResult = await signinMessage.validate(
//             credentials?.signature || ""
//           );

//           if (!validationResult)
//             throw new Error("Could not validate the signed message");

//           return {
//             id: signinMessage.publicKey,
//           };
//         } catch (e) {
//           return null;
//         }
//       },
//     }),
//   ];

//   const isDefaultSigninPage =
//     req.method === "GET" && req.query.nextauth?.includes("signin");

//   // Hides Sign-In with Solana from the default sign page
//   if (isDefaultSigninPage) {
//     providers.pop();
//   }

//   return await NextAuth(req, res, {
//     providers,
//     session: {
//       strategy: "jwt",
//     },
//     secret: process.env.NEXTAUTH_SECRET,
//     callbacks: {
//       async session({ session, token }) {
//         // @ts-ignore
//         session.publicKey = token.sub;
//         if (session.user) {
//           session.user.name = token.sub;
//           session.user.image = `https://ui-avatars.com/api/?name=${token.sub}&background=random`;
//         }
//         return session;
//       },
//     },
//   });
// }
// import NextAuth from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { NextAuthOptions } from "next-auth";
// import { SigninMessage } from "@/app/lib/signMessage";

// export const authOptions: NextAuthOptions = {
//   providers: [
//     CredentialsProvider({
//       name: "Solana",
//       credentials: {
//         message: { label: "Message", type: "text" },
//         signature: { label: "Signature", type: "text" },
//       },
//       async authorize(credentials) {
//         try {
//           const signinMessage = new SigninMessage(
//             JSON.parse(credentials?.message || "{}")
//           );
//           const nextAuthUrl = new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000');
          
//           if (signinMessage.domain !== nextAuthUrl.host) {
//             return null;
//           }

//           const validationResult = await signinMessage.validate(
//             credentials?.signature || ""
//           );
          
//           if (!validationResult)
//             throw new Error("Could not validate the signed message");

//           return {
//             id: signinMessage.publicKey,
//           };
//         } catch (e) {
//           return null;
//         }
//       },
//     }),
//   ],
//   session: {
//     strategy: "jwt",
//   },
//   secret: process.env.NEXTAUTH_SECRET,
//   callbacks: {
//     async jwt({ token, user }) {
//       // If user is available during sign-in, add the public key
//       if (user) {
//         token.sub = user.id; // Ensure the sub claim is set to the public key
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       // Ensure the session includes the public key
//       console.log(token)
//       if (session.user) {
//         session.user.email = "s@gmail.com"
//         session.user.name = token.sub;
//         session.user.image = `https://ui-avatars.com/api/?name=${token.sub}&background=random`;
//       }
//       return session;
//     },
//   },
// };

// const handler = NextAuth(authOptions);

// export { handler as GET, handler as POST };

import { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { getCsrfToken } from "next-auth/react";
import { SigninMessage } from "@/app/lib/signMessage";
import { NextRequest } from "next/server";
import { verifySignIn } from "@solana/wallet-standard-util";
import { SolanaSignInOutput, SolanaSignInInput } from "@solana/wallet-standard-features";
import bs58 from 'bs58';
import { deserializeData } from "@/app/lib/utils";
import { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "@/app/lib/auth";

// export const authOptions: NextAuthOptions = {
//   providers: [
//     CredentialsProvider({
//       name: "Solana",
//       credentials: {
//         message: {
//           label: "Message",
//           type: "text",
//         },
//         signature: {
//           label: "Signature",
//           type: "text",
//         },
//       },
//       async authorize(credentials, req) {
//         try {
//           const signinMessage = new SigninMessage(
//             JSON.parse(credentials?.message || "{}")
//           );
//           const nextAuthUrl = new URL(process.env.NEXTAUTH_URL);
//           if (signinMessage.domain !== nextAuthUrl.host) {
//             return null;
//           }

//           const csrfToken = await getCsrfToken({ req });

//           if (signinMessage.nonce !== csrfToken) {
//             return null;
//           }

//           const validationResult = await signinMessage.validate(
//             credentials?.signature || ""
//           );

//           if (!validationResult) {
//             throw new Error("Could not validate the signed message");
//           }

//           return {
//             id: signinMessage.publicKey,
//           };
//         } catch (e) {
//           console.error(e); // Log error for debugging
//           return null;
//         }
//       },
//     }),
//   ],
//   session: {
//     strategy: "jwt",
//   },
//   secret: process.env.NEXTAUTH_SECRET,
//   callbacks: {
//     async session({ session, token }) {
//       session.publicKey = token.sub; // Ensure 'sub' is available in the token
//       if (session.user) {
//         session.user.name = token.sub;
//         session.user.image = `https://ui-avatars.com/api/?name=${token.sub}&background=random`;
//       }
//       return session;
//     },
//   },
// };

// // Default export for the API route
// export default async function auth(req: Request, res: Response) {
//   // Hides Sign-In with Solana from the default sign page
//   const isDefaultSigninPage =
//     req.method === "GET" && req.query.nextauth?.includes("signin");

//   if (isDefaultSigninPage) {
//     authOptions.providers.pop(); // Remove Solana provider for default sign-in page
//   }

//   return await NextAuth(req, res, authOptions);
// }

// const providers = [
//     CredentialsProvider({
//       name: "credentials",
//       id: "credentials",
//       credentials: {
//         output: {
//           label: "SigninOutput",
//           type: "text"
//         },
//         input: {
//           label: "SigninInput",
//           type: "text",
//         }
//       },
//         async authorize(credentials, req) {
//           try {

//             const { input, output }: {
//               input: SolanaSignInInput,
//               output: SolanaSignInOutput
//             } = await deserializeData(
//               credentials?.input || "",
//               credentials?.output || "",
//               await getCsrfToken({ req: { ...req, body: null } })
//             );

//             if (!verifySignIn(input, output)) {
//               throw new Error("Invalid signature");
//             }

//             return {
//               id: bs58.encode(Buffer.from(output.account.publicKey)),
//             };
//           } catch (error) {
//               console.log(error);
//               return null;
//           }
//       },
//     }),
//   ];

//   export const authOptions: NextAuthOptions = {
//     session: {                                                                                                                                        
//         strategy: "jwt",
//     },
//     providers,
//     secret: process.env.NEXTAUTH_SECRET,
//     pages: {
//         signIn: "/",
//     },
//     callbacks: {
//         async session({ session, token }) {
//         session.publicKey = token.sub;
//         if (session.user) {
//             session.user.name = token.sub;
//         }
//         return session;
//         }
//     }
// }

  async function handler(req: NextApiRequest, res: NextApiResponse) {
    return await NextAuth(req, res, authOptions);
  }
  
  export { handler as GET, handler as POST };