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
      if (request.nextUrl.pathname.startsWith("/keys")) {
        return !!auth?.user;
      }
      return true;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
      }
      return session;
    },
  },
});
