import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import {
  Calendar,
  Clock,
  Shield,
  Users,
  Star,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Carousel from "@/components/hero/carousel";

export default async function HomePage() {
  const session = await getSession();
  const settings = await prisma.clinicSettings.findFirst();
  const doctors = await prisma.doctor.findMany({
    where: { user: { isActive: true } },
    include: { user: true },
    take: 4,
  });
  const gallery = await prisma.galleryImage.findMany({
    take: 6,
    orderBy: { createdAt: "desc" },
  });
  const heroImages = await prisma.galleryImage.findMany({
    where: { category: "hero" },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  const dashboardLink = session
    ? session.role === "ADMIN"
      ? "/admin"
      : session.role === "DOCTOR"
        ? "/doctor"
        : "/patient"
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-border bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-bold text-lg">
              D
            </div>
            <span className="text-xl font-bold text-foreground">
              {settings?.clinicName || "Dental Clinic"}
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/doctors" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Doctors
            </Link>
            <Link href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {session ? (
              <Link href={dashboardLink!}>
                <Button size="sm">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Book Appointment</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="mx-auto max-w-7xl px-4 py-20 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
                Your Smile, <br />
                <span className="text-primary">Our Priority</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-lg">
                {settings?.about ||
                  "Experience world-class dental care with easy online booking. Choose your doctor, pick a slot, and manage your appointments seamlessly."}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/register">
                  <Button size="lg" className="gap-2">
                    Book Appointment <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/doctors">
                  <Button variant="outline" size="lg">
                    View Doctors
                  </Button>
                </Link>
              </div>
              <div className="mt-10 flex gap-8">
                <div>
                  <div className="text-2xl font-bold text-foreground">500+</div>
                  <div className="text-sm text-muted-foreground">Happy Patients</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{doctors.length}+</div>
                  <div className="text-sm text-muted-foreground">Expert Doctors</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">10+</div>
                  <div className="text-sm text-muted-foreground">Years Experience</div>
                </div>
              </div>
            </div>
            <div className="hidden md:block lg:col-span-7">
              {
                // Use explicit hero image from settings if available, otherwise use latest gallery images
              }
              {
                (() => {
                  const carouselImages = settings?.heroImage
                    ? [settings.heroImage]
                    : heroImages && heroImages.length > 0
                    ? heroImages.slice(0, 3).map((g) => g.url)
                    : gallery && gallery.length > 0
                    ? gallery.slice(0, 3).map((g) => g.url)
                    : ["/hero1.svg", "/hero2.svg", "/hero3.svg"];
                  return <Carousel images={carouselImages} interval={4500} />;
                })()
              }
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">Why Choose Us</h2>
            <p className="mt-3 text-muted-foreground">
              Simple, secure, and convenient healthcare management
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Calendar, title: "Easy Booking", desc: "Book appointments online in just a few clicks" },
              { icon: Clock, title: "Real-time Slots", desc: "See available slots and book instantly" },
              { icon: Shield, title: "Secure Records", desc: "Your medical history is safe and always accessible" },
              { icon: Users, title: "Expert Doctors", desc: "Choose from our team of experienced specialists" },
            ].map((feature) => (
              <div key={feature.title} className="text-center p-6 rounded-xl hover:bg-secondary/50 transition-colors">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Doctors Preview */}
      {doctors.length > 0 && (
        <section className="py-20 bg-secondary/30">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-foreground">Our Doctors</h2>
                <p className="mt-2 text-muted-foreground">Meet our expert dental team</p>
              </div>
              <Link href="/doctors">
                <Button variant="outline" className="gap-2">
                  View All <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              {doctors.map((doc) => (
                <div key={doc.id} className="bg-white rounded-xl p-6 border border-border hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <span className="text-xl font-bold text-primary">{doc.user.name.charAt(0)}</span>
                  </div>
                  <h3 className="font-semibold text-foreground">{doc.user.name}</h3>
                  <p className="text-sm text-primary">{doc.specialization}</p>
                  <p className="text-xs text-muted-foreground mt-1">{doc.qualification}</p>
                  <div className="mt-3 flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 text-warning fill-warning" />
                    <span className="text-muted-foreground">{doc.experience} yrs exp</span>
                  </div>
                  <div className="mt-3 text-sm font-semibold text-accent">
                    {formatCurrency(Number(doc.consultationFee))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {gallery.length > 0 && (
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground">Our Clinic</h2>
              <p className="mt-2 text-muted-foreground">Take a look inside</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {gallery.map((img) => (
                <div key={img.id} className="aspect-[4/3] overflow-hidden rounded-xl">
                  <img
                    src={img.url}
                    alt={img.caption || "Gallery"}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      <section id="contact" className="py-20 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">Get in Touch</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {settings?.phone && (
              <div className="flex flex-col items-center p-6 rounded-xl bg-white border border-border">
                <Phone className="h-8 w-8 text-primary mb-3" />
                <span className="text-sm text-muted-foreground">Phone</span>
                <span className="font-medium">{settings.phone}</span>
              </div>
            )}
            {settings?.email && (
              <div className="flex flex-col items-center p-6 rounded-xl bg-white border border-border">
                <Mail className="h-8 w-8 text-primary mb-3" />
                <span className="text-sm text-muted-foreground">Email</span>
                <span className="font-medium">{settings.email}</span>
              </div>
            )}
            {settings?.address && (
              <div className="flex flex-col items-center p-6 rounded-xl bg-white border border-border">
                <MapPin className="h-8 w-8 text-primary mb-3" />
                <span className="text-sm text-muted-foreground">Address</span>
                <span className="font-medium text-center">{settings.address}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {settings?.clinicName || "Dental Clinic"}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
