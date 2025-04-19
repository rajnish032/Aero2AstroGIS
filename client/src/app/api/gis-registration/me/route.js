import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!API_BASE_URL) {
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      );
    }

    const cookieHeader = request.headers.get("cookie") || "";

    const response = await fetch(`${API_BASE_URL}/api/gisRegistration/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          message: "Backend request failed",
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const setCookies = response.headers.raw()["set-cookie"];
    const headers = new Headers();
    if (setCookies) {
      setCookies.forEach((cookie) =>
        headers.append("Set-Cookie", cookie)
      );
    }

    return new NextResponse(JSON.stringify(data), {
      status: response.status,
      headers,
    });

  } catch (error) {
    console.error("GIS Registration Error:", error);
    return NextResponse.json(
      {
        message: "Internal Server Error",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
