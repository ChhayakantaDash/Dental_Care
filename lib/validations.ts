import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 digits").optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const doctorSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6),
  specialization: z.string().min(2),
  qualification: z.string().min(2),
  experience: z.coerce.number().min(0),
  consultationFee: z.coerce.number().min(0),
  bio: z.string().optional(),
});

export const availabilitySchema = z.object({
  dayOfWeek: z.coerce.number().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  slotDuration: z.coerce.number().min(10).max(120).default(30),
});

export const appointmentSchema = z.object({
  doctorId: z.string().min(1),
  date: z.string().min(1),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

export const paymentSchema = z.object({
  appointmentId: z.string().min(1),
  utrNumber: z.string().min(6, "UTR must be at least 6 characters"),
});

export const prescriptionSchema = z.object({
  appointmentId: z.string().min(1),
  diagnosis: z.string().min(1),
  medications: z.array(
    z.object({
      name: z.string().min(1),
      dosage: z.string().min(1),
      frequency: z.string().min(1),
      duration: z.string().min(1),
    })
  ),
  instructions: z.string().optional(),
});

export const clinicSettingsSchema = z.object({
  clinicName: z.string().min(1),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  upiId: z.string().optional(),
  about: z.string().optional(),
});
