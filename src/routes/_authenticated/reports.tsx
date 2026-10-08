import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, UploadCloud, Brain, Loader2, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { getToken } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/api";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({
    meta: [
      { title: "Lab Report Analyzer — NexCure AI" },
      {
        name: "description",
        content: "Upload a medical document or lab report for AI simplification.",
      },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const { t } = useTranslation();
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAnalysis(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeReport = async () => {
    if (!image) return;
    setIsAnalyzing(true);

    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/reports/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ image }),
      });

      if (!res.ok) throw new Error("Failed to analyze");
      const data = await res.json();
      setAnalysis(data.analysis);
    } catch (err) {
      console.error(err);
      toast.error(t("reports.error_failed"));
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-transparent min-h-[calc(100vh-4rem)] flex flex-col">
      <header className="flex items-center justify-between border-b border-border/60 glass px-4 py-3 sm:px-6">
        <div>
          <h1 className="text-sm font-semibold">{t("reports.title")}</h1>
          <p className="text-xs text-muted-foreground">{t("reports.subtitle")}</p>
        </div>
        <ThemeToggle />
      </header>

      <div className="flex-1 overflow-auto p-4 sm:p-6 w-full max-w-4xl mx-auto space-y-6">
        <div className="grid gap-6 md:grid-cols-2 h-full">
          <Card className="border-border/60 p-6 shadow-card flex flex-col h-[500px] liquid-glass">
            <h2 className="text-lg font-semibold mb-4">{t("reports.upload_title")}</h2>
            <div className="flex-1 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center p-6 text-center relative overflow-hidden glass">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageUpload}
              />

              {image ? (
                <>
                  <img
                    src={image}
                    alt="Report preview"
                    className="absolute inset-0 w-full h-full object-contain p-2"
                  />
                  <div className="absolute inset-0 bg-background/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                      {t("reports.change_image")}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <UploadCloud className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg">{t("reports.select_file")}</h3>
                  <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                    {t("reports.upload_desc")}
                  </p>
                  <Button className="mt-6" onClick={() => fileInputRef.current?.click()}>
                    {t("reports.browse_files")}
                  </Button>
                </>
              )}
            </div>
            <div className="mt-6">
              <Button
                onClick={analyzeReport}
                disabled={!image || isAnalyzing}
                className="w-full liquid-glass text-foreground shadow-soft border border-border/50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("reports.analyzing")}
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" /> {t("reports.translate")}
                  </>
                )}
              </Button>
            </div>
          </Card>

          <Card className="border-border/60 p-6 shadow-card h-[500px] flex flex-col liquid-glass">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">{t("reports.simplified_analysis")}</h2>
            </div>

            <div className="flex-1 overflow-auto glass rounded-xl p-4 border border-border/50">
              <AnimatePresence mode="wait">
                {!image && !analysis && !isAnalyzing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center text-muted-foreground text-center"
                  >
                    <Brain className="h-10 w-10 mb-3 opacity-20" />
                    <p className="text-sm">{t("reports.upload_placeholder")}</p>
                  </motion.div>
                )}
                {isAnalyzing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center text-primary"
                  >
                    <Loader2 className="h-10 w-10 animate-spin mb-4" />
                    <p className="text-sm font-medium animate-pulse">{t("reports.reading")}</p>
                  </motion.div>
                )}
                {analysis && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="prose prose-sm dark:prose-invert max-w-none"
                  >
                    <div className="flex items-center gap-2 text-success font-medium mb-4 pb-2 border-b">
                      <CheckCircle2 className="h-4 w-4" /> {t("reports.analysis_complete")}
                    </div>
                    <div className="whitespace-pre-wrap leading-relaxed text-sm">{analysis}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
