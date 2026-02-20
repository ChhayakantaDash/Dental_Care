"use client";

import { useState } from "react";
import { addGalleryImage } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";

export function GalleryUploadForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const files = (formData.getAll("files") as File[]).filter(Boolean);
    const category = (formData.get("category") as string) || "";

    if (!files || files.length === 0) {
      toast.error("No files selected");
      setLoading(false);
      return;
    }

    for (const file of files) {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("caption", (formData.get("caption") as string) || "");
      fd.set("category", category || "");
      const result = await addGalleryImage(fd);
      if (result.error) {
        toast.error(result.error);
        // continue uploading remaining files
      }
    }

    toast.success("Images processed");
    router.refresh();
    setLoading(false);
  }

  return (
    <Card>
      <CardTitle className="mb-4">Upload Image</CardTitle>
      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium">Images</label>
          <input
            name="files"
            type="file"
            accept="image/*"
            multiple
            required
            className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
          />
        </div>
        <Input name="caption" label="Caption (optional)" placeholder="Image description" />
        <div>
          <label className="block text-sm font-medium mb-1">Upload As</label>
          <select name="category" className="w-full rounded border border-border p-2 text-sm">
            <option value="">Gallery</option>
            <option value="hero">Hero (Homepage Carousel)</option>
            <option value="clinic">Clinic</option>
            <option value="equipment">Equipment</option>
          </select>
        </div>
        <Button type="submit" loading={loading} className="w-full gap-2">
          <Upload className="h-4 w-4" /> Upload
        </Button>
      </form>
    </Card>
  );
}
