import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/stats")({
  component: Stats,
  head: () => ({
    meta: [
      { title: "Public Statistics — Child Voice Gambia" },
      {
        name: "description",
        content:
          "Aggregated, privacy-safe statistics on child rights reports filed in The Gambia.",
      },
    ],
  }),
});

type Bucket = { key: string; count: number };
type Overview = {
  total: number;
  resolved: number;
  this_month: number;
  avg_resolution_hours: number;
  by_category: Bucket[];
  by_status: Bucket[];
  by_region: Bucket[];
  by_language: Bucket[];
  by_month: { month: string; count: number }[];
};

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function Stats() {
  const { t } = useI18n();
  const [data, setData] = useState<Overview | null>(null);

  useEffect(() => {
    void supabase.rpc("public_stats_overview").then(({ data: d }) => {
      setData(d as unknown as Overview);
    });
  }, []);

  const labelFor = (group: string, key: string) => {
    if (group === "category") return t(`cat_${key}`);
    if (group === "status") return t(`st_${key}`);
    return key;
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold">{t("public_stats")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("privacy_note")}</p>

        {!data ? (
          <p className="mt-6 text-sm text-muted-foreground">{t("loading")}</p>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              <Stat label={t("stats_total")} value={data.total} />
              <Stat label={t("stats_resolved")} value={data.resolved} />
              <Stat label={t("stats_this_month")} value={data.this_month} />
              <Stat
                label={t("stats_avg_resolution")}
                value={Math.round(data.avg_resolution_hours)}
              />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ChartCard title={t("by_month")}>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={data.by_month}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="var(--chart-1)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title={t("by_category")}>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={data.by_category.map((b) => ({
                      name: labelFor("category", b.key),
                      count: b.count,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                      }}
                    />
                    <Bar dataKey="count" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title={t("by_region")}>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={data.by_region.map((b) => ({ name: b.key, count: b.count }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                      }}
                    />
                    <Bar dataKey="count" fill="var(--chart-3)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title={t("by_status")}>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={data.by_status.map((b) => ({
                        name: labelFor("status", b.key),
                        value: b.count,
                      }))}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={90}
                    >
                      {data.by_status.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value.toLocaleString()}</div>
    </Card>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-4">
      <h3 className="mb-2 text-sm font-semibold">{title}</h3>
      {children}
    </Card>
  );
}
