import { prisma } from "@/lib/prisma";
import { Card, CardTitle } from "@/components/ui/card";
import { GalleryUploadForm } from "@/components/admin/gallery-form";
import { GalleryImageActions } from "@/components/admin/gallery-actions";

export default async function AdminGalleryPage() {
  const images = await prisma.galleryImage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Gallery Management</h1>
      <p className="text-muted-foreground mb-8">Upload and manage clinic gallery images</p>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {images.length === 0 ? (
            <Card>
              <p className="text-center py-8 text-muted-foreground">No gallery images yet</p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((img) => (
                <div key={img.id} className="relative group">
                  <div className="aspect-square overflow-hidden rounded-xl border border-border">
                    <img
                      src={img.url}
                      alt={img.caption || "Gallery"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                    <GalleryImageActions imageId={img.id} />
                  </div>
                  {img.caption && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">{img.caption}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <GalleryUploadForm />
      </div>
    </div>
  );
}
