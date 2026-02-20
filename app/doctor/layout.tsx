import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DoctorSidebar } from "@/components/doctor/sidebar";

export default async function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "DOCTOR") redirect("/login");

  return (
    <div className="min-h-screen bg-green-50/30 flex">
      <DoctorSidebar user={session} />
      <main className="flex-1 lg:ml-64">
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
