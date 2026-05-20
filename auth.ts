import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [Google],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ request, auth }) {
      if (
        request.nextUrl.pathname.startsWith("/keys") ||
        request.nextUrl.pathname.startsWith("/playground")
      ) {
        return Boolean(auth?.user?.id);
      }
      return true;
    },
    jwt({ token, account }) {
      // Keep a stable Google user id across sign-in / refresh (used as api_keys.user_id).
      if (account?.providerAccountId) {
        token.sub = account.providerAccountId;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
