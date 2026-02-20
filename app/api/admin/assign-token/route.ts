import { NextResponse } from "next/server";
import { assignToken } from "@/lib/actions/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { appointmentId, tokenNumber } = body;
    const result = await assignToken(appointmentId, Number(tokenNumber));
    if ((result as any).error) return NextResponse.json(result, { status: 400 });
    return NextResponse.json(result);
  } catch (err) {
    const message = (err as any)?.message || String(err);
    return NextResponse.json({ error: `Failed to assign token: ${message}` }, { status: 500 });
  }
}
