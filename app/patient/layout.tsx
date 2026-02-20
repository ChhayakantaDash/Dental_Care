import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { PatientSidebar } from "@/components/patient/sidebar";

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "PATIENT") redirect("/login");

  return (
    <div className="min-h-screen bg-secondary/30 flex">
      <PatientSidebar user={session} />
      <main className="flex-1 lg:ml-64">
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
