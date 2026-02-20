import { NextRequest, NextResponse } from "next/server";
import { verifyPayment } from "@/lib/actions/payments";

export async function POST(req: NextRequest) {
  try {
    const { paymentId, action, reason } = await req.json();
    if (!paymentId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const result = await verifyPayment(paymentId, action, reason);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Verify payment error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
