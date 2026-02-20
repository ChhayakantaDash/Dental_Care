"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { bookAppointment, getAvailableSlots } from "@/lib/actions/appointments";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatTime, formatCurrency, DAY_NAMES } from "@/lib/utils";
import toast from "react-hot-toast";
import { Calendar, Clock, User } from "lucide-react";

interface Doctor {
  id: string;
  specialization: string;
  consultationFee: string;
  user: { name: string };
  availability: { dayOfWeek: number; startTime: string; endTime: string }[];
}

interface Slot {
  start: string;
  end: string;
  available: boolean;
}

export default function BookAppointmentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const preselectedDoctor = searchParams.get("doctor");

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>(preselectedDoctor || "");
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [slotsMessage, setSlotsMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    fetch("/api/public/doctors")
      .then((r) => r.json())
      .then((d) => setDoctors(d.data || []));
  }, []);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      setLoadingSlots(true);
      setSelectedSlot(null);
      getAvailableSlots(selectedDoctor, selectedDate).then((result) => {
        setSlots(result.slots || []);
        setSlotsMessage(result.message || "");
        setLoadingSlots(false);
      });
    }
  }, [selectedDoctor, selectedDate]);

  const doctor = doctors.find((d) => d.id === selectedDoctor);
  const today = new Date().toISOString().split("T")[0];

  async function handleBook() {
    if (!selectedDoctor || !selectedDate || !selectedSlot) return;
    setLoading(true);
    const fd = new FormData();
    fd.set("doctorId", selectedDoctor);
    fd.set("date", selectedDate);
    fd.set("startTime", selectedSlot.start);
    fd.set("endTime", selectedSlot.end);

    const result = await bookAppointment(fd);
    if (result.error) {
      toast.error(result.error);
      setLoading(false);
    } else {
      toast.success("Appointment booked! Complete payment to confirm.");
      router.push(`/patient/appointments`);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Book Appointment</h1>
      <p className="text-muted-foreground mb-8">Search doctor, select date & slot</p>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Step 1: Select Doctor */}
        <Card>
          <CardTitle className="mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-primary" /> Select Doctor
          </CardTitle>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {doctors.map((doc) => (
              <button
                key={doc.id}
                onClick={() => { setSelectedDoctor(doc.id); setSelectedDate(""); setSlots([]); }}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedDoctor === doc.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <p className="font-medium">{doc.user.name}</p>
                <p className="text-sm text-primary">{doc.specialization}</p>
                <p className="text-sm text-accent font-semibold mt-1">
                  {formatCurrency(Number(doc.consultationFee))}
                </p>
                {doc.availability.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Available: {doc.availability.map((a) => DAY_NAMES[a.dayOfWeek].slice(0, 3)).join(", ")}
                  </p>
                )}
              </button>
            ))}
            {doctors.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Loading doctors...</p>
            )}
          </div>
        </Card>

        {/* Step 2: Select Date */}
        <Card>
          <CardTitle className="mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" /> Select Date
          </CardTitle>
          {selectedDoctor ? (
            <>
              <Input
                type="date"
                min={today}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              {doctor?.availability && doctor.availability.length > 0 && (
                <p className="text-xs text-muted-foreground mt-3">
                  Available on: {doctor.availability.map((a) => DAY_NAMES[a.dayOfWeek]).join(", ")}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">Select a doctor first</p>
          )}
        </Card>

        {/* Step 3: Select Slot */}
        <Card>
          <CardTitle className="mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" /> Select Slot
          </CardTitle>
          {loadingSlots ? (
            <p className="text-sm text-muted-foreground text-center py-8">Loading slots...</p>
          ) : slotsMessage ? (
            <p className="text-sm text-destructive text-center py-8">{slotsMessage}</p>
          ) : slots.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto">
              {slots.map((slot) => (
                <button
                  key={slot.start}
                  disabled={!slot.available}
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-2 rounded-lg text-sm border transition-colors ${
                    !slot.available
                      ? "border-border bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                      : selectedSlot?.start === slot.start
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/30"
                  }`}
                >
                  {formatTime(slot.start)}
                </button>
              ))}
            </div>
          ) : selectedDate ? (
            <p className="text-sm text-muted-foreground text-center py-8">No slots available</p>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">Select a date first</p>
          )}
        </Card>
      </div>

      {/* Summary & Confirm */}
      {selectedDoctor && selectedDate && selectedSlot && (
        <Card className="mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Booking Summary</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {doctor?.user.name} &middot; {selectedDate} &middot;{" "}
                {formatTime(selectedSlot.start)} - {formatTime(selectedSlot.end)}
              </p>
              <p className="text-sm font-semibold text-accent mt-1">
                Fee: {doctor && formatCurrency(Number(doctor.consultationFee))}
              </p>
            </div>
            <Button onClick={handleBook} loading={loading} size="lg">
              Confirm Booking
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
