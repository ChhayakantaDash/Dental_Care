"use client";

import { cancelAppointment } from "@/lib/actions/appointments";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Props {
  appointmentId: string;
  status: string;
  prescriptionId?: string | null;
}

export function AppointmentActions({ appointmentId, status, prescriptionId }: Props) {
  const router = useRouter();

  async function handleCancel() {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    const result = await cancelAppointment(appointmentId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Appointment cancelled");
      router.refresh();
    }
  }

  const canCancel = ["PENDING_PAYMENT", "PAYMENT_SUBMITTED", "CONFIRMED"].includes(status);

  return (
    <div className="flex gap-2">
      {canCancel && (
        <Button variant="destructive" size="sm" onClick={handleCancel}>
          Cancel
        </Button>
      )}
    </div>
  );
}
