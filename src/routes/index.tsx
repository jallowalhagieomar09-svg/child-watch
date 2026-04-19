import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Search, BarChart3, ShieldCheck, Lock, Languages } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-background to-accent/20" />
          <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 flex justify-center">
                <LanguageSwitcher />
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-6xl">
                {t("app_name")}
              </h1>
              <p className="mt-4 text-lg text-muted-foreground md:text-xl">{t("tagline")}</p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-14 w-full px-8 text-base sm:w-auto">
                  <Link to="/report">
                    <FileText className="mr-2 h-5 w-5" />
                    {t("report_now")}
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-14 w-full px-8 text-base sm:w-auto"
                >
                  <Link to="/track">
                    <Search className="mr-2 h-5 w-5" />
                    {t("track_report")}
                  </Link>
                </Button>
              </div>
              <div className="mt-4">
                <Button asChild variant="ghost" size="sm">
                  <Link to="/stats">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    {t("public_stats")}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Trust strip */}
        <section className="border-y border-border bg-card/50">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-10 md:grid-cols-3">
            <FeatureCard
              icon={<Lock className="h-5 w-5" />}
              title="Anonymous by default"
              text="You can report without creating an account. Provide contact only if you wish."
            />
            <FeatureCard
              icon={<Languages className="h-5 w-5" />}
              title="Five languages"
              text="Mandinka, Wolof, Fula, Jola, and English — voice notes are auto-transcribed."
            />
            <FeatureCard
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Routed to authorities"
              text="Reports go to the Police or Department of Women & Children Welfare."
            />
          </div>
        </section>

        <footer className="mx-auto max-w-6xl px-4 py-10 text-center text-sm text-muted-foreground">
          <Link to="/staff/login" className="underline-offset-4 hover:underline">
            {t("staff_login")}
          </Link>
        </footer>
      </main>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <Card className="p-5">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </Card>
  );
}
