// middleware.js
import { NextResponse } from "next/server";

const authPaths = ["/account/login", "/account/register"];

export async function middleware(request) {
  try {
    const isAuthenticated = request.cookies.get("accessToken")?.value;
    const path = request.nextUrl.pathname;

    // Allow auth pages during registration flow
    if (authPaths.includes(path)) {
      if (isAuthenticated && path === "/account/register") {
        return NextResponse.redirect(new URL("/account/login", request.url));
      }
      return NextResponse.next();
    }

    // Protect user routes
    if (!isAuthenticated && path.startsWith("/user")) {
      return NextResponse.redirect(new URL("/account/login", request.url));
    }

    // Redirect authenticated users to profile from non-user routes
    if (isAuthenticated && !path.startsWith("/user") && !path.startsWith("/gis-registration")) {
      return NextResponse.redirect(new URL("/user/profile", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.redirect(new URL("/account/login", request.url));
  }
}

export const config = {
  matcher: ["/user/:path*", "/account/login", "/account/register", "/gis-registration"],
};
