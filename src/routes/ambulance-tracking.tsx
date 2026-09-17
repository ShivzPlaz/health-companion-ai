import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Ambulance,
  Phone,
  MessageSquare,
  Navigation,
  Activity,
  User,
  Star,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  MoreVertical,
  Map as MapIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/ambulance-tracking")({
  head: () => ({
    meta: [
      { title: "Ambulance Tracking — NexCure AI" },
      {
        name: "description",
        content:
          "Live ambulance tracking with real-time updates, driver info, and hospital destination.",
      },
    ],
  }),
  component: AmbulanceTracking,
});

function AmbulanceTracking() {
  const navigate = useNavigate();
  const [timelineStep, setTimelineStep] = useState(2); // 0: Request Sent, 1: Accepted, 2: Driver Assigned, 3: Started, etc.

  // Simulate progress — stop once all steps are complete
  useEffect(() => {
    const timer = setInterval(() => {
      setTimelineStep((prev) => {
        if (prev >= 6) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const timelineSteps = [
    { label: "Request Sent", time: "10:42 AM" },
    { label: "Ambulance Accepted", time: "10:43 AM" },
    { label: "Driver Assigned", time: "10:43 AM" },
    { label: "Ambulance Started", time: "10:44 AM" },
    { label: "Driver Near Patient", time: "Est. 10:48 AM" },
    { label: "Patient Picked Up", time: "Pending" },
    { label: "Hospital Arrival", time: "Pending" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-border/40 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/emergency" })}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-bold text-lg">Ambulance Tracking</h1>
            <p className="text-xs text-muted-foreground">Case #EMG-889021</p>
          </div>
        </div>
        <Badge variant="destructive" className="bg-red-500 animate-pulse">
          Live Emergency
        </Badge>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* Left Side: Map & Live Tracking (Full width on mobile, half on desktop) */}
        <div className="flex-1 relative bg-slate-200 dark:bg-slate-800 min-h-[400px] lg:min-h-full">
          {/* Mock Interactive Map */}
          <div className="absolute inset-0 bg-[#e5e3df] dark:bg-[#1a202c] overflow-hidden flex items-center justify-center">
            {/* Grid Pattern */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 2px 2px, rgba(0,0,0,0.2) 1px, transparent 0)",
                backgroundSize: "40px 40px",
              }}
            />
            <MapIcon className="h-32 w-32 text-black/10 dark:text-white/10 absolute" />

            {/* Map Roads (Mock SVG) */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none opacity-30"
              preserveAspectRatio="none"
            >
              <path
                d="M 10% 80% Q 30% 60% 50% 50% T 90% 20%"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
              />
              <path
                d="M 20% 90% Q 40% 70% 60% 60% T 100% 30%"
                fill="none"
                stroke="#ef4444"
                strokeWidth="4"
                strokeDasharray="10,10"
                className="animate-[dash_2s_linear_infinite]"
              />
            </svg>

            {/* Markers */}
            <div className="absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="bg-blue-500 text-white p-2 rounded-full shadow-lg border-2 border-white relative z-10">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="bg-white/90 dark:bg-black/90 px-2 py-1 rounded text-xs font-bold shadow-md mt-1 border border-border">
                Your Location
              </div>
              <div className="absolute inset-0 bg-blue-500/30 rounded-full animate-ping scale-150" />
            </div>

            <motion.div
              animate={{ left: ["20%", "45%"], top: ["90%", "55%"] }}
              transition={{ duration: 10, ease: "linear" }}
              className="absolute flex flex-col items-center"
            >
              <div className="bg-red-500 text-white p-2 rounded-full shadow-lg border-2 border-white relative z-20">
                <Ambulance className="h-5 w-5" />
              </div>
              <div className="bg-white/90 dark:bg-black/90 px-2 py-1 rounded text-xs font-bold shadow-md mt-1 border border-border text-red-600">
                4 min away
              </div>
            </motion.div>

            <div className="absolute right-[10%] top-[20%] flex flex-col items-center">
              <div className="bg-green-500 text-white p-2 rounded-full shadow-lg border-2 border-white relative z-10">
                <Activity className="h-5 w-5" />
              </div>
              <div className="bg-white/90 dark:bg-black/90 px-2 py-1 rounded text-xs font-bold shadow-md mt-1 border border-border">
                Apollo Hospital
              </div>
            </div>

            {/* Traffic Info overlay */}
            <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-2 rounded-lg shadow-md border border-border flex items-center gap-2 text-xs font-medium">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              Moderate Traffic
            </div>
          </div>
        </div>

        {/* Right Side: Dashboard Info */}
        <div className="w-full lg:w-[450px] bg-white dark:bg-slate-900 border-l border-border/40 flex flex-col h-[50vh] lg:h-full overflow-y-auto custom-scrollbar shadow-2xl relative z-10">
          <div className="p-4 space-y-4 pb-24">
            {/* Top Status Card */}
            <Card className="p-4 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="font-bold text-sm text-red-900 dark:text-red-100">
                    Ambulance Assigned
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-red-600 dark:text-red-500">
                    4 <span className="text-sm font-semibold text-red-400">min</span>
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">1.2 km remaining</div>
                </div>
              </div>
              {/* Progress bar */}
              <div className="h-2 w-full bg-red-200 dark:bg-red-900/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "20%" }}
                  animate={{ width: "60%" }}
                  transition={{ duration: 2 }}
                  className="h-full bg-red-600 rounded-full relative"
                >
                  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/30" />
                </motion.div>
              </div>
            </Card>

            {/* Driver Card */}
            <Card className="p-4 shadow-sm">
              <div className="flex gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-white dark:border-slate-700 overflow-hidden flex items-center justify-center shadow-sm">
                    <User className="h-6 w-6 text-slate-400" />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-border shadow-sm flex items-center gap-0.5">
                    4.9 <Star className="h-2 w-2 fill-yellow-400 text-yellow-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg leading-tight">Rajesh Kumar</h3>
                  <p className="text-xs text-muted-foreground font-medium mb-1">
                    ID: AMB-8821 • Exp: 8 Yrs
                  </p>
                  <Badge
                    variant="outline"
                    className="bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                  >
                    KA-01-AB-1234
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold">
                  <Phone className="mr-2 h-4 w-4" /> Call Driver
                </Button>
                <Button variant="outline" className="w-full font-semibold">
                  <MessageSquare className="mr-2 h-4 w-4" /> Message
                </Button>
              </div>
            </Card>

            {/* Hospital Info */}
            <Card className="p-4 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 flex items-center justify-center shrink-0">
                <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold">Apollo Hospital</h3>
                  <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                    Level 1 Trauma
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground font-medium mb-2">Distance: 3.2 km</p>
                <div className="flex items-center gap-2 text-xs font-semibold text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-3 w-3" /> ICU Beds Available: 12
                </div>
              </div>
            </Card>

            {/* Live Timeline Stepper */}
            <div className="pt-2">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Live Updates
              </h3>
              <div className="space-y-0 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-800 before:to-transparent">
                {timelineSteps.map((step, idx) => {
                  const isCompleted = idx < timelineStep;
                  const isCurrent = idx === timelineStep;
                  return (
                    <div
                      key={idx}
                      className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group pb-4 pl-8 md:pl-0"
                    >
                      {/* Marker */}
                      <div
                        className={`absolute left-0 md:left-1/2 -translate-x-1/2 flex items-center justify-center w-6 h-6 rounded-full border-2 ${isCompleted ? "bg-primary border-primary text-white" : isCurrent ? "bg-background border-primary text-primary" : "bg-background border-muted text-muted-foreground"}`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <div
                            className={`w-2 h-2 rounded-full ${isCurrent ? "bg-primary animate-pulse" : "bg-transparent"}`}
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div
                        className={`w-full md:w-[calc(50%-2rem)] p-3 rounded-lg border ${isCurrent ? "bg-primary/5 border-primary/20 shadow-sm" : "bg-transparent border-transparent"} transition-colors`}
                      >
                        <div className="flex flex-col md:group-odd:items-end md:group-even:items-start">
                          <h4
                            className={`text-sm font-semibold ${isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"}`}
                          >
                            {step.label}
                          </h4>
                          <span className="text-xs text-muted-foreground font-medium">
                            {step.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Chat Bar */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-border shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)]">
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="shrink-0 rounded-full">
                <AlertCircle className="h-4 w-4 text-red-500" />
              </Button>
              <Input
                placeholder="Message driver..."
                className="rounded-full bg-slate-100 dark:bg-slate-800 border-none focus-visible:ring-1"
              />
              <Button size="icon" className="shrink-0 rounded-full bg-primary hover:bg-primary/90">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
