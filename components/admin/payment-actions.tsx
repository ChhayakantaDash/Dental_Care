"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

export function PaymentVerificationActions({ paymentId }: { paymentId: string }) {
  const router = useRouter();
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  async function handleAction(action: "approve" | "reject") {
    if (action === "reject" && !reason.trim()) {
      toast.error("Please enter a rejection reason");
      return;
    }
    setLoading(action);
    try {
      const res = await fetch("/api/admin/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, action, reason: reason.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        toast.error(data.error || "Failed to process payment");
      } else {
        toast.success(action === "approve" ? "Payment approved! Appointment confirmed." : "Payment rejected.");
        router.refresh();
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col gap-3 min-w-[200px]">
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => handleAction("approve")}
          loading={loading === "approve"}
          disabled={loading !== null}
          className="gap-1 bg-green-600 hover:bg-green-700 text-white flex-1"
        >
          <Check className="h-3 w-3" /> Approve
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => setShowReject((v) => !v)}
          disabled={loading !== null}
          className="gap-1 flex-1"
        >
          <X className="h-3 w-3" /> Reject
        </Button>
      </div>
      {showReject && (
        <div className="flex flex-col gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
          <p className="text-xs font-medium text-red-700">Rejection reason (required):</p>
          <textarea
            className="w-full text-sm border border-red-200 rounded-md p-2 resize-none focus:outline-none focus:ring-1 focus:ring-red-400 bg-white"
            rows={2}
            placeholder="e.g. UTR number not matching, screenshot unclear..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleAction("reject")}
              loading={loading === "reject"}
              disabled={loading !== null}
              className="flex-1"
            >
              Confirm Rejection
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => { setShowReject(false); setReason(""); }}
              disabled={loading !== null}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
