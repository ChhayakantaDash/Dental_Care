import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { formatDate, formatTime } from "@/lib/utils";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DoctorDashboard() {
  const session = await getSession();
  if (!session) return null;

  const doctor = await prisma.doctor.findUnique({
    where: { userId: session.id },
  });

  if (!doctor) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Doctor profile not found. Contact admin.</p>
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [todayAppointments, totalAppointments, completedCount] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        doctorId: doctor.id,
        date: { gte: today, lt: tomorrow },
        status: { notIn: ["CANCELLED", "EXPIRED"] },
      },
      include: { patient: true },
      orderBy: { startTime: "asc" },
    }),
    prisma.appointment.count({
      where: { doctorId: doctor.id, status: { notIn: ["CANCELLED", "EXPIRED"] } },
    }),
    prisma.appointment.count({
      where: { doctorId: doctor.id, status: "COMPLETED" },
    }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Welcome, Dr. {session.name}</h1>
      <p className="text-muted-foreground mb-8">Here&apos;s your schedule overview</p>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100"><Calendar className="h-5 w-5 text-green-600" /></div>
            <div>
              <p className="text-2xl font-bold">{todayAppointments.length}</p>
              <p className="text-xs text-muted-foreground">Today&apos;s Appointments</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100"><Users className="h-5 w-5 text-blue-600" /></div>
            <div>
              <p className="text-2xl font-bold">{totalAppointments}</p>
              <p className="text-xs text-muted-foreground">Total Patients</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100"><CheckCircle className="h-5 w-5 text-green-600" /></div>
            <div>
              <p className="text-2xl font-bold">{completedCount}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100"><Clock className="h-5 w-5 text-amber-600" /></div>
            <div>
              <p className="text-2xl font-bold">
                {todayAppointments.filter((a) => a.status === "CONFIRMED").length}
              </p>
              <p className="text-xs text-muted-foreground">Waiting Today</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex items-center justify-between mb-4">
        <CardTitle>Today&apos;s Patients</CardTitle>
        <Link href="/doctor/appointments">
          <Button variant="ghost" size="sm">View All</Button>
        </Link>
      </div>

      {todayAppointments.length === 0 ? (
        <Card>
          <p className="text-center py-8 text-muted-foreground">No appointments today</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {todayAppointments.map((apt) => (
            <Card key={apt.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-sm font-bold text-green-700">{apt.patient.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium">{apt.patient.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(apt.startTime)} - {formatTime(apt.endTime)}
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
