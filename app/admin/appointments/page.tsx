import { prisma } from "@/lib/prisma";
import { formatDate, formatTime, formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminAppointmentActions } from "@/components/admin/appointment-actions";

export default async function AdminAppointmentsPage() {
  const appointments = await prisma.appointment.findMany({
    include: {
      patient: true,
      doctor: { include: { user: true } },
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">All Appointments</h1>
      <p className="text-muted-foreground mb-8">View and manage all clinic appointments</p>

      {appointments.length === 0 ? (
        <Card>
          <p className="text-center py-8 text-muted-foreground">No appointments yet</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {appointments.map((apt) => (
            <Card key={apt.id} className="p-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {apt.patient.name} → Dr. {apt.doctor.user.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(apt.date)} · {formatTime(apt.startTime)}-{formatTime(apt.endTime)}
                    {apt.payment && ` · ${formatCurrency(Number(apt.payment.amount))}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={apt.status}>{apt.status.replace(/_/g, " ")}</Badge>
                  <AdminAppointmentActions
                    appointmentId={apt.id}
                    status={apt.status}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
