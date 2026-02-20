import { prisma } from "@/lib/prisma";
import { formatCurrency, DAY_NAMES, formatTime } from "@/lib/utils";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddDoctorForm } from "@/components/admin/add-doctor-form";
import { DoctorActions } from "@/components/admin/doctor-actions";

export default async function AdminDoctorsPage() {
  const doctors = await prisma.doctor.findMany({
    include: {
      user: true,
      availability: { where: { isActive: true }, orderBy: { dayOfWeek: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Doctor Management</h1>
      <p className="text-muted-foreground mb-8">Add, edit, and manage doctors</p>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {doctors.length === 0 ? (
            <Card>
              <p className="text-center py-8 text-muted-foreground">No doctors added yet</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {doctors.map((doc) => (
                <Card key={doc.id} className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                        <span className="font-bold text-green-700">{doc.user.name.charAt(0)}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold">{doc.user.name}</h3>
                        <p className="text-sm text-primary">{doc.specialization}</p>
                        <p className="text-xs text-muted-foreground">{doc.qualification} · {doc.experience} yrs exp</p>
                        <p className="text-sm font-semibold text-accent mt-1">{formatCurrency(Number(doc.consultationFee))}</p>
                        {doc.availability.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {doc.availability.map((a) => (
                              <span key={a.id} className="text-xs bg-secondary px-2 py-0.5 rounded">
                                {DAY_NAMES[a.dayOfWeek].slice(0, 3)} {formatTime(a.startTime)}-{formatTime(a.endTime)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={doc.user.isActive ? "CONFIRMED" : "CANCELLED"}>
                        {doc.user.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <DoctorActions doctorId={doc.id} isActive={doc.user.isActive} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <AddDoctorForm />
      </div>
    </div>
  );
}
