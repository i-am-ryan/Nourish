import { useEffect, useMemo, useState } from "react";
import { apiService, type ClaimRequest } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin } from "lucide-react";

type Hub = {
  id: string;
  name: string;
  city: string;
  suburb: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

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

export default function MyRequests() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [rows, setRows] = useState<ClaimRequest[]>([]);
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [loading, setLoading] = useState(true);

  const hubById = useMemo(() => {
    const map = new Map<string, Hub>();
    hubs.forEach((h) => map.set(h.id, h));
    return map;
  }, [hubs]);

  const load = async () => {
    setLoading(true);
    try {
      const [claimsRes, hubsRes] = await Promise.all([
        apiService.getClaimRequests({ mine: true }),
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
          latitude: h.latitude ?? null,
          longitude: h.longitude ?? null,
        }))
      );
    } catch (e: any) {
      toast({
        title: "Couldn’t load your requests",
        description: e?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const cancelRequest = async (id: string) => {
    try {
      const { error } = await apiService.updateClaimRequestStatus(id, "cancelled");
      if (error) throw error;
      toast({ title: "Request cancelled" });
      load();
    } catch (e: any) {
      toast({
        title: "Cancel failed",
        description: e?.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const mapsUrl = (h: Hub) => {
    if (h.latitude && h.longitude) {
      return `https://www.google.com/maps?q=${h.latitude},${h.longitude}`;
    }
    const q = encodeURIComponent([h.name, h.suburb, h.city].filter(Boolean).join(", "));
    return `https://www.google.com/maps/search/?api=1&query=${q}`;
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>My Requests</CardTitle>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="py-10 text-center text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : rows.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground">You haven’t submitted any requests yet.</div>
        ) : (
          <div className="space-y-3">
            {rows.map((r) => {
              const hub = r.hub_id ? hubById.get(r.hub_id) : undefined;
              return (
                <div key={r.id} className="border rounded-xl p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Submitted: {new Date(r.created_at).toLocaleString()}
                      </div>
                      <div className="text-lg font-semibold">
                        {hub?.name || "—"}
                        {hub?.suburb ? ` • ${hub.suburb}` : ""}
                        {hub?.city ? ` • ${hub.city}` : ""}
                      </div>
                      {r.preferred_window && (
                        <div className="text-sm">Pickup window: {r.preferred_window}</div>
                      )}

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

                      {hub && (
                        <a
                          href={mapsUrl(hub)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 text-sm mt-2 underline underline-offset-4"
                        >
                          <MapPin className="h-4 w-4" />
                          Open in Google Maps
                        </a>
                      )}

                      {r.notes && <div className="text-sm mt-2">Notes: {r.notes}</div>}
                    </div>

                    <Badge className={statusStyle(r.status)}>{r.status}</Badge>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      onClick={() => cancelRequest(r.id)}
                      disabled={!(r.status === "pending" || r.status === "approved" || r.status === "scheduled")}
                    >
                      Cancel request
                    </Button>
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
