import { useEffect, useMemo, useState } from "react";
import { apiService, type ClaimRequest } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

type Hub = {
  id: string;
  name: string;
  city: string;
  suburb: string | null;
  address?: string | null;
};

const ALL_STATUSES: ClaimRequest["status"][] = [
  "pending",
  "approved",
  "scheduled",
  "ready",
  "collected",
  "completed",
  "rejected",
  "cancelled",
];

const statusStyle = (s: ClaimRequest["status"]) => {
  switch (s) {
    case "approved":
      return "bg-blue-100 text-blue-700";
    case "scheduled":
      return "bg-amber-100 text-amber-800";
    case "ready":
      return "bg-emerald-100 text-emerald-700";
    case "collected":
      return "bg-gray-100 text-gray-700";
    case "completed":
      return "bg-slate-100 text-slate-800";
    case "rejected":
      return "bg-red-100 text-red-700";
    case "cancelled":
      return "bg-zinc-100 text-zinc-700";
    default:
      return "bg-zinc-100 text-zinc-700";
  }
};

export default function AdminClaimTriage() {
  const { profile } = useAuth();
  const { toast } = useToast();

  const [rows, setRows] = useState<ClaimRequest[]>([]);
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<ClaimRequest["status"] | "all">("pending");
  const [search, setSearch] = useState("");

  const isAdmin = profile?.role === "admin";

  const hubById = useMemo(() => {
    const map = new Map<string, Hub>();
    hubs.forEach((h) => map.set(h.id, h));
    return map;
  }, [hubs]);

  const load = async () => {
    setLoading(true);
    try {
      const [claimsRes, hubsRes] = await Promise.all([
        apiService.getClaimRequestsAdmin(),
        apiService.getFoodHubs({ is_active: true }),
      ]);

      if (claimsRes.error) throw claimsRes.error;
      if (hubsRes.error) throw hubsRes.error;

      setRows((claimsRes.data || []) as ClaimRequest[]);
      setHubs(
        (hubsRes.data || []).map((h: any) => ({
          id: h.id,
          name: h.name,
          city: h.city,
          suburb: h.suburb ?? null,
          address: h.address ?? null,
        }))
      );
    } catch (e: any) {
      toast({
        title: "Couldn’t load requests",
        description: e?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const updateStatus = async (id: string, status: ClaimRequest["status"]) => {
    try {
      const { error } = await apiService.updateClaimRequestStatus(id, status);
      if (error) throw error;
      toast({ title: "Status updated" });
      load();
    } catch (e: any) {
      toast({
        title: "Update failed",
        description: e?.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const reassignHub = async (id: string, hub_id: string) => {
    try {
      const { error } = await apiService.updateClaimRequest(id, { hub_id });
      if (error) throw error;
      toast({ title: "Hub reassigned" });
      load();
    } catch (e: any) {
      toast({
        title: "Update failed",
        description: e?.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!isAdmin) {
    return (
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Admin – Claim Triage</CardTitle>
        </CardHeader>
        <CardContent>Admins only.</CardContent>
      </Card>
    );
    }

  const filtered = rows.filter((r) => {
    const okStatus = filterStatus === "all" ? true : r.status === filterStatus;
    const q = search.trim().toLowerCase();
    const hub = r.hub_id ? hubById.get(r.hub_id) : undefined;
    const okSearch =
      !q ||
      r.id.toLowerCase().includes(q) ||
      (hub?.name || "").toLowerCase().includes(q) ||
      (hub?.city || "").toLowerCase().includes(q) ||
      (hub?.suburb || "").toLowerCase().includes(q);
    return okStatus && okSearch;
  });

  return (
    <Card className="max-w-6xl mx-auto">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle>Admin – Claim Triage</CardTitle>
          <div className="flex gap-2 w-full sm:w-auto">
            <Input
              placeholder="Search ID, hub, city…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64"
            />
            <Select
              value={filterStatus}
              onValueChange={(v) => setFilterStatus(v as ClaimRequest["status"] | "all")}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {ALL_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={load}>
              <Loader2 className="h-4 w-4 mr-2" />
              Reload
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="py-10 text-center text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground">No matching requests.</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((r) => {
              const hub = r.hub_id ? hubById.get(r.hub_id) : undefined;
              return (
                <div key={r.id} className="border rounded-xl p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        ID: <span className="font-mono">{r.id.slice(0, 8)}</span> •{" "}
                        {new Date(r.created_at).toLocaleString()}
                      </div>
                      <div className="text-lg font-semibold">
                        {hub?.name || "—"}
                        {hub?.suburb ? ` • ${hub.suburb}` : ""}
                        {hub?.city ? ` • ${hub.city}` : ""}
                      </div>

                      <div className="text-sm mt-1">
                        Dietary:{" "}
                        {r.dietary
                          ? (() => {
                              try {
                                const d =
                                  typeof r.dietary === "string"
                                    ? JSON.parse(r.dietary)
                                    : r.dietary;
                                const keys = Object.keys(d || {}).filter((k) => Boolean(d[k]));
                                return keys.length ? keys.join(", ") : "—";
                              } catch {
                                return "—";
                              }
                            })()
                          : "—"}
                      </div>

                      {r.preferred_window && (
                        <div className="text-sm">Preferred window: {r.preferred_window}</div>
                      )}
                      {r.notes && <div className="text-sm mt-1">Notes: {r.notes}</div>}
                    </div>

                    <Badge className={statusStyle(r.status)}>{r.status}</Badge>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    <Button
                      variant="secondary"
                      onClick={() => updateStatus(r.id, "approved")}
                      disabled={!(r.status === "pending" || r.status === "rejected")}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => updateStatus(r.id, "rejected")}
                      disabled={r.status === "rejected" || r.status === "collected" || r.status === "completed"}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => updateStatus(r.id, "ready")}
                      disabled={!(r.status === "approved" || r.status === "scheduled")}
                    >
                      Mark Ready
                    </Button>
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => updateStatus(r.id, "collected")}
                      disabled={r.status !== "ready"}
                    >
                      Mark Collected
                    </Button>
                  </div>

                  {/* Optional: reassign hub */}
                  <div className="mt-3 flex items-center gap-2">
                    <Select
                      value={r.hub_id || undefined}
                      onValueChange={(v) => reassignHub(r.id, v)}
                    >
                      <SelectTrigger className="w-[260px]">
                        <SelectValue placeholder="Reassign hub…" />
                      </SelectTrigger>
                      <SelectContent>
                        {hubs.map((h) => (
                          <SelectItem key={h.id} value={h.id}>
                            {h.name} {h.suburb ? `• ${h.suburb}` : ""} • {h.city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
