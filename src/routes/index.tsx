import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import logoImg from "@/assets/logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NexCure AI" },
      {
        name: "description",
        content: "The most powerful AI ever deployed in healthcare",
      },
    ],
  }),
  component: NexCureLanding,
});

function NexCureLanding() {
  return (
    <div className="flex flex-col flex-1">
      {/* Navbar */}
      <header>
          <div className="w-full py-5 px-8 flex flex-row items-center justify-between">
            {/* Left: Logo */}
            <div className="flex items-center">
              <img src={logoImg} alt="Logo" className="h-[32px] w-auto object-contain" />
            </div>

            {/* Center: Nav Items */}
            <nav className="hidden md:flex items-center gap-6">
              <button className="flex items-center gap-1 text-white/90 hover:text-white transition-colors text-sm font-medium">
                Features <ChevronDown className="w-4 h-4" />
              </button>
              <button className="text-white/90 hover:text-white transition-colors text-sm font-medium">
                Solutions
              </button>
              <button className="text-white/90 hover:text-white transition-colors text-sm font-medium">
                Plans
              </button>
              <button className="flex items-center gap-1 text-white/90 hover:text-white transition-colors text-sm font-medium">
                Learning <ChevronDown className="w-4 h-4" />
              </button>
            </nav>

            {/* Right: Sign Up */}
            <div className="flex items-center">
              <Link to="/login" className="btn-hero-secondary !rounded-full !px-4 !py-2 !text-sm">
                Sign Up
              </Link>
            </div>
          </div>
          {/* Divider */}
          <div className="h-[1px] w-full mt-[3px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </header>

        {/* Hero Content */}
        <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10">
          <h1
            className="text-[100px] md:text-[150px] lg:text-[220px] font-normal leading-[1.02] tracking-[-0.024em] mb-0"
            style={{ fontFamily: "var(--font-general-sans, 'General Sans')" }}
          >
            <span className="text-white">NexCure </span>
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: "linear-gradient(to left, #6366f1, #a855f7, #fcd34d)",
              }}
            >
              AI
            </span>
          </h1>
          <p
            className="text-[var(--hero-sub)] text-lg leading-8 max-w-md mt-[9px] opacity-80"
          >
            The most powerful AI ever deployed
            <br />
            in healthcare
          </p>
          <Link to="/login" className="btn-hero-secondary px-[29px] py-[24px] mt-[25px] text-lg">
            Schedule a Consult
          </Link>
        </main>

        {/* Logo Marquee */}
        <div className="w-full pb-10 mt-12 relative z-10">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12 overflow-hidden px-6">
            {/* Left side text */}
            <div className="text-white/50 text-sm whitespace-nowrap text-center md:text-left shrink-0">
              Empowering modern
              <br />
              digital healthcare
            </div>

            {/* Right side scrolling marquee */}
            <div className="flex-1 overflow-hidden relative" style={{ maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}>
              <div className="flex w-max" style={{ animation: "marquee-scroll 20s linear infinite" }}>
                {/* We render two identical sets of logos for seamless looping */}
                <div className="flex items-center gap-16 pr-16">
                  {["24/7 AI Triage", "HIPAA Compliant", "Smart Symptom Checker", "Secure Telemedicine", "Personalized Care", "Instant Diagnoses"].map((message, idx) => (
                    <div key={`msg-1-${idx}`} className="flex items-center gap-3 shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
                      <span className="text-base font-medium text-white/90">{message}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-16 pr-16">
                  {["24/7 AI Triage", "HIPAA Compliant", "Smart Symptom Checker", "Secure Telemedicine", "Personalized Care", "Instant Diagnoses"].map((message, idx) => (
                    <div key={`msg-2-${idx}`} className="flex items-center gap-3 shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
                      <span className="text-base font-medium text-white/90">{message}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
