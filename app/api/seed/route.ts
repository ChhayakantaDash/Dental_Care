import { createAdminSeed } from "@/lib/actions/admin";
import { NextResponse } from "next/server";

export async function POST() {
  const result = await createAdminSeed();
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({
    message: "Admin seeded successfully",
    credentials: { email: "admin@clinic.com", password: "admin123" },
  });
}
