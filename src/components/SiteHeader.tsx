import { Link } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const { t } = useI18n();
  const { user, roles, signOut } = useAuth();
  const isStaff = roles.length > 0;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Shield className="h-5 w-5" />
          </div>
          <span className="hidden text-base font-semibold sm:inline">{t("app_name")}</span>
        </Link>

        <nav className="flex items-center gap-2">
          <LanguageSwitcher compact />
          <ThemeToggle />
          {user ? (
            <>
              {isStaff ? (
                <Button asChild size="sm" variant="outline">
                  <Link to="/staff">{t("dashboard")}</Link>
                </Button>
              ) : (
                <Button asChild size="sm" variant="outline">
                  <Link to="/my-reports">{t("my_reports")}</Link>
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => void signOut()}>
                {t("sign_out")}
              </Button>
            </>
          ) : (
            <Button asChild size="sm" variant="ghost">
              <Link to="/auth">{t("sign_in")}</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
