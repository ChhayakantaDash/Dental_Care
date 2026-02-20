"use client";

import { useState } from "react";
import { updateAppointmentStatus } from "@/lib/actions/appointments";
import { createPrescription } from "@/lib/actions/prescriptions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { FileText, Check, X, UserCheck } from "lucide-react";

interface Props {
  appointmentId: string;
  status: string;
  hasPrescription: boolean;
  patientName: string;
}

export function DoctorAppointmentActions({ appointmentId, status, hasPrescription, patientName }: Props) {
  const router = useRouter();
  const [showPrescription, setShowPrescription] = useState(false);
  const [loading, setLoading] = useState(false);
  const [medications, setMedications] = useState([
    { name: "", dosage: "", frequency: "", duration: "" },
  ]);
  const [tokenLoading, setTokenLoading] = useState(false);

  async function handleStatusChange(newStatus: "ARRIVED" | "COMPLETED" | "NO_SHOW") {
    const result = await updateAppointmentStatus(appointmentId, newStatus);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Status updated to ${newStatus.replace(/_/g, " ")}`);
      router.refresh();
    }
  }

  async function handlePrescription(formData: FormData) {
    setLoading(true);
    formData.set("appointmentId", appointmentId);
    formData.set("medications", JSON.stringify(medications.filter((m) => m.name)));

    const result = await createPrescription(formData);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Prescription saved");
      setShowPrescription(false);
      router.refresh();
    }
    setLoading(false);
  }

  function addMedication() {
    setMedications([...medications, { name: "", dosage: "", frequency: "", duration: "" }]);
  }

  function updateMedication(index: number, field: string, value: string) {
    const updated = [...medications];
    updated[index] = { ...updated[index], [field]: value };
    setMedications(updated);
  }

  function removeMedication(index: number) {
    setMedications(medications.filter((_, i) => i !== index));
  }

  async function handleTokenUpdate(s: "IN_PROGRESS" | "COMPLETED" | "SKIPPED") {
    setTokenLoading(true);
    try {
      const res = await fetch('/api/appointments/update-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId, tokenStatus: s }),
      });
      const text = await res.text();
      let data: any;
      try { data = JSON.parse(text); } catch { data = { error: text } }
      if (!res.ok) {
        toast.error(data.error || `HTTP ${res.status}`);
      } else if (data.error) {
        toast.error(data.error);
      } else {
        toast.success('Token status updated');
        router.refresh();
      }
    } catch (err) { toast.error('Failed to update token'); }
    setTokenLoading(false);
  }

  return (
    <>
      <div className="flex gap-2 flex-wrap">
        {status === "CONFIRMED" && (
          <Button size="sm" variant="outline" onClick={() => handleStatusChange("ARRIVED")} className="gap-1">
            <UserCheck className="h-3 w-3" /> Arrived
          </Button>
        )}
        {(status === "CONFIRMED" || status === "ARRIVED") && (
          <>
            <Button size="sm" onClick={() => handleStatusChange("COMPLETED")} className="gap-1 bg-green-600 hover:bg-green-700 text-white">
              <Check className="h-3 w-3" /> Complete
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleStatusChange("NO_SHOW")} className="gap-1">
              <X className="h-3 w-3" /> No Show
            </Button>
          </>
        )}
        {(status === "COMPLETED" || status === "ARRIVED") && (
          <Button size="sm" variant="outline" onClick={() => setShowPrescription(true)} className="gap-1">
            <FileText className="h-3 w-3" /> {hasPrescription ? "Edit" : "Add"} Rx
          </Button>
        )}
        <div className="flex gap-1">
          <Button size="sm" variant="secondary" onClick={() => handleTokenUpdate('IN_PROGRESS')} disabled={tokenLoading}>Start</Button>
          <Button size="sm" variant="outline" onClick={() => handleTokenUpdate('COMPLETED')} disabled={tokenLoading}>Done</Button>
          <Button size="sm" variant="ghost" onClick={() => handleTokenUpdate('SKIPPED')} disabled={tokenLoading}>Skip</Button>
        </div>
      </div>

      <Modal open={showPrescription} onClose={() => setShowPrescription(false)} title={`Prescription for ${patientName}`} className="max-w-2xl">
        <form action={handlePrescription} className="space-y-4">
          <Textarea name="diagnosis" label="Diagnosis" placeholder="Enter diagnosis..." required />

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Medications</label>
              <Button type="button" variant="ghost" size="sm" onClick={addMedication}>
                + Add Medicine
              </Button>
            </div>
            <div className="space-y-3">
              {medications.map((med, i) => (
                <div key={i} className="grid grid-cols-4 gap-2 items-end">
                  <Input
                    placeholder="Medicine"
                    value={med.name}
                    onChange={(e) => updateMedication(i, "name", e.target.value)}
                  />
                  <Input
                    placeholder="Dosage"
        
                    value={med.dosage}
                    onChange={(e) => updateMedication(i, "dosage", e.target.value)}
                  />
                  <Input
                    placeholder="Frequency"
                    value={med.frequency}
                    onChange={(e) => updateMedication(i, "frequency", e.target.value)}
                  />
                  <div className="flex gap-1">
                    <Input
                      placeholder="Duration"
                      value={med.duration}
                      onChange={(e) => updateMedication(i, "duration", e.target.value)}
                    />
                    {medications.length > 1 && (
                      <button type="button" onClick={() => removeMedication(i)} className="px-2 text-destructive hover:bg-destructive/10 rounded">
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Textarea name="instructions" label="Instructions (optional)" placeholder="Special instructions for the patient..." />

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setShowPrescription(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Save Prescription
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
