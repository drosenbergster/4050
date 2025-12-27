import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth({
    callbacks: {
        authorized({ req, token }) {
            // Allow dev page without auth in development
            if (process.env.NODE_ENV === 'development' && req.nextUrl.pathname === '/admin/dev') {
                return true;
            }
            // Only allow if token exists
            return !!token;
        },
    },
})

export const config = { matcher: ["/admin/:path*"] }
