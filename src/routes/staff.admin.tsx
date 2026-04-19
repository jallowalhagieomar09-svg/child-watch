import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2, UserPlus } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AppRole } from "@/hooks/useAuth";

export const Route = createFileRoute("/staff/admin")({
  component: AdminPage,
});

type RoleRow = {
  id: string;
  user_id: string;
  role: AppRole;
  profile?: { display_name: string | null; contact_email: string | null } | null;
};

function AdminPage() {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<RoleRow[]>([]);
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<AppRole>("welfare");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user || !roles.includes("admin")) {
      void navigate({ to: "/" });
      return;
    }
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, roles, loading]);

  const load = async () => {
    const { data } = await supabase
      .from("user_roles")
      .select("id, user_id, role, profile:profiles!profiles_user_id_fkey(display_name, contact_email)")
      .order("created_at", { ascending: false });
    setRows((data as unknown as RoleRow[]) ?? []);
  };

  const addRole = async () => {
    if (!userId.trim()) return;
    setSaving(true);
    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: userId.trim(), role });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setUserId("");
    toast.success("Role added");
    void load();
  };

  const removeRole = async (id: string) => {
    const { error } = await supabase.from("user_roles").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    void load();
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl space-y-4 px-4 py-8">
        <h1 className="text-2xl font-semibold">Manage staff</h1>

        <Card className="space-y-3 p-5">
          <h2 className="text-sm font-semibold">Add role to user</h2>
          <p className="text-xs text-muted-foreground">
            The user must already have an account. Paste their user ID (from Lovable Cloud →
            Users) below.
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="uid">User ID</Label>
            <Input
              id="uid"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="00000000-0000-0000-0000-000000000000"
              maxLength={64}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as AppRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="police">Police</SelectItem>
                <SelectItem value="welfare">Welfare</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => void addRole()} disabled={saving || !userId}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add
          </Button>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold">Current staff</h2>
          <ul className="mt-3 space-y-2">
            {rows.length === 0 && (
              <li className="text-xs text-muted-foreground">No staff yet.</li>
            )}
            {rows.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between border-b border-border pb-2 last:border-0"
              >
                <div className="text-sm">
                  <div className="font-medium">
                    {r.profile?.display_name || r.profile?.contact_email || r.user_id}
                  </div>
                  <div className="text-xs text-muted-foreground">{r.role}</div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => void removeRole(r.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      </main>
    </div>
  );
}
