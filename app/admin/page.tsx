import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Card, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserCog,
  Calendar,
  CreditCard,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

export default async function AdminDashboard() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    totalPatients,
    totalDoctors,
    totalAppointments,
    todayAppointments,
    pendingPayments,
    verifiedPaymentsToday,
    totalRevenue,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "PATIENT" } }),
    prisma.doctor.count(),
    prisma.appointment.count(),
    prisma.appointment.count({
      where: { date: { gte: today, lt: tomorrow } },
    }),
    prisma.payment.count({ where: { status: "PENDING" } }),
    prisma.payment.findMany({
      where: {
        status: "VERIFIED",
        verifiedAt: { gte: today, lt: tomorrow },
      },
      select: { amount: true },
    }),
    prisma.payment.findMany({
      where: { status: "VERIFIED" },
      select: { amount: true },
    }),
  ]);

  const todayRevenue = verifiedPaymentsToday.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  );
  const totalRevenueAmount = totalRevenue.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  );

  const recentAppointments = await prisma.appointment.findMany({
    include: {
      patient: true,
      doctor: { include: { user: true } },
      payment: true,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Admin Dashboard</h1>
      <p className="text-muted-foreground mb-8">Clinic overview and management</p>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100"><Users className="h-5 w-5 text-blue-600" /></div>
            <div>
              <p className="text-2xl font-bold">{totalPatients}</p>
              <p className="text-xs text-muted-foreground">Patients</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100"><UserCog className="h-5 w-5 text-green-600" /></div>
            <div>
              <p className="text-2xl font-bold">{totalDoctors}</p>
              <p className="text-xs text-muted-foreground">Doctors</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100"><Calendar className="h-5 w-5 text-purple-600" /></div>
            <div>
              <p className="text-2xl font-bold">{todayAppointments}</p>
              <p className="text-xs text-muted-foreground">Today&apos;s Appointments</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100"><AlertCircle className="h-5 w-5 text-amber-600" /></div>
            <div>
              <p className="text-2xl font-bold">{pendingPayments}</p>
              <p className="text-xs text-muted-foreground">Pending Payments</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100"><TrendingUp className="h-5 w-5 text-green-600" /></div>
            <div>
              <p className="text-xl font-bold">{formatCurrency(todayRevenue)}</p>
              <p className="text-xs text-muted-foreground">Today&apos;s Revenue</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100"><CreditCard className="h-5 w-5 text-blue-600" /></div>
            <div>
              <p className="text-xl font-bold">{formatCurrency(totalRevenueAmount)}</p>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100"><CheckCircle className="h-5 w-5 text-purple-600" /></div>
            <div>
              <p className="text-xl font-bold">{totalAppointments}</p>
              <p className="text-xs text-muted-foreground">Total Appointments</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex items-center justify-between mb-4">
        <CardTitle>Recent Activity</CardTitle>
        <Link href="/admin/appointments"><Button variant="ghost" size="sm">View All</Button></Link>
      </div>

      <div className="space-y-3">
        {recentAppointments.map((apt) => (
          <Card key={apt.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{apt.patient.name} → Dr. {apt.doctor.user.name}</p>
                <p className="text-sm text-muted-foreground">
                  {apt.status.replace(/_/g, " ")} · {apt.payment ? formatCurrency(Number(apt.payment.amount)) : "N/A"}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(apt.createdAt).toLocaleDateString()}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
