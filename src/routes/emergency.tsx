import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Ambulance, Hospital, ArrowLeft, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/emergency")({
  head: () => ({
    meta: [
      { title: "Emergency Medical Assistance — NexCure AI" },
      {
        name: "description",
        content:
          "Choose an emergency service: request an ambulance with live tracking or connect directly with a nearby hospital helpline.",
      },
    ],
  }),
  component: EmergencySelection,
});

function EmergencySelection() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen bg-transparent text-white flex flex-col relative overflow-hidden font-sans"
      role="alert"
      aria-live="assertive"
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-transparent to-transparent z-0 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-900/10 rounded-full blur-[150px] z-0 pointer-events-none" />
      <Activity className="absolute right-20 top-20 h-[500px] w-[500px] text-red-500/5 animate-pulse z-0 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 p-6 flex justify-between items-center">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: "/" })}
          className="text-red-200 hover:text-white hover:bg-red-900/50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 -mt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-3 bg-red-500/20 rounded-2xl border border-red-500/30 mb-6">
            <Activity className="h-8 w-8 text-red-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 drop-shadow-md">
            Emergency Medical Assistance
          </h1>
          <p className="text-red-200/80 text-lg max-w-lg mx-auto">
            Choose the emergency service you need.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          {/* Card 1: Ambulance */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="glass p-8 rounded-3xl flex flex-col items-center text-center h-full border border-red-500/30 shadow-2xl hover:shadow-[0_0_40px_rgba(229,57,53,0.3)] transition-all group">
              <div className="w-24 h-24 rounded-full bg-gradient-to-b from-red-500 to-red-700 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <Ambulance className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Call Ambulance</h2>
              <p className="text-red-200/80 mb-8 flex-1">
                Request the nearest available ambulance with live tracking to your exact location.
              </p>
              <Button
                onClick={() => navigate({ to: "/ambulance-tracking" })}
                className="w-full h-14 text-lg font-bold bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-lg border border-red-400/50"
              >
                Request Ambulance
              </Button>
            </div>
          </motion.div>

          {/* Card 2: Hospital Helpline */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="glass p-8 rounded-3xl flex flex-col items-center text-center h-full border border-blue-500/30 shadow-2xl hover:shadow-[0_0_40px_rgba(59,130,246,0.3)] transition-all group">
              <div className="w-24 h-24 rounded-full bg-gradient-to-b from-blue-500 to-blue-700 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <Hospital className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Emergency Hospital Helpline</h2>
              <p className="text-blue-200/80 mb-8 flex-1">
                Speak directly with the nearest hospital emergency desk for immediate guidance.
              </p>
              <Button
                onClick={() => navigate({ to: "/hospital-helpline" })}
                className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg border border-blue-400/50"
              >
                Call Hospital
              </Button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
