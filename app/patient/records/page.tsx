import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { FileText, Download } from "lucide-react";

export default async function PatientRecordsPage() {
  const session = await getSession();
  if (!session) return null;

  const records = await prisma.medicalRecord.findMany({
    where: { patientId: session.id },
    orderBy: { visitDate: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Medical Records</h1>
      <p className="text-muted-foreground mb-8">Your complete medical history</p>

      {records.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No medical records yet</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {records.map((record) => {
            let medications: { name: string; dosage: string; frequency: string; duration: string }[] = [];
            try {
              medications = record.prescription ? JSON.parse(record.prescription) : [];
            } catch {
              // Not JSON format
            }

            return (
              <Card key={record.id} className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">{record.diagnosis}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(record.visitDate)} &middot; Dr. {record.doctorName}
                    </p>
                  </div>
                </div>

                {medications.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Medications</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Medicine</th>
                            <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Dosage</th>
                            <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Frequency</th>
                            <th className="text-left py-2 text-muted-foreground font-medium">Duration</th>
                          </tr>
                        </thead>
                        <tbody>
                          {medications.map((med, i) => (
                            <tr key={i} className="border-b border-border/50">
                              <td className="py-2 pr-4">{med.name}</td>
                              <td className="py-2 pr-4">{med.dosage}</td>
                              <td className="py-2 pr-4">{med.frequency}</td>
                              <td className="py-2">{med.duration}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {record.notes && (
                  <div className="mt-3">
                    <p className="text-sm font-medium">Notes</p>
                    <p className="text-sm text-muted-foreground mt-1">{record.notes}</p>
                  </div>
                )}

                {record.attachments.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium mb-2">Attachments</p>
                    <div className="flex gap-2 flex-wrap">
                      {record.attachments.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          <Download className="h-3 w-3" /> Report {i + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
