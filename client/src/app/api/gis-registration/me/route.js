import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!API_BASE_URL) {
      return NextResponse.json(
        { success: false, message: "Server configuration error" },
        { status: 500 }
      );
    }

    // 1. Get cookies from the incoming request more reliably
    const cookieHeader = request.headers.get('cookie') || '';
    
    // 2. Verify we have authentication cookies
    const hasAuthCookies = ['accessToken', 'refreshToken', 'is_auth'].some(cookie => 
      cookieHeader.includes(`${cookie}=`)
    );
    
    if (!hasAuthCookies) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    // 3. Make the request to backend with proper headers
    const response = await fetch(`${API_BASE_URL}/api/gis-registration/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieHeader, // Forward all cookies
      },
      credentials: "include",
    });

    // 4. Handle 401 Unauthorized specifically for token refresh
    if (response.status === 401) {
      // Attempt token refresh here if you have refresh token logic
      // Then retry the original request
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          message: errorData.message || "Backend request failed",
          code: errorData.code || "backend_error",
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // 5. Forward cookies more reliably
    const headers = new Headers();
    const setCookies = response.headers.get('set-cookie');
    if (setCookies) {
      headers.set('Set-Cookie', setCookies);
    }

    return new NextResponse(JSON.stringify({
      success: true,
      data
    }), {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error("GIS Registration Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
        ...(process.env.NODE_ENV === "development" && { 
          error: error.message,
        }),
      },
      { status: 500 }
    );
  }
}