"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";

export async function submitPayment(formData: FormData) {
  const user = await requireAuth(["PATIENT"]);

  const appointmentId = formData.get("appointmentId") as string;
  const utrNumber = formData.get("utrNumber") as string;
  const screenshot = formData.get("screenshot") as File;

  if (!appointmentId || !utrNumber) {
    return { error: "Missing required fields" };
  }

  if (utrNumber.length < 6) {
    return { error: "UTR number must be at least 6 characters" };
  }

  const payment = await prisma.payment.findUnique({
    where: { appointmentId },
    include: { appointment: true },
  });

  if (!payment) {
    return { error: "Payment record not found" };
  }

  if (payment.userId !== user.id) {
    return { error: "Unauthorized" };
  }

  if (payment.status !== "PENDING") {
    return { error: "Payment already processed" };
  }

  if (new Date() > payment.expiresAt) {
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: { status: "EXPIRED" },
      }),
      prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: "EXPIRED" },
      }),
    ]);
    return { error: "Payment window expired. Please book again." };
  }

  let screenshotUrl: string | undefined;
  if (screenshot && screenshot.size > 0) {
    const result = await uploadImage(screenshot, "clinic/payments");
    screenshotUrl = result.url;
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        utrNumber,
        screenshotUrl: screenshotUrl || null,
        status: "SUBMITTED",
      },
    }),
    prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: "PAYMENT_SUBMITTED" },
    }),
  ]);

  revalidatePath("/patient/appointments");
  revalidatePath("/admin/payments");
  return { success: true };
}

export async function verifyPayment(paymentId: string, action: "approve" | "reject", reason?: string) {
  const admin = await requireAuth(["ADMIN"]);

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { appointment: true },
  });

  if (!payment) {
    return { error: "Payment not found" };
  }

  if (action === "approve") {
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: "VERIFIED",
          verifiedBy: admin.id,
          verifiedAt: new Date(),
        },
      }),
      prisma.appointment.update({
        where: { id: payment.appointmentId },
        data: { status: "CONFIRMED" },
      }),
    ]);
  } else {
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: "REJECTED",
          verifiedBy: admin.id,
          verifiedAt: new Date(),
          rejectionReason: reason || "Payment verification failed",
        },
      }),
      prisma.appointment.update({
        where: { id: payment.appointmentId },
        data: { status: "CANCELLED" },
      }),
    ]);
  }

  revalidatePath("/admin/payments");
  revalidatePath("/patient/appointments");
  return { success: true };
}
