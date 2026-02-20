"use client";

import { useState } from "react";
import { addDoctor } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export function AddDoctorForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const result = await addDoctor(formData);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Doctor added successfully");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <Card>
      <CardTitle className="mb-4">Add New Doctor</CardTitle>
      <form action={handleSubmit} className="space-y-3">
        <Input id="name" name="name" label="Full Name" placeholder="Dr. Name" required />
        <Input id="email" name="email" type="email" label="Email" placeholder="doctor@clinic.com" required />
        <Input id="phone" name="phone" label="Phone" placeholder="+91 98765 43210" />
        <Input id="password" name="password" type="password" label="Password" placeholder="Min 6 chars" required minLength={6} />
        <Input id="specialization" name="specialization" label="Specialization" placeholder="e.g. Orthodontist" required />
        <Input id="qualification" name="qualification" label="Qualification" placeholder="e.g. BDS, MDS" required />
        <Input id="experience" name="experience" type="number" label="Experience (years)" min={0} required />
        <Input id="consultationFee" name="consultationFee" type="number" label="Consultation Fee (₹)" min={0} required />
        <Textarea id="bio" name="bio" label="Bio (optional)" placeholder="Brief description..." />
        <Button type="submit" loading={loading} className="w-full">
          Add Doctor
        </Button>
      </form>
    </Card>
  );
}
