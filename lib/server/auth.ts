import { NextAuthOptions, getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  debug: true, // Enable NextAuth debugging
  callbacks: {
    async signIn({ user, account, profile }) {
      // Debug config (safe)
      console.log('🔧 Config Debug:', {
        clientIdLength: process.env.GOOGLE_CLIENT_ID?.length,
        clientIdPrefix: process.env.GOOGLE_CLIENT_ID?.substring(0, 10),
        clientSecretLength: process.env.GOOGLE_CLIENT_SECRET?.length,
        hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      });
      // Only allow specific email addresses to sign in
      const allowedEmails = process.env.ADMIN_ALLOWED_EMAILS?.split(',').map(e => e.trim()) || [];

      if (allowedEmails.length === 0) {
        console.error('⚠️  ADMIN_ALLOWED_EMAILS not configured');
        return false;
      }

      console.log('🔐 Auth Debug:', {
        receivedEmail: user.email,
        allowedEmails: allowedEmails,
        match: allowedEmails.includes(user.email || '')
      });

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




