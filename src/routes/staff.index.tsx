import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Shield, Users } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, STATUSES } from "@/lib/report-utils";

export const Route = createFileRoute("/staff/")({
  component: StaffDashboard,
});

type ReportRow = {
  id: string;
  tracking_code: string;
  category: string;
  agency: "police" | "welfare" | "both";
  status: string;
  language: string;
  region: string | null;
  created_at: string;
};

function StaffDashboard() {
  const { user, roles, loading } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [rows, setRows] = useState<ReportRow[] | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      void navigate({ to: "/staff/login" });
      return;
    }
    if (roles.length === 0) {
      void navigate({ to: "/my-reports" });
      return;
    }
    void supabase
      .from("reports")
      .select("id, tracking_code, category, agency, status, language, region, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => setRows((data as ReportRow[]) ?? []));
  }, [user, roles, loading, navigate]);

  const filtered = useMemo(() => {
    if (!rows) return null;
    return rows.filter(
      (r) =>
        (statusFilter === "all" || r.status === statusFilter) &&
        (categoryFilter === "all" || r.category === categoryFilter)
    );
  }, [rows, statusFilter, categoryFilter]);

  const isAdmin = roles.includes("admin");

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{t("dashboard")}</h1>
            <div className="mt-1 flex gap-1">
              {roles.map((r) => (
                <Badge key={r} variant="secondary">
                  <Shield className="mr-1 h-3 w-3" />
                  {r}
                </Badge>
              ))}
            </div>
          </div>
          {isAdmin && (
            <Link
              to="/staff/admin"
              className="inline-flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm hover:bg-accent"
            >
              <Users className="h-4 w-4" />
              Manage staff
            </Link>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("filter_status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("all")}</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {t(`st_${s}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={t("filter_category")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("all")}</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.key} value={c.key}>
                  {t(`cat_${c.key}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filtered === null ? (
          <p className="mt-6 text-sm text-muted-foreground">{t("loading")}</p>
        ) : filtered.length === 0 ? (
          <Card className="mt-6 p-6 text-center text-sm text-muted-foreground">
            No reports match the filters.
          </Card>
        ) : (
          <ul className="mt-4 space-y-2">
            {filtered.map((r) => (
              <li key={r.id}>
                <Link to="/staff/reports/$id" params={{ id: r.id }}>
                  <Card className="flex items-center justify-between p-4 transition-colors hover:bg-accent/40">
                    <div>
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-sm font-semibold">
                          {r.tracking_code}
                        </code>
                        <Badge variant="outline">{r.agency}</Badge>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {t(`cat_${r.category}`)} · {r.region ?? "—"} ·{" "}
                        {new Date(r.created_at).toLocaleString()}
                      </div>
                    </div>
                    <Badge>{t(`st_${r.status}`)}</Badge>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
