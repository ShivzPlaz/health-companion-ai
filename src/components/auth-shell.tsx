import { Link } from "@tanstack/react-router";
import { Stethoscope } from "lucide-react";
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
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 -z-10 bg-gradient-soft" />
      <div className="absolute -top-40 -right-40 -z-10 h-[500px] w-[500px] rounded-full bg-primary/25 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 -z-10 h-[500px] w-[500px] rounded-full bg-accent/25 blur-3xl" />

      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12 sm:px-6">
        <Link to="/" className="mx-auto mb-8 flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-hero shadow-soft">
            <Stethoscope className="h-5 w-5 text-primary-foreground" />
          </span>
          <span className="text-base font-semibold">NexCure AI</span>
        </Link>

        <div className="glass rounded-3xl border border-border/60 p-7 shadow-soft">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>

        {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
      </div>
    </div>
  );
}
