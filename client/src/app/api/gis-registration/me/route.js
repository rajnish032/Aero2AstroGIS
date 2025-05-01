import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // 1. Verify environment configuration
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!API_BASE_URL) {
      console.error("API_BASE_URL is not configured");
      return NextResponse.json(
        { success: false, message: "Server configuration error" },
        { status: 500 }
      );
    }

    // 2. Extract and verify cookies
    const cookieHeader = request.headers.get('cookie') || '';
    console.log("Incoming cookies:", cookieHeader); // Debug logging

    if (!cookieHeader.includes('accessToken=')) {
      console.error("No accessToken found in cookies");
      return NextResponse.json(
        { 
          success: false, 
          message: "Authentication required",
          code: "missing_token"
        },
        { status: 401 }
      );
    }

    // 3. Prepare fetch options with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const fetchOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieHeader,
      },
      credentials: "include",
      signal: controller.signal
    };

    // 4. Make the API request
    let response;
    try {
      response = await fetch(`${API_BASE_URL}/api/gis-registration/me`, fetchOptions);
      clearTimeout(timeout);
    } catch (error) {
      console.error("Fetch error:", error);
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { success: false, message: "Request timeout" },
          { status: 504 }
        );
      }
      throw error;
    }

    // 5. Handle 401 Unauthorized (token expired)
    if (response.status === 401) {
      console.log("Attempting token refresh...");
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/api/user/refresh-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cookie": cookieHeader,
          },
          credentials: "include",
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          console.log("Token refresh successful");

          // Retry original request with new cookies
          const newCookies = refreshResponse.headers.get('set-cookie') || '';
          const newResponse = await fetch(`${API_BASE_URL}/api/gis-registration/me`, {
            ...fetchOptions,
            headers: {
              ...fetchOptions.headers,
              "Cookie": newCookies,
            },
          });

          if (!newResponse.ok) throw new Error("Retry failed");

          // Forward new cookies to client
          const headers = new Headers();
          headers.set('Set-Cookie', newCookies);
          
          return new NextResponse(JSON.stringify(await newResponse.json()), {
            status: newResponse.status,
            headers,
          });
        }
      } catch (refreshError) {
        console.error("Refresh failed:", refreshError);
      }
    }

    // 6. Handle other error responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Backend error:", errorData);
      return NextResponse.json(
        {
          success: false,
          message: errorData.message || "Backend request failed",
          code: errorData.code || "backend_error",
        },
        { status: response.status }
      );
    }

    // 7. Successful response
    const data = await response.json();
    const headers = new Headers();
    
    // Forward any set-cookie headers
    const setCookies = response.headers.get('set-cookie');
    if (setCookies) {
      headers.set('Set-Cookie', setCookies);
    }

    return new NextResponse(JSON.stringify(data), {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error("Route handler error:", error);
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