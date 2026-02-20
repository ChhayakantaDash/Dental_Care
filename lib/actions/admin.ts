"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, setSession } from "@/lib/auth";
import { doctorSchema, availabilitySchema, clinicSettingsSchema } from "@/lib/validations";
import { uploadImage, deleteImage } from "@/lib/cloudinary";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import type { SessionUser } from "@/lib/auth";

export async function addDoctor(formData: FormData) {
  await requireAuth(["ADMIN"]);

  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    password: formData.get("password") as string,
    specialization: formData.get("specialization") as string,
    qualification: formData.get("qualification") as string,
    experience: formData.get("experience") as string,
    consultationFee: formData.get("consultationFee") as string,
    bio: formData.get("bio") as string,
  };

  const parsed = doctorSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    return { error: "Email already in use" };
  }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 12);

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      password: hashedPassword,
      role: "DOCTOR",
      doctor: {
        create: {
          specialization: parsed.data.specialization,
          qualification: parsed.data.qualification,
          experience: parsed.data.experience,
          consultationFee: parsed.data.consultationFee,
          bio: parsed.data.bio || null,
        },
      },
    },
  });

  revalidatePath("/admin/doctors");
  revalidatePath("/doctors");
  return { success: true };
}

export async function updateDoctor(doctorId: string, formData: FormData) {
  await requireAuth(["ADMIN"]);

  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    include: { user: true },
  });

  if (!doctor) {
    return { error: "Doctor not found" };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: doctor.userId },
      data: {
        name: formData.get("name") as string,
        phone: (formData.get("phone") as string) || null,
      },
    }),
    prisma.doctor.update({
      where: { id: doctorId },
      data: {
        specialization: formData.get("specialization") as string,
        qualification: formData.get("qualification") as string,
        experience: parseInt(formData.get("experience") as string),
        consultationFee: parseFloat(formData.get("consultationFee") as string),
        bio: (formData.get("bio") as string) || null,
      },
    }),
  ]);

  revalidatePath("/admin/doctors");
  revalidatePath("/doctors");
  return { success: true };
}

export async function removeDoctor(doctorId: string) {
  await requireAuth(["ADMIN"]);

  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
  });

  if (!doctor) {
    return { error: "Doctor not found" };
  }

  await prisma.user.update({
    where: { id: doctor.userId },
    data: { isActive: false },
  });

  revalidatePath("/admin/doctors");
  revalidatePath("/doctors");
  return { success: true };
}

export async function setDoctorAvailability(doctorId: string, formData: FormData) {
  await requireAuth(["ADMIN", "DOCTOR"]);

  const raw = {
    dayOfWeek: formData.get("dayOfWeek") as string,
    startTime: formData.get("startTime") as string,
    endTime: formData.get("endTime") as string,
    slotDuration: formData.get("slotDuration") as string,
  };

  const parsed = availabilitySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await prisma.doctorAvailability.upsert({
    where: {
      id: (
        await prisma.doctorAvailability.findFirst({
          where: { doctorId, dayOfWeek: parsed.data.dayOfWeek },
        })
      )?.id || "new",
    },
    create: {
      doctorId,
      dayOfWeek: parsed.data.dayOfWeek,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
      slotDuration: parsed.data.slotDuration,
    },
    update: {
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
      slotDuration: parsed.data.slotDuration,
      isActive: true,
    },
  });

  revalidatePath("/admin/doctors");
  revalidatePath("/doctor/schedule");
  return { success: true };
}

export async function addHoliday(formData: FormData) {
  await requireAuth(["ADMIN"]);

  const date = formData.get("date") as string;
  const reason = formData.get("reason") as string;

  if (!date) return { error: "Date is required" };

  await prisma.holiday.create({
    data: {
      date: new Date(date),
      reason: reason || null,
    },
  });

  revalidatePath("/admin/settings");
  return { success: true };
}

export async function removeHoliday(holidayId: string) {
  try {
    await requireAuth(["ADMIN"]);
    await prisma.holiday.delete({ where: { id: holidayId } });
    revalidatePath("/admin/settings");
    return { success: true };
  } catch {
    return { error: "Failed to remove holiday" };
  }
}

export async function updateClinicSettings(formData: FormData) {
  await requireAuth(["ADMIN"]);

  const raw = {
    clinicName: formData.get("clinicName") as string,
    address: formData.get("address") as string,
    phone: formData.get("phone") as string,
    email: formData.get("email") as string,
    upiId: formData.get("upiId") as string,
    about: formData.get("about") as string,
  };

  const parsed = clinicSettingsSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const existing = await prisma.clinicSettings.findFirst();

  if (existing) {
    await prisma.clinicSettings.update({
      where: { id: existing.id },
      data: { ...parsed.data },
    });
  } else {
    await prisma.clinicSettings.create({
      data: { ...parsed.data },
    });
  }

  revalidatePath("/admin/settings");
  revalidatePath("/");
  return { success: true };
}

export async function uploadClinicImage(formData: FormData, type: "logo" | "qrCode" | "hero") {
  await requireAuth(["ADMIN"]);

  const file = formData.get("file") as File;
  if (!file || file.size === 0) return { error: "No file provided" };

  const result = await uploadImage(file, `clinic/${type}`);

  const existing = await prisma.clinicSettings.findFirst();
  const fieldMap = { logo: "logo", qrCode: "qrCodeUrl", hero: "heroImage" };
  const field = fieldMap[type];

  if (existing) {
    await prisma.clinicSettings.update({
      where: { id: existing.id },
      data: { [field]: result.url },
    });
  } else {
    await prisma.clinicSettings.create({
      data: { [field]: result.url },
    });
  }

  revalidatePath("/admin/settings");
  revalidatePath("/");
  return { success: true, url: result.url };
}

export async function addGalleryImage(formData: FormData) {
  await requireAuth(["ADMIN"]);

  const file = formData.get("file") as File;
  const caption = formData.get("caption") as string;
  const category = formData.get("category") as string;

  if (!file || file.size === 0) return { error: "No file provided" };

  const result = await uploadImage(file, "clinic/gallery");

  await prisma.galleryImage.create({
    data: {
      url: result.url,
      publicId: result.publicId,
      caption: caption || null,
      category: category || null,
    },
  });

  revalidatePath("/admin/gallery");
  revalidatePath("/");
  return { success: true };
}

export async function removeGalleryImage(imageId: string) {
  await requireAuth(["ADMIN"]);

  const image = await prisma.galleryImage.findUnique({
    where: { id: imageId },
  });

  if (!image) return { error: "Image not found" };

  await deleteImage(image.publicId);
  await prisma.galleryImage.delete({ where: { id: imageId } });

  revalidatePath("/admin/gallery");
  revalidatePath("/");
  return { success: true };
}

export async function toggleUserStatus(userId: string) {
  await requireAuth(["ADMIN"]);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "User not found" };

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive },
  });

  revalidatePath("/admin/patients");
  revalidatePath("/admin/doctors");
  return { success: true };
}

export async function uploadMedicalReport(formData: FormData) {
  const user = await requireAuth(["DOCTOR"]);

  const file = formData.get("file") as File;
  const recordId = formData.get("recordId") as string;

  if (!file || file.size === 0) return { error: "No file provided" };

  const result = await uploadImage(file, "clinic/reports");

  const record = await prisma.medicalRecord.findUnique({
    where: { id: recordId },
  });

  if (!record) return { error: "Record not found" };

  await prisma.medicalRecord.update({
    where: { id: recordId },
    data: {
      attachments: [...record.attachments, result.url],
    },
  });

  revalidatePath("/doctor/appointments");
  revalidatePath("/patient/records");
  return { success: true, url: result.url };
}

export async function createAdminSeed() {
  const existing = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });
  if (existing) return { error: "Admin already exists" };

  const hashedPassword = await bcrypt.hash("admin123", 12);

  await prisma.user.create({
    data: {
      name: "Clinic Admin",
      email: "admin@clinic.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  // Also create default clinic settings
  await prisma.clinicSettings.create({
    data: {
      clinicName: "Dental Clinic",
      email: "admin@clinic.com",
    },
  });

  return { success: true };
}

export async function assignToken(appointmentId: string, tokenNumber: number) {
  await requireAuth(["ADMIN"]);

  const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appointment) return { error: "Appointment not found" };

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { tokenNumber, tokenStatus: "ASSIGNED" },
  });

  revalidatePath("/admin/appointments");
  revalidatePath("/doctor/appointments");
  revalidatePath("/patient/appointments");
  return { success: true };
}
