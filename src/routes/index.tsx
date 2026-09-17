import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Lock,
  Mail,
  ShieldCheck,
  User as UserIcon,
  Activity,
  HeartPulse,
  Shield,
  Cloud,
  Database,
  CheckCircle,
  Ambulance,
  Fingerprint,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { signIn } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/api";
import { toast } from "sonner";
import { useTheme } from "next-themes";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NexCure AI — Smart Healthcare. Faster Diagnosis." },
      {
        name: "description",
        content: "AI-Powered Telemedicine Platform with NLP-Based Automated Symptom Triage",
      },
    ],
  }),
  component: MedicalHealthcareLanding,
});

// --- Main Component ---
function MedicalHealthcareLanding() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="flex min-h-screen flex-col font-sans">
      {/* Unified Background Main */}
      <main className="flex flex-1 flex-col lg:flex-row w-full h-full relative bg-[#f4f7fb] dark:bg-slate-950 overflow-hidden">
        {/* Background Ambience for Left Side */}
        <div
          className="absolute inset-0 w-1/2 opacity-[0.03] dark:opacity-[0.02] z-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, rgba(0,0,0,0.8) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Floating Icons Background */}
        <div className="absolute top-[20%] left-[10%] opacity-10 pointer-events-none text-primary-blue">
          <div className="relative">
            <Shield className="h-16 w-16" />
            <div className="absolute inset-0 flex items-center justify-center font-bold text-xl">
              +
            </div>
          </div>
        </div>
        <div className="absolute bottom-[30%] left-[40%] opacity-10 pointer-events-none text-primary-blue">
          <div className="relative">
            <Shield className="h-12 w-12" />
            <div className="absolute inset-0 flex items-center justify-center font-bold text-lg">
              +
            </div>
          </div>
        </div>
        <div className="absolute top-[40%] right-[55%] opacity-10 pointer-events-none">
          <HeartPulse className="h-10 w-10 text-primary-blue" />
        </div>

        {/* Faint ECG line across the background */}
        <svg
          className="absolute inset-0 w-[55%] h-full pointer-events-none opacity-[0.03] dark:opacity-[0.02] z-0"
          preserveAspectRatio="none"
        >
          <path
            d="M 0 30% Q 25% 10% 50% 30% T 100% 30%"
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="4"
            className="animate-[dash_3s_linear_infinite]"
            strokeDasharray="20,20"
          />
        </svg>

        {/* Right side solid background with curved left edge */}
        <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-[53%] z-0 pointer-events-none overflow-visible">
          <div className="absolute inset-0 bg-white dark:bg-slate-900" />
          <svg
            viewBox="0 0 100 1000"
            preserveAspectRatio="none"
            className="absolute top-0 bottom-0 right-[99%] h-full w-[120px] text-white dark:text-slate-900 fill-current drop-shadow-[-15px_0_15px_rgba(59,130,246,0.08)]"
          >
            <path d="M100,0 C-20,300 120,700 0,1000 L100,1000 Z" />
          </svg>
        </div>

        {/* LEFT PANEL - EMERGENCY RESPONSE CENTER */}
        <EmergencyPanel />

        {/* RIGHT PANEL - SECURE PATIENT PORTAL */}
        <PatientPortalPanel />
      </main>
    </div>
  );
}

// --- Emergency Panel (Left Side) ---
function EmergencyPanel() {
  const navigate = useNavigate();

  return (
    <div className="w-full lg:w-1/2 p-4 md:p-8 text-foreground relative overflow-hidden flex flex-col items-center justify-start pt-12 md:pt-20 lg:pt-28 h-full z-10 min-h-[600px]">
      {/* Faint Medical Graphics Background Local to Left Panel */}
      <Ambulance className="absolute left-10 bottom-20 h-56 w-56 text-slate-300/30 dark:text-slate-700/30 z-0 pointer-events-none -scale-x-100" />

      {/* Hero Title */}
      <div className="mb-12 text-center relative z-10 flex flex-col items-center">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white drop-shadow-sm flex items-center justify-center gap-2">
          NexCure <span className="text-primary-blue">AI</span>
        </h1>
        <div className="mt-3 text-sm md:text-base font-semibold text-slate-600 dark:text-slate-400">
          AI-Powered Telemedicine Platform with
        </div>
        <div className="text-lg md:text-xl font-bold text-primary-blue mt-1">
          NLP-Based Automated Symptom Triage
        </div>
        <div className="text-xs md:text-sm text-slate-500 font-medium mt-4 max-w-md mx-auto text-balance">
          "Smart Healthcare. Faster Diagnosis. Better Care. Anywhere. Anytime."
        </div>
      </div>

      {/* Massive Central Button — now keyboard-accessible */}
      <button
        type="button"
        className="relative z-10 flex flex-col items-center group cursor-pointer mt-4 bg-transparent border-none p-0"
        onClick={() => navigate({ to: "/emergency" })}
        aria-label="Emergency Assistance — tap for immediate help"
      >
        {/* Glowing Background Rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[340px] md:h-[340px] rounded-full bg-red-500/10 border border-red-500/20 animate-pulse pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] md:w-[380px] md:h-[380px] rounded-full bg-red-500/5 border border-red-500/10 pointer-events-none" />

        {/* The Button Body */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-64 h-64 md:w-[280px] md:h-[280px] rounded-full bg-gradient-to-br from-[#ff4b4b] via-[#e53935] to-[#c62828] border-4 border-white dark:border-slate-800 shadow-[0_0_40px_rgba(229,57,53,0.5)] flex flex-col items-center justify-center gap-3 transition-all relative z-10"
        >
          <div className="relative">
            <Ambulance className="h-16 w-16 md:h-[72px] md:w-[72px] text-white drop-shadow-md relative z-10" />
          </div>
          <div className="text-center">
            <h2 className="text-xl md:text-2xl font-black text-white tracking-widest uppercase drop-shadow-sm">
              Emergency
            </h2>
            <h3 className="text-base md:text-lg font-bold text-red-100 uppercase tracking-widest">
              Assistance
            </h3>
          </div>
          <Activity className="h-6 w-6 text-white/90 mt-1" />
        </motion.div>

        {/* Text Below Button */}
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-5 py-2.5 rounded-full text-slate-800 dark:text-slate-200 font-bold uppercase tracking-wide text-[11px] md:text-xs shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            Tap Once for Immediate Help
          </div>
        </div>
      </button>
    </div>
  );
}

// --- Patient Portal Panel (Right Side) ---
function PatientPortalPanel() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.detail || "Registration failed");
        }
        toast.success("Account created! Please log in.");
        setIsRegister(false);
      } else {
        const formData = new URLSearchParams();
        formData.append("username", email);
        formData.append("password", password);

        const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData,
        });

        if (!res.ok) {
          throw new Error("Invalid credentials");
        }
        const data = await res.json();
        signIn(data.access_token);
        toast.success("Login successful!");
        navigate({ to: "/user" });
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full lg:w-1/2 p-4 md:p-8 lg:px-12 relative flex flex-col items-center justify-start pt-12 md:pt-20 lg:pt-28 h-full min-h-[600px]">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-medical-cyan/10 rounded-full blur-[80px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-blue/10 rounded-full blur-[80px] -z-10 pointer-events-none" />

      <div className="w-full max-w-xl mx-auto space-y-10 pb-12">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-2 mb-2 text-primary-blue">
            <div className="relative">
              <Shield className="h-8 w-8" />
              <div className="absolute inset-0 flex items-center justify-center font-bold text-[10px]">
                +
              </div>
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Secure Patient Portal
          </h2>
          <p className="text-xs md:text-sm text-slate-500 max-w-sm mx-auto text-balance">
            Only patients and authorized healthcare professionals can securely access medical
            records.
          </p>
        </div>

        {/* Login Card */}
        <Card className="bg-white dark:bg-slate-800 p-6 md:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 rounded-2xl relative z-10">
          <form onSubmit={handleLogin} className="space-y-5">
            {isRegister && (
              <div className="space-y-1.5">
                <Label
                  htmlFor="name"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Full Name
                </Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="name"
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="pl-9 h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus-visible:ring-primary-blue/50 text-sm"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Email or Phone
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="email"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patient@example.com"
                  className="pl-9 h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus-visible:ring-primary-blue/50 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Password
                </Label>
                <button
                  type="button"
                  onClick={() => toast.info("Password reset is not yet available.")}
                  className="text-xs text-primary-blue hover:underline font-semibold"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="password"
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus-visible:ring-primary-blue/50 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pb-2">
              <Checkbox id="remember" />
              <label
                htmlFor="remember"
                className="text-xs font-medium text-slate-600 dark:text-slate-400"
              >
                Remember my device
              </label>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-blue-500 hover:bg-blue-600 text-white shadow-sm shadow-blue-500/20 text-sm font-semibold rounded-lg transition-all"
            >
              {loading ? "Please wait..." : isRegister ? "Create Account" : "Secure Login"}{" "}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          {!isRegister && (
            <>
              <div className="mt-6 flex items-center gap-4 before:h-px before:flex-1 before:bg-slate-200 dark:before:bg-slate-700 after:h-px after:flex-1 after:bg-slate-200 dark:after:bg-slate-700">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  Or continue with
                </span>
              </div>

              <div className="mt-6 grid grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  className="h-10 bg-transparent border-slate-200 dark:border-slate-700 flex items-center justify-center rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  title="Biometric Login"
                >
                  <Fingerprint className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                </Button>
                <Button
                  variant="outline"
                  className="h-10 bg-transparent border-slate-200 dark:border-slate-700 flex items-center justify-center rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  title="OTP Login"
                >
                  OTP
                </Button>
                <Button
                  variant="outline"
                  className="h-10 bg-transparent border-slate-200 dark:border-slate-700 flex items-center justify-center rounded-xl text-sm font-bold text-red-500 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  title="Google"
                >
                  G
                </Button>
                <Button
                  variant="outline"
                  className="h-10 bg-transparent border-slate-200 dark:border-slate-700 flex items-center justify-center rounded-xl text-sm font-bold text-blue-500 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  title="Microsoft"
                >
                  M
                </Button>
              </div>
            </>
          )}

          <div className="mt-6 text-center text-xs text-slate-500">
            {isRegister ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsRegister(false)}
                  className="font-semibold text-primary-blue hover:underline"
                >
                  Sign In
                </button>
              </>
            ) : (
              <>
                New patient?{" "}
                <button
                  type="button"
                  onClick={() => setIsRegister(true)}
                  className="font-semibold text-primary-blue hover:underline"
                >
                  Create Account
                </button>
              </>
            )}
          </div>
        </Card>

        {/* Security Badges */}
        <div className="flex flex-wrap justify-center gap-4 text-[10px] md:text-xs font-semibold text-slate-500 dark:text-slate-400 p-2 pt-4 relative z-10">
          <div className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-green-500" /> AES-256 Encryption
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-green-500" /> HIPAA Compliance
          </div>
          <div className="flex items-center gap-1.5">
            <Database className="h-3.5 w-3.5 text-green-500" /> Blockchain Audit Logs
          </div>
          <div className="flex items-center gap-1.5">
            <Cloud className="h-3.5 w-3.5 text-green-500" /> Secure Cloud
          </div>
        </div>
      </div>
    </div>
  );
}
