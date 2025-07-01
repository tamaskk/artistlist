import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Main middleware function
export default async function middleware(req: NextRequest) {
    console.log('🔍 Main middleware triggered for route:', req.nextUrl.pathname);
    
    // Only apply auth check to dashboard routes
    if (req.nextUrl.pathname.startsWith('/dashboard')) {
        console.log('🔒 Dashboard route detected - checking auth...');
        
        // Allow access to login and register pages without authentication
        if (req.nextUrl.pathname === '/dashboard/login' || req.nextUrl.pathname === '/dashboard/register') {
            console.log('🔓 Auth pages - allowing access without auth');
            return NextResponse.next();
        }
        
        // Check for authentication token
        try {
            const token = await getToken({ 
                req, 
                secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development'
            });
            console.log('🔐 Auth check for route:', req.nextUrl.pathname);
            console.log('👤 Token exists:', !!token);
            console.log('🔑 Token details:', token ? { id: token.id, email: token.email } : 'No token');
            
            if (!token) {
                console.log('❌ No token found - redirecting to login');
                // Add a small delay to prevent rapid redirects
                await new Promise(resolve => setTimeout(resolve, 100));
                return NextResponse.redirect(new URL('/dashboard/login', req.url));
            }
            
            console.log('✅ Token found - allowing access');
            return NextResponse.next();
        } catch (error) {
            console.error('🚨 Error checking token:', error);
            // If there's an error checking the token, allow access to prevent infinite loops
            console.log('⚠️ Allowing access due to token check error');
            return NextResponse.next();
        }
    }
    
    // For all other routes, just continue without auth check
    console.log('🌐 Public route - allowing access');
    return NextResponse.next();
}

export const config = {
    matcher: [
        // Match all routes but only apply auth to dashboard routes
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
}; 