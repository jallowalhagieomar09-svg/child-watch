import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/my-reports")({
  component: MyReports,
});

type ReportRow = {
  id: string;
  tracking_code: string;
  category: string;
  status: string;
  created_at: string;
};

function MyReports() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [rows, setRows] = useState<ReportRow[] | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      void navigate({ to: "/auth" });
      return;
    }
    void supabase
      .from("reports")
      .select("id, tracking_code, category, status, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => setRows((data as ReportRow[]) ?? []));
  }, [user, authLoading, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-semibold">{t("my_reports")}</h1>
        {rows === null ? (
          <p className="mt-4 text-sm text-muted-foreground">{t("loading")}</p>
        ) : rows.length === 0 ? (
          <Card className="mt-4 p-6 text-center text-sm text-muted-foreground">
            <p>No reports yet.</p>
            <Link to="/report" className="mt-2 inline-block text-primary underline">
              {t("report_now")}
            </Link>
          </Card>
        ) : (
          <ul className="mt-4 space-y-2">
            {rows.map((r) => (
              <li key={r.id}>
                <Card className="flex items-center justify-between p-4">
                  <div>
                    <div className="font-mono text-sm font-semibold">{r.tracking_code}</div>
                    <div className="text-xs text-muted-foreground">
                      {t(`cat_${r.category}`)} · {new Date(r.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge>{t(`st_${r.status}`)}</Badge>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
