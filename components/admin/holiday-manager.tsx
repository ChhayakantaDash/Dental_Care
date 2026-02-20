"use client";

import { useState } from "react";
import { addHoliday, removeHoliday } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

interface Holiday {
  id: string;
  date: string;
  reason: string | null;
}

export function HolidayManager({ holidays }: { holidays: Holiday[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleAdd(formData: FormData) {
    setLoading(true);
    const result = await addHoliday(formData);
    if (result.error) toast.error(result.error);
    else { toast.success("Holiday added"); router.refresh(); }
    setLoading(false);
  }

  async function handleRemove(id: string) {
    const result = await removeHoliday(id);
    if (result.error) toast.error(result.error);
    else { toast.success("Holiday removed"); router.refresh(); }
  }

  return (
    <Card>
      <CardTitle className="mb-4">Holidays / Block Days</CardTitle>
      <form action={handleAdd} className="flex gap-3 mb-4">
        <Input name="date" type="date" required />
        <Input name="reason" placeholder="Reason (optional)" />
        <Button type="submit" loading={loading}>Add</Button>
      </form>

      {holidays.length === 0 ? (
        <p className="text-sm text-muted-foreground">No holidays configured</p>
      ) : (
        <div className="space-y-2">
          {holidays.map((h) => (
            <div key={h.id} className="flex items-center justify-between p-2 rounded-lg border border-border">
              <div>
                <p className="text-sm font-medium">
                  {new Date(h.date).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                </p>
                {h.reason && <p className="text-xs text-muted-foreground">{h.reason}</p>}
              </div>
              <button onClick={() => handleRemove(h.id)} className="p-1 hover:bg-destructive/10 rounded text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
