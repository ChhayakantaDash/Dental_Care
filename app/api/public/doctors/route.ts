import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const doctors = await prisma.doctor.findMany({
    where: { user: { isActive: true } },
    include: {
      user: { select: { name: true, email: true } },
      availability: {
        where: { isActive: true },
        orderBy: { dayOfWeek: "asc" },
        select: { dayOfWeek: true, startTime: true, endTime: true },
      },
    },
  });

  return NextResponse.json({ data: doctors });
}
