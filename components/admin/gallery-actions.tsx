"use client";

import { removeGalleryImage } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function GalleryImageActions({ imageId }: { imageId: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete this image?")) return;
    const result = await removeGalleryImage(imageId);
    if (result.error) toast.error(result.error);
    else { toast.success("Image deleted"); router.refresh(); }
  }

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete} className="gap-1">
      <Trash2 className="h-4 w-4" /> Delete
    </Button>
  );
}
