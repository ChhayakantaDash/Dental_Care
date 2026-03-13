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
  CheckCircle2,
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
    <div className="min-h-screen bg-[#FAFAFA] selection:bg-primary/20">
      {/* Navbar with Glassmorphism */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/20 bg-white/70 backdrop-blur-lg shadow-sm">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex justify-center items-center h-10 w-10 md:h-12 md:w-12 rounded-xl bg-gradient-to-br from-primary to-blue-700 text-white font-black text-xl shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform duration-300">
              D
            </div>
            <span className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">
              {settings?.clinicName || "Dental Clinic"}
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8 px-6 py-2 rounded-full bg-slate-50/50 border border-slate-200/50">
            <Link href="/doctors" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
              Our Doctors
            </Link>
            <Link href="#about" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
              About Clinic
            </Link>
            <Link href="#contact" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
              Contact
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {session ? (
              <Link href={dashboardLink!}>
                <Button className="rounded-full shadow-md hover:shadow-lg transition-all px-6">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login" className="hidden sm:block">
                  <Button variant="ghost" className="rounded-full font-medium text-slate-600 hover:text-slate-900">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button className="rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5 px-6 font-semibold">
                    Book Now
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[100px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-accent/10 blur-[120px]" />
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-6 lg:pr-8 text-center lg:text-left z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100/50 text-blue-700 text-sm font-medium mb-8 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Accepting New Patients
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                Perfect Your <br />
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent inline-block pb-2">
                  Beautiful Smile
                </span>
              </h1>
              
              <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-light">
                {settings?.about ||
                  "Experience world-class dental care with a gentle touch. Our expert team uses advanced technology to give you the smile you've always dreamed of."}
              </p>
              
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto rounded-full h-14 px-8 text-base shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-1 gap-2">
                    Book Appointment <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/doctors">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-full h-14 px-8 text-base border-slate-200 hover:bg-slate-50 transition-all">
                    Meet Our Doctors
                  </Button>
                </Link>
              </div>
              
              <div className="mt-14 pt-8 border-t border-slate-200/60 hidden sm:flex gap-10 justify-center lg:justify-start">
                <div>
                  <div className="text-3xl font-bold text-slate-900">500<span className="text-primary">+</span></div>
                  <div className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-wider">Happy Patients</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">{doctors.length}<span className="text-primary">+</span></div>
                  <div className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-wider">Expert Doctors</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">10<span className="text-primary">+</span></div>
                  <div className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-wider">Years Experience</div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-6 relative z-10 mx-auto w-full max-w-2xl lg:max-w-none">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-[2.5rem] transform translate-y-4 -translate-x-4 -z-10 blur-xl"></div>
              <div className="absolute inset-0 bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 transform translate-y-2 translate-x-2 -z-10"></div>
              
              <div className="rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl relative bg-slate-100 h-[350px] sm:h-[450px] lg:h-[550px] w-full">
                {(() => {
                  const images = [];
                  if (settings?.heroImage) images.push(settings.heroImage);
                  if (heroImages?.length) images.push(...heroImages.map(g => g.url));
                  if (gallery?.length) images.push(...gallery.map(g => g.url));
                  
                  // Filter out duplicates
                  const uniqueImages = Array.from(new Set(images)).slice(0, 5);
                  
                  if (uniqueImages.length === 0) {
                    uniqueImages.push("/hero1.svg", "/hero2.svg", "/hero3.svg");
                  }

                  return <Carousel images={uniqueImages} interval={5000} />;
                })()}
              </div>
              
              {/* Floating Rating Badge */}
              <div className="absolute -bottom-6 -left-6 sm:-left-10 z-[60] bg-white p-4 sm:p-5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 sm:gap-4 animate-bounce hover:animate-none transition-all duration-300">
                <div className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <Star className="h-5 w-5 sm:h-6 sm:w-6 fill-current" />
                </div>
                <div>
                  <div className="text-sm sm:text-base font-bold text-slate-900 whitespace-nowrap">4.9/5 Rating</div>
                  <div className="text-[10px] sm:text-xs text-slate-500 whitespace-nowrap">Based on Google Reviews</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services/Features */}
      <section className="py-24 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-3">Why Choose Us</h2>
            <h3 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">Exceptional Care <br/> For Your Teeth</h3>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Calendar, title: "Easy Booking", desc: "Schedule your visit instantly through our seamless online platform." },
              { icon: Clock, title: "Zero Wait Time", desc: "Real-time slots tracking guarantees you are seen precisely on time." },
              { icon: Shield, title: "Modern Safety", desc: "State-of-the-art sterilization and secure digital medical records." },
              { icon: Users, title: "Elite Team", desc: "Highly qualified specialists dedicated to your perfect smile." },
            ].map((feature, i) => (
              <div key={feature.title} className="group relative p-8 rounded-3xl bg-white border border-slate-100 hover:border-primary/20 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-600 group-hover:bg-primary group-hover:text-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm">
                  <feature.icon className="h-8 w-8" strokeWidth={1.5} />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3 text-center">{feature.title}</h4>
                <p className="text-sm text-slate-600 leading-relaxed text-center">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Doctors Preview */}
      {doctors.length > 0 && (
        <section className="py-24 bg-white relative overflow-hidden">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-slate-50 rounded-full blur-[100px] -z-10" />
          
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div className="max-w-xl">
                <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-3">Medical Experts</h2>
                <h3 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">Meet Our Specialists</h3>
              </div>
              <Link href="/doctors">
                <Button variant="ghost" className="gap-2 text-primary hover:bg-primary/5 rounded-full font-semibold">
                  View full team <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {doctors.map((doc) => (
                <div key={doc.id} className="group bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-2xl hover:border-transparent transition-all duration-300 transform hover:-translate-y-1">
                  <div className="aspect-square rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mb-6 overflow-hidden relative border border-slate-100">
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors" />
                    <span className="text-4xl font-black text-slate-300 uppercase select-none group-hover:scale-110 group-hover:text-primary/20 transition-all duration-500">
                      {doc.user.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">{doc.user.name}</h4>
                    <p className="text-sm font-medium text-accent mb-3">{doc.specialization}</p>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-md text-xs font-semibold text-amber-600">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        {doc.experience} Yrs
                      </div>
                      <div className="text-sm font-bold text-slate-700">
                        {formatCurrency(Number(doc.consultationFee))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery Section */}
      {gallery.length > 0 && (
        <section className="py-24 bg-slate-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-3">Facility</h2>
              <h3 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">World-Class Clinic</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {gallery.map((img, i) => (
                <div key={img.id} className={`group relative overflow-hidden rounded-2xl md:rounded-[2rem] bg-slate-200 ${i === 0 ? "md:col-span-2 md:row-span-2 aspect-auto" : "aspect-square"}`}>
                  <img
                    src={img.url}
                    alt={img.caption || "Clinic facility"}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-700 opacity-90" />
        
        <div className="relative mx-auto max-w-4xl px-6 lg:px-8 text-center text-white z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">Ready to transform your smile?</h2>
          <p className="text-blue-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            Book your consultation today and take the first step towards perfect dental health.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto h-14 rounded-full px-8 text-lg font-semibold bg-white text-primary hover:bg-slate-50 hover:scale-105 transition-all shadow-xl">
                Book Online Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-slate-900 text-slate-300 py-16 lg:py-20 border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-6 text-white text-2xl font-bold">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white text-base">
                  D
                </div>
                {settings?.clinicName || "Dental Clinic"}
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xs">
                 Providing premium dental care and creating beautiful smiles in a comfortable, modern environment.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 tracking-wider text-sm uppercase">Quick Links</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
                <li><Link href="/doctors" className="hover:text-primary transition-colors">Our Doctors</Link></li>
                <li><Link href="/login" className="hover:text-primary transition-colors">Patient Portal</Link></li>
                <li><Link href="/register" className="hover:text-primary transition-colors">Book Appointment</Link></li>
              </ul>
            </div>
            
            <div className="lg:col-span-2">
              <h4 className="text-white font-bold mb-6 tracking-wider text-sm uppercase">Contact Us</h4>
              <div className="grid sm:grid-cols-2 gap-6">
                {settings?.phone && (
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors">
                    <div className="mt-1 p-2 rounded-lg bg-primary/20 text-primary-foreground text-blue-400">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Phone</div>
                      <div className="text-slate-200 font-medium">{settings.phone}</div>
                    </div>
                  </div>
                )}
                {settings?.email && (
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors">
                    <div className="mt-1 p-2 rounded-lg bg-primary/20 text-primary-foreground text-blue-400">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email</div>
                      <div className="text-slate-200 font-medium">{settings.email}</div>
                    </div>
                  </div>
                )}
                {settings?.address && (
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 sm:col-span-2 hover:bg-slate-800 transition-colors">
                    <div className="mt-1 p-2 rounded-lg bg-primary/20 text-primary-foreground text-blue-400">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Clinic Address</div>
                      <div className="text-slate-200 font-medium leading-relaxed">{settings.address}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500 font-medium">
            <p>&copy; {new Date().getFullYear()} {settings?.clinicName || "Dental Clinic"}. All rights reserved.</p>
            <div className="flex gap-6">
              <span className="hover:text-slate-300 cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-slate-300 cursor-pointer transition-colors">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
