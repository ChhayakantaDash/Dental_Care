import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { formatDate, formatTime, formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppointmentActions } from "@/components/patient/appointment-actions";
import { PaymentForm } from "@/components/patient/payment-form";

export default async function PatientAppointmentsPage() {
  const session = await getSession();
  if (!session) return null;

  const appointments = await prisma.appointment.findMany({
    where: { patientId: session.id },
    include: {
      doctor: { include: { user: true } },
      payment: true,
      prescription: true,
    },
    orderBy: { date: "desc" },
  });

  const settings = await prisma.clinicSettings.findFirst();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">My Appointments</h1>
      <p className="text-muted-foreground mb-8">Track and manage your appointments</p>

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
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="font-bold text-primary">{apt.doctor.user.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{apt.doctor.user.name}</h3>
                    <p className="text-sm text-primary">{apt.doctor.specialization}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDate(apt.date)} &middot; {formatTime(apt.startTime)} - {formatTime(apt.endTime)}
                    </p>
                    <p className="text-sm font-medium mt-1">
                      Fee: {formatCurrency(Number(apt.payment?.amount || apt.doctor.consultationFee))}
                    </p>
                    {apt.payment && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Payment: <Badge variant={apt.payment.status}>{apt.payment.status.replace(/_/g, " ")}</Badge>
                        {apt.payment.rejectionReason && (
                          <span className="text-destructive ml-2">({apt.payment.rejectionReason})</span>
                        )}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={apt.status}>{apt.status.replace(/_/g, " ")}</Badge>
                  <AppointmentActions
                    appointmentId={apt.id}
                    status={apt.status}
                    prescriptionId={apt.prescription?.id}
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

              {/* Payment form for pending appointments */}
              {apt.status === "PENDING_PAYMENT" && apt.payment?.status === "PENDING" && (
                <PaymentForm
                  appointmentId={apt.id}
                  amount={Number(apt.payment.amount)}
                  expiresAt={apt.payment.expiresAt.toISOString()}
                  qrCodeUrl={settings?.qrCodeUrl || null}
                  upiId={settings?.upiId || null}
                />
              )}

              {/* Prescription link */}
              {apt.prescription && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-sm">
                    <span className="font-medium">Diagnosis:</span>{" "}
                    <span className="text-muted-foreground">{apt.prescription.diagnosis}</span>
                  </p>
                  {apt.prescription.instructions && (
                    <p className="text-sm mt-1">
                      <span className="font-medium">Instructions:</span>{" "}
                      <span className="text-muted-foreground">{apt.prescription.instructions}</span>
                    </p>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
