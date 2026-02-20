export type { Role, AppointmentStatus, PaymentStatus } from "@/app/generated/prisma/enums";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}
