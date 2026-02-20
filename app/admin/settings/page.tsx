import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Card, CardTitle } from "@/components/ui/card";
import { ClinicSettingsForm } from "@/components/admin/settings-form";
import { HolidayManager } from "@/components/admin/holiday-manager";
import { ImageUploader } from "@/components/admin/image-uploader";

export default async function AdminSettingsPage() {
  const settings = await prisma.clinicSettings.findFirst();
  const holidays = await prisma.holiday.findMany({
    orderBy: { date: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Clinic Settings</h1>
      <p className="text-muted-foreground mb-8">Configure clinic details, holidays, and branding</p>

      <div className="grid lg:grid-cols-2 gap-6">
        <ClinicSettingsForm settings={settings} />

        <div className="space-y-6">
          <ImageUploader
            type="logo"
            currentUrl={settings?.logo || null}
            label="Clinic Logo"
          />
          <ImageUploader
            type="qrCode"
            currentUrl={settings?.qrCodeUrl || null}
            label="UPI QR Code"
          />
          <ImageUploader
            type="hero"
            currentUrl={settings?.heroImage || null}
            label="Hero Image"
          />
        </div>
      </div>

      <div className="mt-8">
        <HolidayManager holidays={holidays.map(h => ({ ...h, date: h.date.toISOString() }))} />
      </div>
    </div>
  );
}
