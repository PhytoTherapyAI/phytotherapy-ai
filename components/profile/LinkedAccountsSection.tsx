// © 2026 DoctoPal — All Rights Reserved
"use client";

import { useEffect, useState } from "react";
import { tx } from "@/lib/translations";
import { createBrowserClient } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Trash2, X, Loader2, CheckCircle2, Check, Users, Mail, UserPlus, ChevronUp,
} from "lucide-react";

interface LinkedAccount {
  id: string;
  parent_user_id: string;
  linked_user_id: string | null;
  relationship: string;
  permissions: string[];
  pays_subscription: boolean;
  is_accepted: boolean;
  invite_email: string | null;
  created_at: string;
  linkedName?: string;
  parentName?: string;
}

export function LinkedAccountsSection({ lang, userId }: { lang: "en" | "tr"; userId: string }) {
  const [asParent, setAsParent] = useState<LinkedAccount[]>([]);
  const [asLinked, setAsLinked] = useState<LinkedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [inviteEmail, setInviteEmail] = useState("");
  const [relationship, setRelationship] = useState("spouse");
  const [permViewData, setPermViewData] = useState(false);
  const [permPaySub, setPermPaySub] = useState(false);
  const [permManageMeds, setPermManageMeds] = useState(false);

  useEffect(() => {
    fetchLinked();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchLinked = async () => {
    setLoading(true);
    try {
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch("/api/linked-accounts", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setAsParent(data.asParent || []);
      setAsLinked(data.asLinked || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const sendInvite = async () => {
    if (!inviteEmail.trim()) return;
    setSending(true);
    setError(null);
    setSuccess(false);
    try {
      const permissions: string[] = [];
      if (permViewData) permissions.push("view_data");
      if (permPaySub) permissions.push("pays_subscription");
      if (permManageMeds) permissions.push("manage_medications");

      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/linked-accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: "invite",
          email: inviteEmail.trim(),
          relationship,
          permissions,
          pays_subscription: permPaySub,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to send invite");
        return;
      }

      setSuccess(true);
      setInviteEmail("");
      setPermViewData(false);
      setPermPaySub(false);
      setPermManageMeds(false);
      setShowForm(false);
      await fetchLinked();
    } catch {
      setError(tx("profile.errInviteFailed", lang));
    } finally {
      setSending(false);
    }
  };

  const removeLinked = async (id: string) => {
    if (!confirm(tx("linked.removeConfirm", lang))) return;
    try {
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await fetch("/api/linked-accounts", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ linkedAccountId: id }),
      });
      await fetchLinked();
    } catch {
      // silent
    }
  };

  const acceptInvite = async (id: string) => {
    try {
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await fetch("/api/linked-accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action: "accept", linkedAccountId: id }),
      });
      await fetchLinked();
    } catch {
      // silent
    }
  };

  const relationshipLabel = (rel: string): string => {
    const map: Record<string, string> = {
      mother: tx("linked.mother", lang),
      father: tx("linked.father", lang),
      child: tx("linked.child", lang),
      spouse: tx("linked.spouse", lang),
      grandparent: tx("linked.grandparent", lang),
      sibling: tx("linked.sibling", lang),
      other: tx("linked.other", lang),
    };
    return map[rel] || rel;
  };

  const relationships = [
    { value: "mother", label: tx("linked.mother", lang) },
    { value: "father", label: tx("linked.father", lang) },
    { value: "child", label: tx("linked.child", lang) },
    { value: "spouse", label: tx("linked.spouse", lang) },
    { value: "grandparent", label: tx("linked.grandparent", lang) },
    { value: "sibling", label: tx("linked.sibling", lang) },
    { value: "other", label: tx("linked.other", lang) },
  ];

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {tx("linked.title", lang)}
            </CardTitle>
            <CardDescription>{tx("linked.subtitle", lang)}</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            {showForm ? tx("common.close", lang) : tx("linked.addAccount", lang)}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="space-y-3 rounded-lg border border-dashed border-primary/30 p-4">
            <div className="space-y-1">
              <Label className="text-xs">{tx("linked.email", lang)}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">{tx("linked.relationship", lang)}</Label>
              <Select value={relationship} onValueChange={(v) => v && setRelationship(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {relationships.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">{tx("linked.permissions", lang)}</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="perm-view"
                    checked={permViewData}
                    onCheckedChange={(c) => setPermViewData(c === true)}
                  />
                  <Label htmlFor="perm-view" className="text-sm font-normal">
                    {tx("linked.viewData", lang)}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="perm-pay"
                    checked={permPaySub}
                    onCheckedChange={(c) => setPermPaySub(c === true)}
                  />
                  <Label htmlFor="perm-pay" className="text-sm font-normal">
                    {tx("linked.paySubscription", lang)}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="perm-meds"
                    checked={permManageMeds}
                    onCheckedChange={(c) => setPermManageMeds(c === true)}
                  />
                  <Label htmlFor="perm-meds" className="text-sm font-normal">
                    {tx("linked.manageMeds", lang)}
                  </Label>
                </div>
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={sendInvite}
                disabled={!inviteEmail.trim() || sending}
                className="gap-1 bg-primary hover:bg-primary/90"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                {tx("linked.sendInvite", lang)}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowForm(false)}
              >
                <X className="h-4 w-4 mr-1" />
                {tx("profile.cancel", lang)}
              </Button>
            </div>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950/20 dark:text-green-300">
            <CheckCircle2 className="h-4 w-4" />
            {tx("linked.inviteSent", lang)}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : asParent.length === 0 && asLinked.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {tx("linked.noAccounts", lang)}
          </p>
        ) : (
          <div className="space-y-3">
            {asParent.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {tx("linked.iManage", lang)}
                </p>
                {asParent.map((account) => (
                  <div key={account.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium">
                          {account.linkedName || account.invite_email || "—"}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <Badge variant="secondary" className="text-[10px]">
                            {relationshipLabel(account.relationship)}
                          </Badge>
                          <Badge
                            variant={account.is_accepted ? "default" : "outline"}
                            className="text-[10px]"
                          >
                            {account.is_accepted
                              ? tx("linked.accepted", lang)
                              : tx("linked.pending", lang)}
                          </Badge>
                          {account.permissions.map((p) => (
                            <Badge key={p} variant="outline" className="text-[10px]">
                              {p === "view_data" ? tx("common.view", lang)
                                : p === "pays_subscription" ? tx("common.pay", lang)
                                : p === "manage_medications" ? tx("common.meds", lang)
                                : p}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeLinked(account.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {asLinked.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {tx("linked.managedBy", lang)}
                </p>
                {asLinked.map((account) => (
                  <div key={account.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {account.parentName || "—"}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <Badge variant="secondary" className="text-[10px]">
                            {relationshipLabel(account.relationship)}
                          </Badge>
                          {!account.is_accepted && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-5 text-[10px] gap-1"
                              onClick={() => acceptInvite(account.id)}
                            >
                              <Check className="h-3 w-3" />
                              {tx("linked.accepted", lang).split("!")[0]}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeLinked(account.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
