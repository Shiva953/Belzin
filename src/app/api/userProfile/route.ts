/* eslint-disable @typescript-eslint/no-unused-vars */
// this is a protected route
// ONLY WHEN USER WALLET IS AUTHENTICATED THIS USER PROFILE ROUTE SHOULD BE CALLED

import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/lib/auth";

// type User = {
//     id: string,
//     walletPublicKey: string,
//     username: string
//     created_at: Date
// }

// const secret = process.env.NEXTAUTH_SECRET!;
// console.log(secret)

// export async function GET(req: NextRequest) {
//     try {
//         // Correctly pass the request to getToken
//         console.log("Auth Headers: ",req.headers.get("authorization"))
//         const token = await getToken({ 
//             req, 
//             secret,
//         });

//         console.log('Extracted Token:', token);

//         // More robust token validation
//         if (!token) {
//             return NextResponse.json({ 
//                 success: false, 
//                 error: 'No authentication token found' 
//             }, { status: 401 }); // Use 401 Unauthorized instead of 500
//         }

//         // If you want to do additional validation
//         // For example, check if the token has a subject (sub)
//         const parsedToken = await getToken({ req, secret });
        
//         console.log('Parsed Token:', parsedToken);

//         if (!parsedToken || !parsedToken.sub) {
//             return NextResponse.json({ 
//                 success: false, 
//                 error: 'Invalid authentication token' 
//             }, { status: 401 });
//         }

//         // All the USER SESSION CHECKING IN DB -> [IF USER EXISTS] db fetching logic
//         return NextResponse.json({
//             success: true,
//             message: "User Wallet Authentication Successful",
//             publicKey: parsedToken.sub
//         }, { status: 200 });

//     } catch (error) {
//         console.error('User Profile Route Error:', error);

//         return NextResponse.json({
//             success: false,
//             error: 'Internal Server Error',
//             details: error instanceof Error ? error.message : 'Unknown error'
//         }, { status: 500 });
//     }
// }

// Ensure this route can be dynamically called
// export const dynamic = 'force-dynamic';


export const GET = async (req: NextApiRequest, res: NextApiResponse) => {

    const session = await getServerSession(authOptions);
    

    return NextResponse.json({ message: 'If you see this, you are authenticated!', session: session }, { status: 200 });
}