"use client";

import { toggleUserStatus } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Ban, UserCheck } from "lucide-react";

export function PatientStatusToggle({ userId, isActive }: { userId: string; isActive: boolean }) {
  const router = useRouter();

  async function handleToggle() {
    const action = isActive ? "ban" : "unban";
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;
    const result = await toggleUserStatus(userId);
    if (result.error) toast.error(result.error);
    else { toast.success(`User ${action}ned`); router.refresh(); }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleToggle} title={isActive ? "Ban user" : "Unban user"}>
      {isActive ? <Ban className="h-4 w-4 text-destructive" /> : <UserCheck className="h-4 w-4 text-green-600" />}
    </Button>
  );
}
