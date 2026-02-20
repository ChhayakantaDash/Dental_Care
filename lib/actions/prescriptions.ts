"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { prescriptionSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function createPrescription(formData: FormData) {
  const user = await requireAuth(["DOCTOR"]);

  const raw = {
    appointmentId: formData.get("appointmentId") as string,
    diagnosis: formData.get("diagnosis") as string,
    medications: JSON.parse(formData.get("medications") as string),
    instructions: formData.get("instructions") as string,
  };

  const parsed = prescriptionSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Get doctor record
  const doctor = await prisma.doctor.findUnique({
    where: { userId: user.id },
  });

  if (!doctor) {
    return { error: "Doctor profile not found" };
  }

  // Verify appointment belongs to this doctor
  const appointment = await prisma.appointment.findUnique({
    where: { id: parsed.data.appointmentId },
    include: { patient: true },
  });

  if (!appointment || appointment.doctorId !== doctor.id) {
    return { error: "Appointment not found" };
  }

  // Create prescription
  await prisma.prescription.upsert({
    where: { appointmentId: parsed.data.appointmentId },
    create: {
      appointmentId: parsed.data.appointmentId,
      doctorId: doctor.id,
      diagnosis: parsed.data.diagnosis,
      medications: parsed.data.medications,
      instructions: parsed.data.instructions || null,
    },
    update: {
      diagnosis: parsed.data.diagnosis,
      medications: parsed.data.medications,
      instructions: parsed.data.instructions || null,
    },
  });

  // Also create/update medical record
  await prisma.medicalRecord.create({
    data: {
      patientId: appointment.patientId,
      visitDate: appointment.date,
      doctorName: user.name,
      diagnosis: parsed.data.diagnosis,
      prescription: JSON.stringify(parsed.data.medications),
      notes: parsed.data.instructions || null,
    },
  });

  revalidatePath("/doctor/appointments");
  revalidatePath("/patient/records");
  return { success: true };
}
