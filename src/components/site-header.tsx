import { Link, useNavigate } from "@tanstack/react-router";
import { Stethoscope, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { isAuthed, signOut } from "@/lib/auth";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function SiteHeader({ showSidebarTrigger = false }: { showSidebarTrigger?: boolean }) {
  const [authed, setAuthed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const sync = () => setAuthed(isAuthed());
    sync();
    window.addEventListener("auth-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("auth-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          {showSidebarTrigger && <SidebarTrigger />}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="grid h-9 w-9 place-items-center rounded-xl liquid-glass shadow-soft transition-transform group-hover:scale-105">
              <Stethoscope className="h-5 w-5 text-foreground" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold">NexCure AI</p>
              <p className="text-[11px] text-muted-foreground">Healthcare Assistant</p>
            </div>
          </Link>
        </div>
        <nav className="hidden items-center gap-6 md:flex">
        </nav>
        <div className="flex items-center gap-1.5">
          <Button
            asChild
            size="sm"
            className="glass-emergency animate-emergency-glow text-white shadow-soft mr-2 border border-red-500/50"
          >
            <Link to="/emergency">Emergency</Link>
          </Button>
          {authed ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Sign out"
                onClick={() => {
                  signOut();
                  navigate({ to: "/" });
                }}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="liquid-glass text-foreground shadow-soft hover:opacity-90 border border-border/50"
              >
                <Link to="/login">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
