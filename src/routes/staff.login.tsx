import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";

export const Route = createFileRoute("/staff/login")({
  component: StaffLogin,
});

function StaffLogin() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) toast.error(error);
    else void navigate({ to: "/staff" });
  };

  const onForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address first.");
      return;
    }
    setResetLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setResetLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password reset link sent! Check your email.");
      setForgotMode(false);
    }
  };

  if (forgotMode) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto max-w-md px-4 py-10">
          <Card className="p-6">
            <h1 className="text-2xl font-semibold">Reset Password</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your email and we'll send you a password reset link.
            </p>
            <form onSubmit={onForgotPassword} className="mt-6 space-y-4">
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
              <Button type="submit" className="w-full" disabled={resetLoading}>
                {resetLoading ? t("loading") : "Send Reset Link"}
              </Button>
            </form>
            <button
              className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setForgotMode(false)}
            >
              Back to login
            </button>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-md px-4 py-10">
        <Card className="p-6">
          <h1 className="text-2xl font-semibold">{t("staff_login")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            For Police and Department of Women & Children Welfare staff only.
          </p>
          <div className="mt-6">
            <GoogleSignInButton />
          </div>
          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
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
              {loading ? t("loading") : t("sign_in")}
            </Button>
          </form>
          <button
            className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground"
            onClick={() => setForgotMode(true)}
          >
            Forgot password?
          </button>
        </Card>
      </main>
    </div>
  );
}