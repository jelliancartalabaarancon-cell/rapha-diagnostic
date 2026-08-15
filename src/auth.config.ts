import type { NextAuthConfig } from "next-auth";

// Edge-safe Auth.js configuration.
// The Credentials provider and bcrypt are added separately in src/auth.ts.
export const authConfig = {
  pages: {
    signIn: "/login",
  },

  providers: [],

  callbacks: {
    authorized({ auth }) {
      return Boolean(auth?.user);
    },
  },
} satisfies NextAuthConfig;
