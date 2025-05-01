// app/api/gisregistration/route.js
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // 1. Debug logging
    console.log('Incoming request headers:', Object.fromEntries(request.headers.entries()));
    
    // 2. Get cookies
    const cookieHeader = request.headers.get('cookie') || '';
    console.log('Cookies received:', cookieHeader);

    if (!cookieHeader.includes('accessToken=')) {
      console.error('Missing accessToken cookie');
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    // 3. Prepare fetch options
    const fetchOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieHeader,
      },
      credentials: "include",
      cache: "no-store"
    };

    // 4. Make request to backend
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/gis-registration/me`,
      fetchOptions
    );

    // 5. Handle response
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Backend error:', errorData);
      return NextResponse.json(
        {
          success: false,
          message: errorData.message || "Authentication failed",
          errorCode: errorData.errorCode
        },
        { status: response.status }
      );
    }

    // 6. Forward response
    const data = await response.json();
    const headers = new Headers();
    
    // Forward set-cookie headers if present
    const setCookies = response.headers.get('set-cookie');
    if (setCookies) {
      headers.set('Set-Cookie', setCookies);
    }

    return NextResponse.json(data, { status: 200, headers });

  } catch (error) {
    console.error('Route handler error:', error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        ...(process.env.NODE_ENV === "development" && { error: error.message })
      },
      { status: 500 }
    );
  }
}