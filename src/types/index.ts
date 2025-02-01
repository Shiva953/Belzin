/* eslint-disable @typescript-eslint/no-explicit-any */
import { PublicKey } from '@solana/web3.js';
import { SolanaSignInInput } from "@solana/wallet-standard-features";
import { User } from '@prisma/client';
import { CoreMessage } from "ai";

type DisplayEncoding = 'utf8' | 'hex';

type PhantomEvent = 'connect' | 'disconnect' | 'accountChanged';

type PhantomRequestMethod =
  | 'connect'
  | 'disconnect'
  | 'signMessage'
  | 'signIn';

interface ConnectOpts {
  onlyIfTrusted: boolean;
}

export interface Provider {
  publicKey: PublicKey | null;
  isConnected: boolean | null;
  signMessage: (message: Uint8Array | string, display?: DisplayEncoding) => Promise<Uint8Array>;
  signIn: (signInData: SolanaSignInInput) => Promise<{
    address: PublicKey, signedMessage: Uint8Array, signature: Buffer
  }>;
  connect: (opts?: Partial<ConnectOpts>) => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  on: (event: PhantomEvent, handler: (args: any) => void) => void;
  request: (method: PhantomRequestMethod, params: any) => Promise<unknown>;
}

export type Status = 'success' | 'warning' | 'error' | 'info';

export interface TLog {
  status: Status;
  method?: PhantomRequestMethod | Extract<PhantomEvent, 'accountChanged'>;
  confirmation?: {signature: string, link: string};
  message: string;
  messageTwo?: string;
}

export interface Message{
    id: string | number,
    content: string | null,
    sender: User | null,
    senderId: string | null,
    timestamp: string | null
    isAgent: boolean | null
}

export interface ChatMessage{
    id: string | number,
    content: string | null,
    sender: User | null,
    senderId: string | null,
    chatId: string | null,
    timestamp: string | null,
    isAgent: boolean | null
}

export type UserT = {
  id: string|number,
  username: string,
  walletPublicKey: string
  imageUrl: string
}

export interface UserProfileProps {
  user: UserT
  onSignOut: () => void
}

export type SignMessage = {
  domain: string;
  publicKey: string;
  nonce: string;
  statement: string;
};

export interface ChatState {
  base64Images: string[] | null;
  messages: CoreMessage[];
}

export interface Bet{
  betTitle: string,
  betAmount: number,
  isResolved: boolean,
  side: "YES" | "NO",
  finalOutcome: boolean,
  totalYes: number,
  totalNo: number,
  betResolutionDateInEpochTime: number,
  yesBettors: number,
  noBettors: number,
}

export interface GeneratedImage {
  /**
Image as a base64 encoded string.
   */
  readonly base64: string;
  /**
Image as a Uint8Array.
   */
  readonly uint8Array: Uint8Array;
}