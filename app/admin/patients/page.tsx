import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PatientStatusToggle } from "@/components/admin/patient-status-toggle";

export default async function AdminPatientsPage() {
  const patients = await prisma.user.findMany({
    where: { role: "PATIENT" },
    include: {
      _count: { select: { appointments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Patient Management</h1>
      <p className="text-muted-foreground mb-8">View and manage registered patients</p>

      {patients.length === 0 ? (
        <Card>
          <p className="text-center py-8 text-muted-foreground">No patients registered yet</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {patients.map((patient) => (
            <Card key={patient.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="font-bold text-blue-700">{patient.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium">{patient.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {patient.email} {patient.phone && `· ${patient.phone}`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {patient._count.appointments} appointments · Joined {formatDate(patient.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={patient.isActive ? "CONFIRMED" : "CANCELLED"}>
                    {patient.isActive ? "Active" : "Banned"}
                  </Badge>
                  <PatientStatusToggle userId={patient.id} isActive={patient.isActive} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
