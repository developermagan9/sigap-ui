import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { role } = await request.json();
    
    // We don't invalidate the JWT, we just change the UI role cookie
    // Since ITSUP is technically an admin in the database, they have access to all endpoints anyway
    const response = NextResponse.json({ success: true, role });

    response.cookies.set("sigap_role", role, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
