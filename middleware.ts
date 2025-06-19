import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        console.log('🔍 Middleware triggered for route:', req.nextUrl.pathname);
        console.log('📍 Full URL:', req.nextUrl.href);
        
        // Only apply auth check to dashboard routes
        if (req.nextUrl.pathname.startsWith('/dashboard')) {
            console.log('🔒 Dashboard route detected - checking auth...');
            // Add custom middleware logic here if needed
            return NextResponse.next();
        }
        // For non-dashboard routes, just continue without auth check
        console.log('🌐 Public route - allowing access');
        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                console.log('🔐 Auth check for route:', req.nextUrl.pathname);
                console.log('👤 Token exists:', !!token);
                
                // Only require auth for dashboard routes
                if (req.nextUrl.pathname.startsWith('/dashboard')) {
                    const isAuthorized = !!token;
                    console.log('🔒 Dashboard route - Auth required:', isAuthorized);
                    return isAuthorized;
                }
                // Allow all other routes
                console.log('🌐 Public route - Auth not required');
                return true;
            },
        },
        pages: {
            signIn: "/dashboard/login",
        },
    }
);

export const config = {
    matcher: [
        // Match all routes but only apply auth to dashboard routes
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
}; 