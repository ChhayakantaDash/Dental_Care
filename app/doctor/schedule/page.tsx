import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { DAY_NAMES, formatTime } from "@/lib/utils";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScheduleForm } from "@/components/doctor/schedule-form";

export default async function DoctorSchedulePage() {
  const session = await getSession();
  if (!session) return null;

  const doctor = await prisma.doctor.findUnique({
    where: { userId: session.id },
    include: {
      availability: { orderBy: { dayOfWeek: "asc" } },
    },
  });

  if (!doctor) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">My Schedule</h1>
      <p className="text-muted-foreground mb-8">Manage your availability and working hours</p>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardTitle className="mb-4">Current Schedule</CardTitle>
          {doctor.availability.length === 0 ? (
            <p className="text-sm text-muted-foreground">No schedule set. Add your availability.</p>
          ) : (
            <div className="space-y-3">
              {doctor.availability.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border"
                >
                  <div>
                    <p className="font-medium">{DAY_NAMES[slot.dayOfWeek]}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)} ({slot.slotDuration} min slots)
                    </p>
                  </div>
                  <Badge variant={slot.isActive ? "CONFIRMED" : "CANCELLED"}>
                    {slot.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <ScheduleForm doctorId={doctor.id} />
      </div>
    </div>
  );
}
