"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { appointmentSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function bookAppointment(formData: FormData) {
  const user = await requireAuth(["PATIENT"]);

  const raw = {
    doctorId: formData.get("doctorId") as string,
    date: formData.get("date") as string,
    startTime: formData.get("startTime") as string,
    endTime: formData.get("endTime") as string,
  };

  const parsed = appointmentSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Check if slot is still available
  const existing = await prisma.appointment.findFirst({
    where: {
      doctorId: parsed.data.doctorId,
      date: new Date(parsed.data.date),
      startTime: parsed.data.startTime,
      status: { notIn: ["CANCELLED", "EXPIRED"] },
    },
  });

  if (existing) {
    return { error: "This slot is no longer available" };
  }

  const doctor = await prisma.doctor.findUnique({
    where: { id: parsed.data.doctorId },
  });

  if (!doctor) {
    return { error: "Doctor not found" };
  }

  const appointment = await prisma.appointment.create({
    data: {
      patientId: user.id,
      doctorId: parsed.data.doctorId,
      date: new Date(parsed.data.date),
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
      status: "PENDING_PAYMENT",
    },
  });

  // Create payment record with 15 min expiry
  await prisma.payment.create({
    data: {
      appointmentId: appointment.id,
      userId: user.id,
      amount: doctor.consultationFee,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    },
  });

  revalidatePath("/patient/appointments");
  return { success: true, appointmentId: appointment.id };
}

export async function cancelAppointment(appointmentId: string) {
  const user = await requireAuth();

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { payment: true },
  });

  if (!appointment) {
    return { error: "Appointment not found" };
  }

  // Patients can only cancel their own
  if (user.role === "PATIENT" && appointment.patientId !== user.id) {
    return { error: "Unauthorized" };
  }

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/patient/appointments");
  revalidatePath("/doctor/appointments");
  revalidatePath("/admin/appointments");
  return { success: true };
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: "ARRIVED" | "COMPLETED" | "NO_SHOW" | "CANCELLED"
) {
  try {
    await requireAuth(["DOCTOR", "ADMIN"]);

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
    });

    revalidatePath("/doctor/appointments");
    revalidatePath("/doctor");
    revalidatePath("/admin/appointments");
    return { success: true };
  } catch {
    return { error: "Failed to update appointment status" };
  }
}

export async function updateTokenStatus(
  appointmentId: string,
  tokenStatus: "IN_PROGRESS" | "COMPLETED" | "SKIPPED"
) {
  try {
    await requireAuth(["DOCTOR", "ADMIN"]);

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { tokenStatus },
    });

    revalidatePath("/doctor/appointments");
    revalidatePath("/patient/appointments");
    revalidatePath("/admin/appointments");
    return { success: true };
  } catch {
    return { error: "Failed to update token status" };
  }
}

export async function getAvailableSlots(doctorId: string, date: string) {
  const dayOfWeek = new Date(date).getDay();

  const availability = await prisma.doctorAvailability.findFirst({
    where: {
      doctorId,
      dayOfWeek,
      isActive: true,
    },
  });

  if (!availability) {
    return { slots: [], message: "Doctor is not available on this day" };
  }

  // Check for holidays
  const dateObj = new Date(date);
  dateObj.setHours(0, 0, 0, 0);
  const nextDay = new Date(dateObj);
  nextDay.setDate(nextDay.getDate() + 1);

  const holiday = await prisma.holiday.findFirst({
    where: {
      date: {
        gte: dateObj,
        lt: nextDay,
      },
    },
  });

  if (holiday) {
    return { slots: [], message: `Holiday: ${holiday.reason || "Clinic closed"}` };
  }

  // Generate all possible slots
  const { generateTimeSlots } = await import("@/lib/utils");
  const allSlots = generateTimeSlots(
    availability.startTime,
    availability.endTime,
    availability.slotDuration
  );

  // Get booked slots
  const bookedAppointments = await prisma.appointment.findMany({
    where: {
      doctorId,
      date: {
        gte: dateObj,
        lt: nextDay,
      },
      status: { notIn: ["CANCELLED", "EXPIRED"] },
    },
    select: { startTime: true },
  });

  const bookedTimes = new Set(bookedAppointments.map((a) => a.startTime));

  const slots = allSlots.map((slot) => ({
    ...slot,
    available: !bookedTimes.has(slot.start),
  }));

  return { slots };
}
