import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const fn =
      mode === "signin" ? signIn(email, password) : signUp(email, password, displayName);
    const { error } = await fn;
    setLoading(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success(mode === "signin" ? "Signed in" : "Account created");
      void navigate({ to: "/my-reports" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-md px-4 py-10">
        <Card className="p-6">
          <h1 className="text-2xl font-semibold">
            {mode === "signin" ? t("sign_in") : t("sign_up")}
          </h1>
          <div className="mt-6">
            <GoogleSignInButton />
          </div>
          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="dn">{t("display_name")}</Label>
                <Input
                  id="dn"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={120}
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="em">{t("email")}</Label>
              <Input
                id="em"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pw">{t("password")}</Label>
              <Input
                id="pw"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("loading") : mode === "signin" ? t("sign_in") : t("sign_up")}
            </Button>
          </form>
          <button
            className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? t("no_account") : t("has_account")}
          </button>
        </Card>
      </main>
    </div>
  );
}
