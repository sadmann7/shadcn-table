import crypto from "crypto"
import { db } from "@/db"
import { users } from "@/db/schema"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { eq } from "drizzle-orm"
// import { PrismaAdapter } from "@next-auth/prisma-adapter"
// import { render } from "@react-email/render"
import NextAuth, { NextAuthOptions } from "next-auth"
import { encode } from "next-auth/jwt"
import Credentials from "next-auth/providers/credentials"
// import FacebookProvider from "next-auth/providers/facebook";
import EmailProvider from "next-auth/providers/email"
import GoogleProvider from "next-auth/providers/google"

const saltAndHashPassword = (password: string) => {
  return crypto.createHash("sha512").update(password).digest("hex")
}

// find user in drizzle db
const getUserFromDb = async (username: string, pwHash: string) => {
  const user = await db.query.users.findFirst({
    where: eq(users.username, username),
  })

  if (!user) return null

  const { password, ...usr } = user
  if (password !== pwHash) return null

  return usr
}

// import { env } from '@/env.mjs'
// import { resend } from './email'

// import nodemailer from "nodemailer"

// import MagicLinkEmail from "../emails/magic-link-email"

// TODO https://next-auth.js.org/configuration/nextjs#getserversession

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db),
  providers: [
    Credentials({
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials: any) => {
        let user = null

        // logic to salt and hash password
        const pwHash = saltAndHashPassword(credentials.password)
        console.log(999999, credentials)
        // logic to verify if the user exists
        user = await getUserFromDb(credentials.username, pwHash)
        console.log(1111, user)

        if (!user) {
          // No user found, so this is their first attempt to login
          // Optionally, this is also the place you could do a user registration
          throw new Error("Invalid credentials.")
        }

        // return user object with their profile data
        return user
      },
      //   name: "credentials",
      //   credentials: {
      //     username: { label: "Username", type: "text" },
      //     password: { label: "Password", type: "password" },
      //   },
      //   async authorize(credentials) {
      //     if (!credentials) {
      //       return null
      //     }

      //     const user = await db.user.findUnique({
      //       select: {
      //         id: true,
      //         username: true,
      //         password: true,
      //         role: true,
      //         name: true,
      //         // permissions: true,
      //       },
      //       where: {
      //         username: credentials.username,
      //       },
      //     })

      //     if (!user) {
      //       return null
      //     }

      //     const { password, ...usr } = user
      //     const credentialsPassword = crypto
      //       .createHash("sha512")
      //       .update(credentials.password)
      //       .digest("hex")
      //     if (password !== credentialsPassword) {
      //       return null
      //     }
      //     // console.log(333, usr)

      //     return usr
      //   },
    }),
  ],
  // callbacks: {
  //   jwt({ token, user }) {
  //     if (user) {
  //       console.log(22222, user)
  //       // User is available during sign-in
  //       token.id = user.id
  //     }
  //     return token
  //   },
  //   session({ session, token }) {
  //     // @ts-ignore
  //     session.user.id = token.id
  //     return session
  //   },
  // },
  // session: {
  //   strategy: "jwt",
  // },
  // pages: {
  //   signIn: "/login",
  // },
  // callbacks: {
  //   // TODO remove any
  //   async session({ token, session }: any) {
  //     if (token) {
  //       session.user.id = token.id
  //       session.user.name = token.name
  //       session.user.email = token.email
  //       session.user.image = token.picture
  //       session.user.role = token.role
  //       session.user.username = token.username
  //     }

  //     return session
  //   },
  //   async jwt({ token, user }) {
  //     return { ...token, ...user }
  //   },
  // },
  secret: process.env.NEXTAUTH_SECRET as string,
  debug: process.env.NODE_ENV === "development",
}
