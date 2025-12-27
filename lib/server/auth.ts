import { NextAuthOptions, getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

const isDev = process.env.NODE_ENV === 'development';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    // DEV ONLY: Quick login bypass for testing
    ...(isDev ? [
      CredentialsProvider({
        id: 'dev-login',
        name: 'Dev Login',
        credentials: {
          email: { label: "Email", type: "text" }
        },
        async authorize(credentials) {
          // Only allow in development!
          if (process.env.NODE_ENV !== 'development') {
            return null;
          }
          return {
            id: 'dev-user',
            email: credentials?.email || 'dev@localhost',
            name: 'Dev User',
          };
        }
      })
    ] : []),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Skip email check for dev login in development
      if (isDev && account?.provider === 'dev-login') {
        return true;
      }
      
      // Only allow specific email addresses to sign in
      const allowedEmails = process.env.ADMIN_ALLOWED_EMAILS?.split(',').map(e => e.trim()) || [];

      if (allowedEmails.length === 0) {
        console.error('⚠️  ADMIN_ALLOWED_EMAILS not configured');
        return false;
      }

      const isAllowed = allowedEmails.includes(user.email || '');

      if (!isAllowed) {
        console.warn(`🚫 Unauthorized access attempt: ${user.email}`);
      }

      return isAllowed;
    },
    async session({ session }) {
      return session;
    },
    async jwt({ token }) {
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

/**
 * Helper function to get the server session in API routes
 * Returns null if user is not authenticated
 */
export async function getAuthSession() {
  return await getServerSession(authOptions);
}













