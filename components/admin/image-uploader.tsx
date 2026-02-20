"use client";

import { useState } from "react";
import { uploadClinicImage } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";

interface Props {
  type: "logo" | "qrCode" | "hero";
  currentUrl: string | null;
  label: string;
}

export function ImageUploader({ type, currentUrl, label }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const fd = new FormData();
    fd.set("file", file);

    const result = await uploadClinicImage(fd, type);
    if (result.error) toast.error(result.error);
    else { toast.success(`${label} updated`); router.refresh(); }
    setLoading(false);
  }

  return (
    <Card className="p-4">
      <CardTitle className="mb-3 text-sm">{label}</CardTitle>
      {currentUrl && (
        <div className="mb-3 w-32 h-32 rounded-lg overflow-hidden border border-border">
          <img src={currentUrl} alt={label} className="w-full h-full object-contain" />
        </div>
      )}
      <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-primary hover:underline">
        <Upload className="h-4 w-4" />
        {loading ? "Uploading..." : currentUrl ? "Change" : "Upload"}
        <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={loading} />
      </label>
    </Card>
  );
}
