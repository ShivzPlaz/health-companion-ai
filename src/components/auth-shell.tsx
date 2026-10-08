import { Link } from "@tanstack/react-router";
import { Stethoscope, Shield, ShieldCheck, Ambulance } from "lucide-react";
import type { ReactNode } from "react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative flex-1 flex flex-col md:flex-row min-h-screen">
      {/* Central Divider */}
      <div className="hidden md:block absolute left-1/2 top-24 bottom-24 w-px bg-white/10 z-20" />

      {/* Left Side: Emergency */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-12 relative z-10">
        <div className="max-w-md w-full flex flex-col items-center justify-center h-full">
          
          <div className="mt-12 md:mt-20 flex flex-col items-center justify-center relative">
            <div className="absolute inset-0 rounded-full border-2 border-red-500/20 animate-ping" style={{ animationDuration: '3s' }} />
            <div className="absolute inset-[-20px] rounded-full border border-red-500/10 animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }} />
            
            <Link
              to="/emergency"
              className="relative flex h-52 w-52 md:h-64 md:w-64 flex-col items-center justify-center rounded-full glass-emergency animate-emergency-glow text-white shadow-[0_0_60px_rgba(229,57,53,0.4)] border-4 border-red-500/80 hover:bg-red-500/40 transition-all hover:scale-105 group"
            >
              <Ambulance className="mb-2 h-12 w-12 md:h-14 md:w-14 group-hover:animate-bounce" />
              <span className="text-sm md:text-lg font-bold uppercase tracking-widest text-center leading-tight">Emergency<br/>Assistance</span>
            </Link>
            
            <div className="mt-10 rounded-full border border-red-500/40 bg-black/50 backdrop-blur-md px-5 py-2 flex items-center gap-3 shadow-lg">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,1)]" />
              <span className="text-[10px] md:text-xs font-bold tracking-widest text-white/90 uppercase">Tap once for immediate help</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 py-12 sm:px-6 relative z-10 md:bg-black/20">
        <div className="w-full max-w-md">
          {/* Transparent Logo (Text Only) */}
          <Link to="/" className="mx-auto mb-10 flex flex-col items-center">
            <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-md">
              NexCure <span className="text-blue-500">AI</span>
            </h1>
          </Link>

          
          <div className="liquid-glass rounded-3xl border border-white/10 p-8 shadow-2xl">
            <h3 className="text-xl font-bold tracking-tight text-white">{title}</h3>
            <p className="mt-1.5 text-sm text-white/50">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </div>
          
          {footer && <div className="mt-6 text-center text-sm text-white/50">{footer}</div>}
          

        </div>
      </div>
    </div>
  );
}
