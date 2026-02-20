import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { formatDate, formatTime, formatCurrency } from "@/lib/utils";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, FileText, CreditCard } from "lucide-react";

export default async function PatientDashboard() {
  const session = await getSession();
  if (!session) return null;

  const [appointments, records] = await Promise.all([
    prisma.appointment.findMany({
      where: { patientId: session.id },
      include: { doctor: { include: { user: true } }, payment: true },
      orderBy: { date: "desc" },
      take: 5,
    }),
    prisma.medicalRecord.count({ where: { patientId: session.id } }),
  ]);

  const upcoming = appointments.filter(
    (a) => new Date(a.date) >= new Date() && !["CANCELLED", "EXPIRED", "COMPLETED"].includes(a.status)
  );
  const totalSpent = appointments
    .filter((a) => a.payment?.status === "VERIFIED")
    .reduce((sum, a) => sum + Number(a.payment!.amount), 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-1">Welcome, {session.name}</h1>
      <p className="text-muted-foreground mb-8">Here&apos;s your appointment overview</p>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><Calendar className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-2xl font-bold">{appointments.length}</p>
              <p className="text-xs text-muted-foreground">Total Appointments</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10"><Clock className="h-5 w-5 text-accent" /></div>
            <div>
              <p className="text-2xl font-bold">{upcoming.length}</p>
              <p className="text-xs text-muted-foreground">Upcoming</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10"><FileText className="h-5 w-5 text-success" /></div>
            <div>
              <p className="text-2xl font-bold">{records}</p>
              <p className="text-xs text-muted-foreground">Medical Records</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10"><CreditCard className="h-5 w-5 text-warning" /></div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p>
              <p className="text-xs text-muted-foreground">Total Spent</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex items-center justify-between mb-4">
        <CardTitle>Recent Appointments</CardTitle>
        <Link href="/patient/appointments">
          <Button variant="ghost" size="sm">View All</Button>
        </Link>
      </div>

      {appointments.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No appointments yet</p>
            <Link href="/patient/book"><Button>Book Your First Appointment</Button></Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {appointments.map((apt) => (
            <Card key={apt.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{apt.doctor.user.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium">{apt.doctor.user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(apt.date)} &middot; {formatTime(apt.startTime)} - {formatTime(apt.endTime)}
                    </p>
                  </div>
                </div>
                <Badge variant={apt.status}>{apt.status.replace(/_/g, " ")}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
