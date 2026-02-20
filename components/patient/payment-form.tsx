"use client";

import { useState, useEffect } from "react";
import { submitPayment } from "@/lib/actions/payments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Upload, Clock } from "lucide-react";

interface Props {
  appointmentId: string;
  amount: number;
  expiresAt: string;
  qrCodeUrl: string | null;
  upiId: string | null;
}

export function PaymentForm({ appointmentId, amount, expiresAt, qrCodeUrl, upiId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setExpired(true);
        setTimeLeft("Expired");
        clearInterval(interval);
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${mins}:${secs.toString().padStart(2, "0")}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    formData.set("appointmentId", appointmentId);
    const result = await submitPayment(formData);
    if (result.error) {
      toast.error(result.error);
      setLoading(false);
    } else {
      toast.success("Payment submitted! Waiting for admin verification.");
      router.refresh();
    }
  }

  if (expired) {
    return (
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-sm text-destructive flex items-center gap-2">
          <Clock className="h-4 w-4" /> Payment window has expired. Please book again.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-border">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium">Complete Payment</h4>
        <span className="text-sm text-destructive flex items-center gap-1">
          <Clock className="h-4 w-4" /> {timeLeft}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Pay <span className="font-bold text-foreground">{formatCurrency(amount)}</span> via UPI
          </p>
          {qrCodeUrl ? (
            <div className="w-48 h-48 rounded-lg overflow-hidden border border-border">
              <img src={qrCodeUrl} alt="UPI QR Code" className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="w-48 h-48 rounded-lg border border-border flex items-center justify-center bg-muted">
              <p className="text-xs text-muted-foreground text-center px-4">
                QR code not configured. Contact clinic.
              </p>
            </div>
          )}
          {upiId && (
            <p className="text-sm">
              UPI ID: <span className="font-mono font-medium">{upiId}</span>
            </p>
          )}
        </div>

        <form action={handleSubmit} className="space-y-4">
          <Input
            name="utrNumber"
            label="UTR / Transaction Number"
            placeholder="Enter UTR number"
            required
            minLength={6}
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium">Payment Screenshot</label>
            <div className="relative">
              <input
                name="screenshot"
                type="file"
                accept="image/*"
                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              />
            </div>
          </div>
          <Button type="submit" loading={loading} className="w-full gap-2">
            <Upload className="h-4 w-4" /> Submit Payment
          </Button>
        </form>
      </div>
    </div>
  );
}
