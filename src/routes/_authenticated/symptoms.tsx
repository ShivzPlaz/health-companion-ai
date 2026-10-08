import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Brain,
  ClipboardCheck,
  MapPin,
  Pill,
  Search,
  Stethoscope,
  ShieldAlert,
  Phone,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getToken } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/api";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_authenticated/symptoms")({
  head: () => ({
    meta: [
      { title: "Symptom Analysis — NexCure AI" },
      {
        name: "description",
        content: "Select symptoms, severity, and duration to get an AI-powered analysis.",
      },
    ],
  }),
  component: SymptomsPage,
});

const COMMON = [
  "Fever",
  "Headache",
  "Cough",
  "Fatigue",
  "Chest Pain",
  "Stomach Pain",
  "Nausea",
  "Sore Throat",
  "Dizziness",
  "Shortness of Breath",
];
const SEVERITY = ["Mild", "Moderate", "Severe"] as const;
const DURATIONS = ["1 day", "3 days", "1 week", "More than 1 week"];

type AnalysisResult = {
  causes: { label: string; note?: string }[];
  precautions: { label: string; note?: string }[];
  medicines: { label: string; note?: string }[];
  specialist: { label: string; note?: string }[];
};

function SymptomsPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [severity, setSeverity] = useState<(typeof SEVERITY)[number]>("Moderate");
  const [duration, setDuration] = useState("3 days");
  const [analyzed, setAnalyzed] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);

  const filtered = useMemo(
    () => COMMON.filter((s) => s.toLowerCase().includes(search.toLowerCase())),
    [search],
  );

  const toggle = (s: string) => {
    setSelected((arr) => {
      setAnalyzed(false); // Reset analysis when changing inputs
      return arr.includes(s) ? arr.filter((x) => x !== s) : [...arr, s];
    });
  };

  const analyzeSymptoms = async () => {
    if (selected.length === 0) {
      toast.error(t("symptoms.error_select"));
      return;
    }
    setIsAnalyzing(true);
    setAnalyzed(false);

    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/symptoms/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          symptoms: selected,
          severity,
          duration,
        }),
      });

      if (!res.ok) throw new Error("Failed to analyze");
      const data = await res.json();
      setResults(data);
      setAnalyzed(true);
    } catch (err) {
      console.error(err);
      toast.error(t("symptoms.error_failed"));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const isCritical =
    severity === "Severe" ||
    selected.includes("Chest Pain") ||
    selected.includes("Shortness of Breath");

  return (
    <div className="bg-transparent min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("symptoms.title")}</h1>
          <p className="mt-2 text-muted-foreground">{t("symptoms.subtitle")}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          {/* Selector */}
          <Card className="border-border/60 p-6 shadow-card h-fit liquid-glass">
            <div className="space-y-6">
              <div>
                <label className="text-sm font-semibold">{t("symptoms.symptoms_label")}</label>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t("symptoms.search")}
                    className="pl-9 glass"
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {filtered.map((s) => {
                    const on = selected.includes(s);
                    return (
                      <button
                        key={s}
                        onClick={() => toggle(s)}
                        className={`rounded-full border px-3 py-1.5 text-sm transition-all ${
                          on
                            ? "border-primary bg-primary text-primary-foreground shadow-soft"
                            : "border-border liquid-glass hover:bg-accent/40"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold">{t("symptoms.severity_label")}</label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {SEVERITY.map((s) => {
                    const on = severity === s;
                    const toneClass =
                      s === "Mild"
                        ? "border-success bg-success/10 text-success-foreground"
                        : s === "Moderate"
                          ? "border-warning bg-warning/10 text-warning-foreground"
                          : "border-destructive bg-destructive/10 text-destructive";
                    return (
                      <button
                        key={s}
                        onClick={() => {
                          setSeverity(s);
                          setAnalyzed(false);
                        }}
                        className={`rounded-xl border px-3 py-3 text-sm font-medium transition-all ${
                          on ? toneClass : "border-border hover:bg-accent/40"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold">{t("symptoms.duration_label")}</label>
                <Select
                  value={duration}
                  onValueChange={(v) => {
                    setDuration(v);
                    setAnalyzed(false);
                  }}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATIONS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={analyzeSymptoms}
                size="lg"
                disabled={isAnalyzing || selected.length === 0}
                className="w-full liquid-glass text-foreground shadow-soft hover:opacity-95 transition-all border border-border/50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("symptoms.analyzing_btn")}
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" /> {t("symptoms.analyze_btn")}
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Results */}
          <div className="space-y-5 relative">
            <AnimatePresence>
              {isCritical && selected.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="border-destructive/40 bg-destructive/10 p-5 shadow-sm liquid-glass">
                    <div className="flex items-start gap-4">
                      <ShieldAlert className="h-6 w-6 shrink-0 text-destructive" />
                      <div className="flex-1">
                        <p className="font-semibold text-destructive">
                          {t("symptoms.critical_title")}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {t("symptoms.critical_desc")}
                        </p>
                      </div>
                      <Button variant="destructive" size="sm">
                        <Phone className="mr-1.5 h-4 w-4" /> 911
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {!analyzed && !isAnalyzing && (
              <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground border-2 border-dashed rounded-xl p-8 text-center glass">
                <Brain className="h-12 w-12 mb-4 opacity-20" />
                <h3 className="text-lg font-medium">{t("symptoms.awaiting_title")}</h3>
                <p className="text-sm mt-1 max-w-xs">{t("symptoms.awaiting_desc")}</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="animate-pulse">{t("symptoms.consulting")}</p>
              </div>
            )}

            {analyzed && results && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.1 }}
                className="space-y-5"
              >
                <ResponseCard
                  icon={Brain}
                  title={t("symptoms.causes")}
                  items={results.causes || []}
                />
                <ResponseCard
                  icon={ClipboardCheck}
                  title={t("symptoms.precautions")}
                  items={results.precautions || []}
                />
                <ResponseCard
                  icon={Pill}
                  title={t("symptoms.medicines")}
                  items={results.medicines || []}
                  warning={t("symptoms.warning")}
                />
                <ResponseCard
                  icon={Stethoscope}
                  title={t("symptoms.specialist")}
                  items={results.specialist || []}
                />

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <Card className="border-border/60 p-5 shadow-card liquid-glass">
                    <div className="flex items-start gap-4">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{t("symptoms.nearby")}</p>
                        <ul className="mt-2 space-y-1.5 text-sm">
                          <li className="flex justify-between">
                            <span>City Family Clinic</span>
                            <Badge variant="secondary">0.8 km</Badge>
                          </li>
                          <li className="flex justify-between">
                            <span>Riverside Medical Center</span>
                            <Badge variant="secondary">2.1 km</Badge>
                          </li>
                          <li className="flex justify-between">
                            <span>St. Mary's Hospital ER</span>
                            <Badge variant="secondary">3.4 km</Badge>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Card className="border-border/60 glass p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">{t("symptoms.disclaimer")}</p>
                    </div>
                  </Card>
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ResponseCard({
  icon: Icon,
  title,
  items,
  warning,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: { label: string; note?: string }[];
  warning?: string;
}) {
  if (!items || items.length === 0) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-border/60 p-5 shadow-card liquid-glass">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="font-semibold">{title}</h3>
        </div>
        <ul className="mt-4 space-y-2">
          {items.map((it, i) => (
            <li
              key={i}
              className="flex items-start justify-between gap-3 rounded-lg glass px-3 py-2 text-sm"
            >
              <span>{it.label}</span>
              {it.note && (
                <span className="shrink-0 text-xs text-muted-foreground max-w-[50%] text-right">
                  {it.note}
                </span>
              )}
            </li>
          ))}
        </ul>
        {warning && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-warning/10 px-3 py-2 text-xs text-warning-foreground">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 text-warning" /> {warning}
          </div>
        )}
      </Card>
    </motion.div>
  );
}
