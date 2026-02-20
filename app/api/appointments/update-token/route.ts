import { NextResponse } from "next/server";
import { updateTokenStatus } from "@/lib/actions/appointments";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { appointmentId, tokenStatus } = body;
    const result = await updateTokenStatus(appointmentId, tokenStatus);
    if ((result as any).error) return NextResponse.json(result, { status: 400 });
    return NextResponse.json(result);
  } catch (err) {
    const message = (err as any)?.message || String(err);
    return NextResponse.json({ error: `Failed to update token status: ${message}` }, { status: 500 });
  }
}
