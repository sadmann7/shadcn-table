import crypto from "crypto"
import { db } from "@/db"
import { users } from "@/db/schema"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { eq } from "drizzle-orm"
import NextAuth, { type DefaultSession } from "next-auth"
import Credentials from "next-auth/providers/credentials"

// declare module "next-auth" {
//   /**
//    * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
//    */
//   interface Session {
//     user: {
//       /** The user's postal address. */
//       username: string
//       /**
//        * By default, TypeScript merges new interface properties and overwrites existing ones.
//        * In this case, the default session user properties will be overwritten,
//        * with the new ones defined above. To keep the default session user properties,
//        * you need to add them back into the newly declared interface.
//        */
//     } & DefaultSession["user"]
//   }
// }

// import { render } from "@react-email/render"
// import { PrismaAdapter } from "@next-auth/prisma-adapter"
// import { encode } from "next-auth/jwt";

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

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    Credentials({
      credentials: {
        username: {},
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
    }),
  ],
  callbacks: {
    session({ session, token, user }) {
      // `session.user.address` is now a valid property, and will be type-checked
      // in places like `useSession().data.user` or `auth().user`
      return {
        ...session,
        user: {
          ...session.user,
          // address: user.address,
        },
      }
    },
  },
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
  // secret: process.env.NEXTAUTH_SECRET as string,
  // debug: process.env.NODE_ENV === "development",
})
