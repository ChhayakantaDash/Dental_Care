import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { formatDate, formatTime } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DoctorAppointmentActions } from "@/components/doctor/appointment-actions";

export default async function DoctorAppointmentsPage() {
  const session = await getSession();
  if (!session) return null;

  const doctor = await prisma.doctor.findUnique({
    where: { userId: session.id },
  });

  if (!doctor) return null;

  const appointments = await prisma.appointment.findMany({
    where: {
      doctorId: doctor.id,
      status: { notIn: ["CANCELLED", "EXPIRED"] },
    },
    include: {
      patient: true,
      prescription: true,
      payment: true,
    },
    orderBy: [{ date: "desc" }, { startTime: "asc" }],
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Appointments</h1>
      <p className="text-muted-foreground mb-8">Manage patient visits and prescriptions</p>

      {appointments.length === 0 ? (
        <Card>
          <p className="text-center py-8 text-muted-foreground">No appointments found</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => (
            <Card key={apt.id} className="p-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <span className="font-bold text-green-700">{apt.patient.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{apt.patient.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {apt.patient.email} {apt.patient.phone && `· ${apt.patient.phone}`}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDate(apt.date)} &middot; {formatTime(apt.startTime)} - {formatTime(apt.endTime)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={apt.status}>{apt.status.replace(/_/g, " ")}</Badge>
                  <DoctorAppointmentActions
                    appointmentId={apt.id}
                    status={apt.status}
                    hasPrescription={!!apt.prescription}
                    patientName={apt.patient.name}
                  />
                </div>
              </div>

{apt.tokenNumber && (
                <div className="mt-3">
                  <p className="text-sm">
                    <span className="font-medium">Token:</span>{" "}
                    <span className="text-muted-foreground">#{apt.tokenNumber} {apt.tokenStatus ? `· ${apt.tokenStatus.replace(/_/g, ' ')}` : ''}</span>
                    </p>
                  </div>
                )}

              {apt.prescription && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-sm">
                    <span className="font-medium">Diagnosis:</span>{" "}
                    <span className="text-muted-foreground">{apt.prescription.diagnosis}</span>
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
