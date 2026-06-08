import { NextResponse } from "next/server";

function adminPassword() {
  return process.env.ADMIN_PASSWORD || "28122288";
}

export async function POST(request: Request) {
  const { password } = await request.json();
  if (password !== adminPassword()) {
    return NextResponse.json({ ok: false, message: "密碼不正確" }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
