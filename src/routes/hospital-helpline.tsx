import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  Navigation,
  Activity,
  Clock,
  ShieldPlus,
  Users,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/hospital-helpline")({
  head: () => ({
    meta: [
      { title: "Emergency Hospital Helpline — NexCure AI" },
      {
        name: "description",
        content:
          "Connect directly with the nearest hospital emergency desk for immediate guidance.",
      },
    ],
  }),
  component: HospitalHelpline,
});

const hospitals = [
  {
    name: "Apollo Hospital",
    distance: "1.2 km",
    status: "Available",
    wait: "5 mins",
    specialties: ["Cardiology", "Trauma", "Neurology"],
    doctors: 12,
    beds: 15,
  },
  {
    name: "Manipal Hospital",
    distance: "2.5 km",
    status: "Available",
    wait: "12 mins",
    specialties: ["Orthopedics", "Pediatrics", "General"],
    doctors: 8,
    beds: 5,
  },
  {
    name: "Fortis Hospital",
    distance: "3.8 km",
    status: "High Traffic",
    wait: "45 mins",
    specialties: ["Oncology", "Trauma", "Burns"],
    doctors: 15,
    beds: 2,
  },
  {
    name: "Narayana Health",
    distance: "5.1 km",
    status: "Available",
    wait: "2 mins",
    specialties: ["Cardiac", "Neurology"],
    doctors: 20,
    beds: 22,
  },
];

function HospitalHelpline() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f18] font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-border/40 px-4 py-4 md:px-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/emergency" })}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-bold text-xl flex items-center gap-2">
              <ShieldPlus className="h-5 w-5 text-blue-500" /> Emergency Hospital Assistance
            </h1>
            <p className="text-sm text-muted-foreground">
              Connecting you to the nearest emergency desks.
            </p>
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hospitals.map((hosp, idx) => (
            <Card
              key={idx}
              className="overflow-hidden border-border/50 shadow-lg hover:shadow-xl transition-all group bg-white dark:bg-slate-900"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{hosp.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Navigation className="h-3 w-3" /> {hosp.distance} away
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={hosp.status === "Available" ? "default" : "destructive"}
                    className={
                      hosp.status === "Available"
                        ? "bg-green-500 hover:bg-green-600"
                        : "animate-pulse"
                    }
                  >
                    {hosp.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-border/50">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Est. Wait Time
                    </div>
                    <div className="font-bold text-lg text-foreground">{hosp.wait}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> ICU Beds
                    </div>
                    <div className="font-bold text-lg text-foreground">
                      {hosp.beds}{" "}
                      <span className="text-xs font-normal text-muted-foreground">Available</span>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <Users className="h-3 w-3" /> Emergency Doctors on duty
                    </div>
                    <div className="font-bold text-foreground">{hosp.doctors} Specialists</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {hosp.specialties.map((spec) => (
                    <Badge
                      key={spec}
                      variant="secondary"
                      className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-none text-xs"
                    >
                      {spec}
                    </Badge>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button className="col-span-1 bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl shadow-md">
                    <Phone className="mr-2 h-4 w-4" /> Call
                  </Button>
                  <Button
                    variant="outline"
                    className="col-span-1 h-12 rounded-xl font-bold border-blue-200 dark:border-blue-900 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" /> Chat
                  </Button>
                  <Button
                    variant="outline"
                    className="col-span-1 h-12 rounded-xl font-bold border-border hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <Navigation className="mr-2 h-4 w-4" /> Route
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
