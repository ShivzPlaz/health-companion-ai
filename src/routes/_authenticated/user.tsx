import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Activity,
  LayoutDashboard,
  HeartPulse,
  ArrowRight,
  LogOut,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { signOut, getToken } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/api";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_authenticated/user")({
  head: () => ({ meta: [{ title: "My Health — NexCure AI" }] }),
  component: UserHub,
});

function UserHub() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const tiles = [
    {
      to: "/chat" as const,
      icon: MessageSquare,
      title: t("user.ai_consultation"),
      desc: t("user.ai_consultation_desc"),
      color: "from-blue-500 to-indigo-600",
    },
    {
      to: "/symptoms" as const,
      icon: Activity,
      title: t("user.symptom_analysis"),
      desc: t("user.symptom_analysis_desc"),
      color: "from-emerald-500 to-teal-600",
    },
    {
      to: "/dashboard" as const,
      icon: LayoutDashboard,
      title: t("user.dashboard"),
      desc: t("user.dashboard_desc"),
      color: "from-violet-500 to-purple-600",
    },
  ];

  const handleExport = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/export`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([data.report], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "health-report.txt";
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Health report downloaded");
      } else {
        toast.error("Failed to fetch report");
      }
    } catch (e) {
      toast.error("Failed to export report");
    }
  };

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{t("user.welcome")}</p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("user.workspace_title1")}
              <span className="text-gradient">{t("user.workspace_title2")}</span>
            </h1>
            <p className="mt-2 max-w-xl text-muted-foreground">{t("user.workspace_desc")}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              signOut();
              navigate({ to: "/" });
            }}
          >
            <LogOut className="mr-2 h-4 w-4" /> {t("user.sign_out")}
          </Button>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {tiles.map((tile, i) => (
            <motion.div
              key={tile.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Link
                to={tile.to}
                className="group block rounded-2xl border border-border/60 bg-card p-6 shadow-card transition-all hover:border-primary/30 hover:shadow-glow"
              >
                <div
                  className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${tile.color} text-white shadow-soft transition-transform group-hover:scale-110`}
                >
                  <tile.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{tile.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{tile.desc}</p>
                <div className="mt-5 inline-flex items-center text-sm font-medium text-primary">
                  {t("user.open")}{" "}
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <Card className="mt-10 border-border/60 p-6 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">
                <HeartPulse className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">{t("user.vitals")}</h3>
                <p className="text-sm text-muted-foreground">{t("user.vitals_desc")}</p>
              </div>
            </div>
            <Button
              onClick={handleExport}
              className="shrink-0 bg-gradient-hero text-primary-foreground shadow-soft"
            >
              <Download className="mr-2 h-4 w-4" /> {t("user.export")}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
