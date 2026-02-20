import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency, DAY_NAMES } from "@/lib/utils";
import { Star, Clock, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";

export default async function DoctorsPage() {
  const session = await getSession();
  const doctors = await prisma.doctor.findMany({
    where: { user: { isActive: true } },
    include: {
      user: true,
      availability: { where: { isActive: true }, orderBy: { dayOfWeek: "asc" } },
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-40 border-b border-border bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-bold">D</div>
            <span className="text-xl font-bold">Dental Clinic</span>
          </Link>
          <div className="flex items-center gap-3">
            {session ? (
              <Link href={session.role === "ADMIN" ? "/admin" : session.role === "DOCTOR" ? "/doctor" : "/patient"}>
                <Button size="sm">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login"><Button variant="ghost" size="sm">Login</Button></Link>
                <Link href="/register"><Button size="sm">Register</Button></Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-2">Our Doctors</h1>
        <p className="text-muted-foreground mb-8">Choose a specialist and book your appointment</p>

        {doctors.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">No doctors available at this time.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doc) => (
              <div key={doc.id} className="bg-white rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xl font-bold text-primary">{doc.user.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">{doc.user.name}</h3>
                    <p className="text-sm text-primary font-medium">{doc.specialization}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <GraduationCap className="h-4 w-4" />
                    <span>{doc.qualification}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="h-4 w-4 text-warning" />
                    <span>{doc.experience} years experience</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {doc.availability.length > 0
                        ? doc.availability.map((a) => DAY_NAMES[a.dayOfWeek].slice(0, 3)).join(", ")
                        : "Schedule pending"}
                    </span>
                  </div>
                </div>

                {doc.bio && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{doc.bio}</p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="text-lg font-bold text-accent">{formatCurrency(Number(doc.consultationFee))}</span>
                  <Link href={session ? `/patient/book?doctor=${doc.id}` : "/register"}>
                    <Button size="sm">Book Now</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
