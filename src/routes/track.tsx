import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/track")({
  component: Track,
});

type LookupRow = {
  tracking_code: string;
  category: string;
  status: string;
  language: string;
  region: string | null;
  created_at: string;
  updated_at: string;
};

function Track() {
  const { t } = useI18n();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LookupRow | null>(null);
  const [notFound, setNotFound] = useState(false);

  const lookup = async () => {
    setLoading(true);
    setResult(null);
    setNotFound(false);
    const trimmed = code.trim().toUpperCase();
    const { data, error } = await supabase.rpc("lookup_report_by_code", { _code: trimmed });
    setLoading(false);
    if (error) {
      console.error(error);
      setNotFound(true);
      return;
    }
    const row = (data as LookupRow[] | null)?.[0];
    if (!row) setNotFound(true);
    else setResult(row);
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-md px-4 py-8">
        <h1 className="text-2xl font-semibold">{t("track_report")}</h1>
        <Card className="mt-4 space-y-3 p-5">
          <Input
            placeholder={t("enter_code")}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="h-12 font-mono uppercase tracking-wider"
            maxLength={20}
          />
          <Button className="w-full" onClick={() => void lookup()} disabled={loading || !code}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Search className="mr-2 h-4 w-4" />
            )}
            {t("lookup")}
          </Button>
        </Card>

        {notFound && (
          <p className="mt-4 text-center text-sm text-muted-foreground">{t("not_found")}</p>
        )}

        {result && (
          <Card className="mt-4 space-y-3 p-5">
            <div className="flex items-center justify-between">
              <code className="font-mono text-sm font-semibold">{result.tracking_code}</code>
              <Badge>{t(`st_${result.status}`)}</Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              <div>{t(`cat_${result.category}`)}</div>
              {result.region && <div>{result.region}</div>}
              <div>{new Date(result.created_at).toLocaleString()}</div>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
