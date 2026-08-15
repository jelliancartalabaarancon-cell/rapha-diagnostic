import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { getUserByEmail } from "@/lib/data/users";
import { loginSchema } from "@/lib/validations/auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },

  providers: [
    Credentials({
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        /*
         * Validate login input.
         */
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        /*
         * Find the user.
         */
        const user = await getUserByEmail(email);

        if (!user) {
          return null;
        }

        /*
         * Check whether the account is active.
         *
         * Deactivated accounts are not allowed
         * to log in, even when the password is correct.
         */
        if (!user.isActive) {
          throw new Error(
            "Your account has been deactivated. Please contact an administrator to reactivate your account.",
          );
        }

        /*
         * Check password.
         */
        const passwordsMatch = await bcrypt.compare(
          password,
          user.passwordHash,
        );

        if (!passwordsMatch) {
          return null;
        }

        /*
         * Authentication successful.
         */
        return {
          id: user.id,
          name: user.fullName,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    ...authConfig.callbacks,

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        if (token.id) {
          session.user.id = token.id as string;
        }

        if (token.role) {
          session.user.role = token.role as "PATIENT" | "STAFF" | "ADMIN";
        }
      }

      return session;
    },
  },
});
