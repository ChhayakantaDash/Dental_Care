"use client";

import { useState } from "react";
import { setDoctorAvailability } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardTitle } from "@/components/ui/card";
import { DAY_NAMES } from "@/lib/utils";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export function ScheduleForm({ doctorId }: { doctorId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const result = await setDoctorAvailability(doctorId, formData);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Schedule updated");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <Card>
      <CardTitle className="mb-4">Add / Update Schedule</CardTitle>
      <form action={handleSubmit} className="space-y-4">
        <Select
          id="dayOfWeek"
          name="dayOfWeek"
          label="Day"
          options={DAY_NAMES.map((d, i) => ({ value: String(i), label: d }))}
        />
        <Input
          id="startTime"
          name="startTime"
          type="time"
          label="Start Time"
          defaultValue="09:00"
          required
        />
        <Input
          id="endTime"
          name="endTime"
          type="time"
          label="End Time"
          defaultValue="17:00"
          required
        />
        <Input
          id="slotDuration"
          name="slotDuration"
          type="number"
          label="Slot Duration (minutes)"
          defaultValue={30}
          min={10}
          max={120}
          required
        />
        <Button type="submit" loading={loading} className="w-full">
          Save Schedule
        </Button>
      </form>
    </Card>
  );
}
