"use client";

import { useState } from "react";
import { updateClinicSettings } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Settings {
  clinicName: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  upiId: string | null;
  about: string | null;
}

export function ClinicSettingsForm({ settings }: { settings: Settings | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const result = await updateClinicSettings(formData);
    if (result.error) toast.error(result.error);
    else { toast.success("Settings updated"); router.refresh(); }
    setLoading(false);
  }

  return (
    <Card>
      <CardTitle className="mb-4">Clinic Information</CardTitle>
      <form action={handleSubmit} className="space-y-4">
        <Input
          id="clinicName" name="clinicName" label="Clinic Name"
          defaultValue={settings?.clinicName || ""} required
        />
        <Input
          id="address" name="address" label="Address"
          defaultValue={settings?.address || ""}
        />
        <Input
          id="phone" name="phone" label="Phone"
          defaultValue={settings?.phone || ""}
        />
        <Input
          id="email" name="email" type="email" label="Email"
          defaultValue={settings?.email || ""}
        />
        <Input
          id="upiId" name="upiId" label="UPI ID"
          placeholder="e.g. clinic@upi"
          defaultValue={settings?.upiId || ""}
        />
        <Textarea
          id="about" name="about" label="About Clinic"
          defaultValue={settings?.about || ""}
          placeholder="Brief description shown on homepage..."
        />
        <Button type="submit" loading={loading} className="w-full">
          Save Settings
        </Button>
      </form>
    </Card>
  );
}
