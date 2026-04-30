import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Redirect to dashboard after sign in
      if (url.startsWith(baseUrl)) return url;
      // Redirect to dashboard for relative URLs
      return baseUrl + '/dashboard';
    },
  },
  pages: {
    signIn: '/login',
  },
});

export { handler as GET, handler as POST };
