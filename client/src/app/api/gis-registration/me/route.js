import { NextResponse } from "next/server";

const API_BASE_URL = "http://localhost:8000/api/auth";

export async function GET(request) {
  try {
    // 1. Validate environment variable
    const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!API_BASE_URL) {
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      );
    }

    // 2. Forward cookies from the original request
    const cookieHeader = request.headers.get('cookie') || '';

    // 3. Make the API call
    const response = await fetch(`${API_BASE_URL}/api/gisRegistration/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieHeader
      },
      credentials: "include",
    });

    // 4. Handle non-OK responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { 
          message: "Backend request failed",
          details: errorData 
        },
        { status: response.status }
      );
    }

    // 5. Return successful response
    const data = await response.json();
    return NextResponse.json(data, { 
      status: response.status,
      headers: {
        // Forward any set-cookie headers from backend
        'Set-Cookie': response.headers.get('set-cookie') || ''
      }
    });

  } catch (error) {
    console.error("GIS Registration Error:", error);
    return NextResponse.json(
      { 
        message: "Internal Server Error",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined 
      },
      { status: 500 }
    );
  }
}
