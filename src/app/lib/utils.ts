/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { SolanaSignInInput, SolanaSignInOutput } from '@solana/wallet-standard-features';
import { WalletAccount } from '@wallet-standard/base';
import { GeneratedImage } from '@/types';
import { format } from "date-fns";

export type SerialisableWalletAccount = {
  address: string;
  chains: string[];
  features: string[];
  icon: string | undefined;
  label: string | undefined;
  publicKey: Uint8Array;
  publicKeyLength: number;
}

function walletAccountToSerializableObject(walletAccount: WalletAccount): SerialisableWalletAccount {
  return {
    address: walletAccount.address,
    chains: [...walletAccount.chains],
    features: [...walletAccount.features],
    icon: walletAccount.icon,
    label: walletAccount.label,
    publicKey: Buffer.from(walletAccount.publicKey),
    publicKeyLength: walletAccount.publicKey.length,
  }
}

// export function serializeData(input: SolanaSignInInput, output: SolanaSignInOutput): {
//     jsonInput: any,
//     jsonOutput: any
// } {
//     const account: SerialisableWalletAccount = walletAccountToSerializableObject(output.account);
//     const jsonOutput: string = JSON.stringify({...output, account});
//     const jsonInput: string = JSON.stringify(input);

//     return { jsonInput, jsonOutput }
// }

// export async function deserializeData(jsonInput: string, jsonOutput: string, csrfToken: string | undefined) {
//     const parsedInput: SolanaSignInInput = await JSON.parse(jsonInput);
//     const input: SolanaSignInInput = {...parsedInput, nonce: csrfToken};

//     const parsedOutput: any = await JSON.parse(jsonOutput);

//     // Deserialization of the WalletAccount Object
//     const account = {...parsedOutput.account, publicKey: new Uint8Array(parsedOutput.account.publicKeyLength)};
//     for (let i = 0; i < parsedOutput.account.publicKeyLength; i++) {
//       account.publicKey[i] = parsedOutput.account.publicKey[i];
//     }
//     delete parsedOutput.account.publicKeyLength;

//     // Final Output Object
//     const output: SolanaSignInOutput = {
//       account: account,
//       signedMessage: new Uint8Array(parsedOutput.signedMessage.data),
//       signature: new Uint8Array(parsedOutput.signature.data),
//     };

//     return { input, output };
// }

export function serializeData(input: SolanaSignInInput, output: SolanaSignInOutput): {
  jsonInput: string,
  jsonOutput: string
} {
  // Convert account's publicKey to array
  const account = {
      ...output.account,
      publicKey: Array.from(output.account.publicKey),
      publicKeyLength: output.account.publicKey.length
  };

  // Convert other Uint8Arrays to arrays
  const jsonOutput = JSON.stringify({
      account,
      signedMessage: Array.from(output.signedMessage),
      signature: Array.from(output.signature)
  });

  const jsonInput = JSON.stringify(input);
  return { jsonInput, jsonOutput };
}

export async function deserializeData(jsonInput: string, jsonOutput: string, csrfToken: string | undefined) {
  const parsedInput: SolanaSignInInput = JSON.parse(jsonInput);
  const input: SolanaSignInInput = {...parsedInput, nonce: csrfToken};

  const parsedOutput = JSON.parse(jsonOutput);

  // Reconstruct the account with proper Uint8Array
  const account = {
      ...parsedOutput.account,
      publicKey: new Uint8Array(parsedOutput.account.publicKey)
  };

  // Final Output Object with proper Uint8Arrays
  const output: SolanaSignInOutput = {
      account,
      signedMessage: new Uint8Array(parsedOutput.signedMessage),
      signature: new Uint8Array(parsedOutput.signature)
  };

  return { input, output };
}

export async function fetchProfile(pubkey: string, userId: number) {
  const res = await fetch(`/api/getProfile`, {
      method: 'POST',
      body: JSON.stringify({ pubkey, userId }),
      headers: { 'Content-Type': 'application/json' }
  });
  return await res.json();
}

export function chatHrefConstructor(id1: string, id2: string) {
  const sortedIds = [id1, id2].sort()
  return `${sortedIds[0]}-${sortedIds[1]}`
}

export function shortenPublicKey(key: string) {
  if (!key) return '';
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

export function epochToDateString(epochTimestamp: number): string {
  const date = new Date(epochTimestamp * 1000);
  
  const day = date.getDate();
  const ordinal = getOrdinalSuffix(day);
  
  return `${day}${ordinal} ${date.toLocaleString('default', { month: 'long' })}, ${date.getFullYear()}`;
}

export function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
  }
}

export function dateStringToEpoch(dateStr: string): number {
  const cleanDateStr = dateStr.replace(/(st|nd|rd|th)/, '');
  const date = new Date(cleanDateStr);
  const epochTimestamp = Math.floor(date.getTime() / 1000);
  
  return epochTimestamp;
}

export const formatTimestamp = (timestamp: number) => {
  return format(timestamp, 'HH:mm')
}

export async function uploadImage(file: File): Promise<string> {
  const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
  
  const formData = new FormData();
  formData.append('image', file);
  
  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to upload image');
    }
    
    return data.data.url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
}

export async function uploadGeneratedImage(generatedImage: GeneratedImage): Promise<string> {
  const IMGBB_API_KEY = process.env.IMGBB_API_KEY;
  
  try {

    const formData = new FormData();
    formData.append('image', generatedImage.base64);

    const uploadResponse = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData,
    });
    
    const data = await uploadResponse.json();
    
    if (!uploadResponse.ok) {
      throw new Error(data.error?.message || 'Failed to upload image');
    }
    
    return data.data.url;
  } catch (error) {
    console.error('Error uploading generated image:', error);
    throw new Error('Failed to upload generated image');
  }
}