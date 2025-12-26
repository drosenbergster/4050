import { withAuth } from "next-auth/middleware"

export default withAuth({
    callbacks: {
        authorized({ req, token }) {
            // Only allow if token exists
            return !!token;
        },
    },
})

export const config = { matcher: ["/admin/:path*"] }
