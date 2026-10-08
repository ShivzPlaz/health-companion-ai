import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calendar, Clock, MapPin, Star, UserRound, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { toast } from "sonner";
import { getToken } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/api";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_authenticated/appointments")({
  head: () => ({ meta: [{ title: "Appointments — NexCure AI" }] }),
  component: AppointmentsPage,
});

type Doctor = {
  id: number;
  name: string;
  specialty: string;
  hospital: string;
  rating: string;
  image?: string;
};
type Appointment = { id: number; doctor: Doctor; date: string; time: string; status: string };

function AppointmentsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [bookingMode, setBookingMode] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/appointments`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) setAppointments(await res.json());
    } catch (e) {
      toast.error(t("appointments.load_error"));
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/doctors`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) setDoctors(await res.json());
    } catch (e) {
      toast.error(t("appointments.doctor_load_error"));
    }
  };

  const bookAppointment = async (doctorId: number) => {
    const dates = ["Tomorrow, 10:00 AM", "Tomorrow, 02:30 PM", "Next Monday, 11:15 AM"];
    const randomDate = dates[Math.floor(Math.random() * dates.length)];
    const [date, time] = randomDate.split(", ");

    try {
      const res = await fetch(`${API_BASE_URL}/api/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ doctor_id: doctorId, date, time }),
      });
      if (res.ok) {
        toast.success(t("appointments.book_success"));
        setBookingMode(false);
        fetchAppointments();
      }
    } catch (e) {
      toast.error(t("appointments.book_error"));
    }
  };

  const cancelAppointment = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/appointments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        toast.success(t("appointments.cancel_success"));
        fetchAppointments();
      }
    } catch (e) {
      toast.error(t("appointments.cancel_error"));
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-transparent">
      <header className="flex items-center justify-between border-b border-border/60 glass px-4 py-3 sm:px-6">
        <div>
          <h1 className="text-sm font-semibold">{t("appointments.title")}</h1>
          <p className="text-xs text-muted-foreground">{t("appointments.subtitle")}</p>
        </div>
        <ThemeToggle />
      </header>

      <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-6 max-w-5xl mx-auto w-full">
        {!bookingMode ? (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{t("appointments.consultations")}</h2>
              <Button
                onClick={() => setBookingMode(true)}
                className="liquid-glass text-foreground shadow-soft hover:opacity-95 border border-border/50"
              >
                <Plus className="mr-2 h-4 w-4" /> {t("appointments.book_new")}
              </Button>
            </div>

            {appointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl border-dashed glass">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">{t("appointments.no_appointments")}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("appointments.no_upcoming")}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {appointments.map((apt) => (
                  <Card key={apt.id} className="p-4 flex flex-col gap-4 relative group liquid-glass">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <UserRound className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{apt.doctor.name}</p>
                          <p className="text-xs text-muted-foreground">{apt.doctor.specialty}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="secondary" className="capitalize">
                          {apt.status}
                        </Badge>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-6 px-2 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => cancelAppointment(apt.id)}
                        >
                          {t("appointments.cancel")}
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 text-sm text-muted-foreground glass p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-primary" /> {apt.date}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-primary" /> {apt.time}
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-border/30 pt-2 mt-1">
                        <p className="text-xs font-medium text-foreground">
                          {t("appointments.prescribed_medicine")}
                        </p>
                        <p className="text-xs italic mt-0.5">{t("appointments.prescribed_desc")}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => setBookingMode(false)}>
                ← {t("appointments.back")}
              </Button>
              <h2 className="text-xl font-semibold">{t("appointments.select_doctor")}</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {doctors.map((doc) => (
                <Card
                  key={doc.id}
                  className="p-5 flex flex-col gap-4 hover:border-primary/50 transition-colors liquid-glass"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <UserRound className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold">{doc.name}</p>
                      <p className="text-sm text-muted-foreground">{doc.specialty}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> {doc.hospital}
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" /> {doc.rating}{" "}
                      {t("appointments.rating")}
                    </div>
                  </div>
                  <Button
                    onClick={() => bookAppointment(doc.id)}
                    className="w-full mt-2"
                    variant="secondary"
                  >
                    {t("appointments.book_consultation")}
                  </Button>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
