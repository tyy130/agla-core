import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Auth0Provider from "next-auth/providers/auth0";

const handler = NextAuth({
  providers: [
    // 1. Development Provider (Easy Login)
    CredentialsProvider({
      name: "Development Login",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "admin" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        // Mock authentication - Any non-empty password works for demo
        if (credentials?.username === "admin" && credentials?.password === "admin") {
          return { id: "1", name: "Tyler Hill", email: "tyler@tacticdev.com", role: "admin" };
        }
        return null;
      }
    }),
    // 2. Production Provider (Uncomment when ready)
    /*
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID ?? "",
      clientSecret: process.env.AUTH0_CLIENT_SECRET ?? "",
      issuer: process.env.AUTH0_ISSUER
    }),
    */
  ],
  pages: {
    signIn: '/auth/signin', // We'll rely on default for now, but good to have config ready
  },
  callbacks: {
    async jwt({ token, user }: { token: any, user: any }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: any, token: any }) {
      if (session?.user) {
        session.user.role = token.role;
      }
      return session;
    }
  }
});

export { handler as GET, handler as POST };
