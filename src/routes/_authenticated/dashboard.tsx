import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Bell,
  Calendar,
  HeartPulse,
  MessageSquare,
  Pill,
  TrendingUp,
  Stethoscope,
  Plus,
  Check,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getToken } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/api";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Health Dashboard — NexCure AI" },
      { name: "description", content: "Your health summary, consultation history, and trends." },
    ],
  }),
  component: Dashboard,
});

type DashboardTrendPoint = {
  month: string;
  consultations: number;
};

type DashboardPayload = {
  user_name: string;
  total_consultations: number;
  next_appointment: string;
  trend: DashboardTrendPoint[];
  recent_consultations: Array<Record<string, string | number>>;
};

type Medication = {
  id: number;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
};

function Dashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [data, setData] = useState<DashboardPayload | null>(null);

  const [medications, setMedications] = useState<Medication[]>([]);
  const [newMedName, setNewMedName] = useState("");
  const [newMedDosage, setNewMedDosage] = useState("");
  const [newMedTime, setNewMedTime] = useState("");
  const [showAddMed, setShowAddMed] = useState(false);

  const fetchMedications = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/medications`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) setMedications(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = getToken();
        if (!token) {
          navigate({ to: "/login" });
          return;
        }
        const res = await fetch(`${API_BASE_URL}/api/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setData(await res.json());
        } else if (res.status === 401) {
          navigate({ to: "/login" });
        }
      } catch (err) {
        toast.error("Failed to load dashboard data");
      }
    };
    fetchDashboard();
    fetchMedications();
  }, [navigate]);

  const handleAddMed = async () => {
    if (!newMedName || !newMedDosage || !newMedTime) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/medications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ name: newMedName, dosage: newMedDosage, time: newMedTime }),
      });
      if (res.ok) {
        toast.success("Medication added");
        setShowAddMed(false);
        setNewMedName("");
        setNewMedDosage("");
        setNewMedTime("");
        fetchMedications();
      }
    } catch (e) {
      toast.error("Failed to add medication");
    }
  };

  const toggleMed = async (id: number, currentTaken: boolean) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/medications/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ taken: !currentTaken }),
      });
      if (res.ok) fetchMedications();
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  if (!data) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center text-muted-foreground animate-pulse">
        {t("dashboard.loading")}
      </div>
    );
  }

  const symptoms = [
    { name: "Headache", count: 5 },
    { name: "Fatigue", count: 3 },
    { name: "Cough", count: 2 },
    { name: "Sore throat", count: 2 },
  ];

  return (
    <div className="bg-background min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <p className="text-sm text-muted-foreground">
              {t("dashboard.welcome_back", { name: data.user_name })}
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("dashboard.title")}
            </h1>
          </motion.div>
          <Button
            asChild
            className="bg-gradient-hero text-primary-foreground shadow-soft hover:opacity-95 transition-transform active:scale-95"
          >
            <Link to="/chat">
              <MessageSquare className="mr-2 h-4 w-4" /> {t("dashboard.new_consultation")}
            </Link>
          </Button>
        </div>

        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: HeartPulse,
              label: t("dashboard.health_risk"),
              value: t("dashboard.low"),
              tone: "success" as const,
              sub: t("dashboard.updated_today"),
            },
            {
              icon: MessageSquare,
              label: t("dashboard.consultations"),
              value: data.total_consultations.toString(),
              tone: "primary" as const,
              sub: t("dashboard.lifetime_total"),
            },
            {
              icon: Activity,
              label: t("dashboard.symptoms_tracked"),
              value: "12",
              tone: "primary" as const,
              sub: t("dashboard.last_30_days"),
            },
            {
              icon: Calendar,
              label: t("dashboard.next_checkup"),
              value: data.next_appointment.split(",")[0],
              tone: "warning" as const,
              sub: data.next_appointment.includes(",") ? data.next_appointment.split(",")[1] : "",
            },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
            >
              <Card className="border-border/60 p-5 shadow-card hover:shadow-lg transition-all duration-300 hover:border-primary/30 group">
                <div className="flex items-center justify-between">
                  <div
                    className={`grid h-10 w-10 place-items-center rounded-xl transition-colors duration-300 ${
                      s.tone === "success"
                        ? "bg-success/15 text-success group-hover:bg-success/20"
                        : s.tone === "warning"
                          ? "bg-warning/15 text-warning-foreground group-hover:bg-warning/20"
                          : "bg-primary-soft text-primary group-hover:bg-primary/20"
                    }`}
                  >
                    <s.icon className="h-5 w-5" />
                  </div>
                  <TrendingUp className="h-4 w-4 text-muted-foreground opacity-50" />
                </div>
                <p className="mt-4 text-xs uppercase tracking-wide text-muted-foreground">
                  {s.label}
                </p>
                <p className="mt-1 text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground truncate">{s.sub}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card className="border-border/60 p-5 shadow-card h-full">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{t("dashboard.consultation_trends")}</h3>
                  <p className="text-xs text-muted-foreground">{t("dashboard.last_7_months")}</p>
                </div>
                <Badge variant="secondary" className="rounded-full">
                  +18% vs prev
                </Badge>
              </div>
              <div className="mt-6 h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.trend} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                    <defs>
                      <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.58 0.16 240)" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="oklch(0.58 0.16 240)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="oklch(0.85 0.01 240)"
                      opacity={0.3}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      stroke="currentColor"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      stroke="currentColor"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      dx={-10}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                      labelStyle={{ color: "var(--foreground)", fontWeight: 600, marginBottom: 4 }}
                      itemStyle={{ color: "var(--primary)" }}
                      cursor={{ stroke: "var(--primary)", strokeWidth: 1, strokeDasharray: "4 4" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="consultations"
                      stroke="oklch(0.58 0.16 240)"
                      strokeWidth={3}
                      fill="url(#grad)"
                      activeDot={{ r: 6, strokeWidth: 0, fill: "var(--primary)" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>

          {/* Medications Tracker */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-border/60 p-5 shadow-card h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Pill className="h-4 w-4" /> {t("dashboard.medications")}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowAddMed(!showAddMed)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {showAddMed && (
                <div className="mb-4 space-y-2 p-3 bg-muted/30 rounded-lg border">
                  <Input
                    placeholder={t("dashboard.medicine_name")}
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                    className="h-8 text-sm"
                  />
                  <div className="flex gap-2">
                    <Input
                      placeholder={t("dashboard.dosage")}
                      value={newMedDosage}
                      onChange={(e) => setNewMedDosage(e.target.value)}
                      className="h-8 text-sm flex-1"
                    />
                    <Input
                      placeholder={t("dashboard.time")}
                      value={newMedTime}
                      onChange={(e) => setNewMedTime(e.target.value)}
                      className="h-8 text-sm flex-1"
                    />
                  </div>
                  <div className="flex gap-2 justify-end mt-2">
                    <Button variant="ghost" size="sm" onClick={() => setShowAddMed(false)}>
                      {t("dashboard.cancel")}
                    </Button>
                    <Button size="sm" onClick={handleAddMed}>
                      {t("dashboard.add")}
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-auto space-y-2 pr-1">
                {medications.length === 0 && !showAddMed ? (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    {t("dashboard.no_meds")}
                  </div>
                ) : (
                  medications.map((m) => (
                    <div
                      key={m.id}
                      className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${m.taken ? "bg-success/5 border-success/20 opacity-60" : "border-border/60 hover:bg-muted/50"}`}
                    >
                      <button
                        onClick={() => toggleMed(m.id, m.taken)}
                        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-colors ${m.taken ? "bg-success border-success text-success-foreground" : "border-muted-foreground/30 hover:border-primary"}`}
                      >
                        {m.taken && <Check className="h-3 w-3" />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate text-sm font-medium ${m.taken ? "line-through" : ""}`}
                        >
                          {m.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {m.dosage} • {m.time}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Recent consultations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2"
          >
            <Card className="border-border/60 p-5 shadow-card h-full">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{t("dashboard.recent_consultations")}</h3>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/chat">{t("dashboard.view_all")}</Link>
                </Button>
              </div>
              <div className="mt-4 divide-y divide-border/60">
                {data.recent_consultations.length > 0 ? (
                  data.recent_consultations.map((c: Record<string, string | number>, i: number) => (
                    <div key={i} className="flex items-center justify-between py-3 group">
                      <div>
                        <p className="text-sm font-medium group-hover:text-primary transition-colors">
                          {c.title}
                        </p>
                        <p className="text-xs text-muted-foreground">{c.date}</p>
                      </div>
                      <Badge variant="secondary" className="bg-success/15 text-success">
                        {t("dashboard.completed")}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    {t("dashboard.no_recent")}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Symptom history */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="border-border/60 p-5 shadow-card h-full">
              <h3 className="font-semibold">{t("dashboard.symptom_history")}</h3>
              <p className="text-xs text-muted-foreground">{t("dashboard.most_reported")}</p>
              <div className="mt-4 space-y-4">
                {symptoms.map((s) => (
                  <div key={s.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{s.name}</span>
                      <span className="text-muted-foreground">{s.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(s.count / 5) * 100}%` }}
                        transition={{ duration: 1, delay: 0.7 }}
                        className="h-full rounded-full bg-gradient-hero"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
