"use client";

import { removeDoctor } from "@/lib/actions/admin";
import { toggleUserStatus } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Ban, Trash2 } from "lucide-react";

interface Props {
  doctorId: string;
  isActive: boolean;
}

export function DoctorActions({ doctorId, isActive }: Props) {
  const router = useRouter();

  async function handleRemove() {
    if (!confirm("Are you sure you want to remove this doctor?")) return;
    const result = await removeDoctor(doctorId);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Doctor removed");
      router.refresh();
    }
  }

  return (
    <div className="flex gap-1">
      <Button variant="ghost" size="sm" onClick={handleRemove} title={isActive ? "Deactivate" : "Already inactive"}>
        <Ban className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}
