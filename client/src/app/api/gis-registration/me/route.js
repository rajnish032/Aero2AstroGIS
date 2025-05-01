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

    // Extract cookies from the incoming request
    const cookies = request.cookies.getAll().reduce((acc, cookie) => {
      acc[cookie.name] = cookie.value;
      return acc;
    }, {});

    // Forward necessary cookies to the backend
    const cookieString = Object.entries(cookies)
      .map(([name, value]) => `${name}=${value}`)
      .join('; ');

    const response = await fetch(`${API_BASE_URL}/api/gis-registration/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieString,
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        success: false,
        message: "Failed to parse error response"
      }));
      
      return NextResponse.json(
        {
          success: false,
          message: "Backend request failed",
          ...errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Forward set-cookie headers from backend to client
    const headers = new Headers();
    const setCookies = response.headers.getSetCookie();
    if (setCookies && setCookies.length > 0) {
      setCookies.forEach(cookie => {
        headers.append('Set-Cookie', cookie);
      });
    }

    return new NextResponse(JSON.stringify(data), {
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
          stack: error.stack 
        }),
      },
      { status: 500 }
    );
  }
}