"use client";

import { cancelAppointment, updateAppointmentStatus } from "@/lib/actions/appointments";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  appointmentId: string;
  status: string;
}

export function AdminAppointmentActions({ appointmentId, status }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    if (!confirm("Cancel this appointment?")) return;
    const result = await cancelAppointment(appointmentId);
    if (result.error) toast.error(result.error);
    else { toast.success("Cancelled"); router.refresh(); }
  }

  async function handleStatus(s: "ARRIVED" | "COMPLETED" | "NO_SHOW" | "CANCELLED") {
    const result = await updateAppointmentStatus(appointmentId, s);
    if (result.error) toast.error(result.error);
    else { toast.success(`Updated to ${s}`); router.refresh(); }
  }

  const canCancel = ["PENDING_PAYMENT", "PAYMENT_SUBMITTED", "CONFIRMED"].includes(status);
  const canComplete = ["CONFIRMED", "ARRIVED"].includes(status);

  return (
    <div className="flex gap-1">
      <Button size="sm" onClick={async () => {
        const token = prompt("Enter token number to assign:");
        if (!token) return;
        setLoading(true);
        try {
          const res = await fetch('/api/admin/assign-token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ appointmentId, tokenNumber: Number(token) }) });
          const text = await res.text();
          let data: any;
          try { data = JSON.parse(text); } catch { data = { error: text } }
          if (!res.ok) {
            toast.error(data.error || `HTTP ${res.status}`);
          } else if (data.error) {
            toast.error(data.error);
          } else { toast.success('Token assigned'); router.refresh(); }
        } catch (err) { toast.error('Failed to assign token'); }
        setLoading(false);
      }} disabled={loading}>
        Assign Token
      </Button>
      {canComplete && (
        <Button size="sm" variant="outline" onClick={() => handleStatus("COMPLETED")}>
          Complete
        </Button>
      )}
      {canCancel && (
        <Button size="sm" variant="destructive" onClick={handleCancel}>
          Cancel
        </Button>
      )}
    </div>
  );
}
