import "next-auth"

declare module "next-auth" {
  interface Session {
    publicKey?: string
  }

  interface User {
    id?: string
    publicKey?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    publicKey?: string
  }
}