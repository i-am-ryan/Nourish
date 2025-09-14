// /src/pages/BagRequestsAdmin.tsx
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

type Status = "pending" | "approved" | "declined" | "completed";

type Row = {
  id: string;
  created_at: string;
  status: Status;
  user_id: string;
  hub_id: string;
  diet: string[] | null;
  allergies: string | null;
  notes: string | null;
  pickup_start: string | null;
  pickup_end: string | null;
  hub: { name: string; city: string; suburb: string | null } | null;
  profile: { full_name: string | null; email: string | null } | null;
};

export default function BagRequestsAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [status, setStatus] = useState<Status>("pending");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("bag_requests_view") // View should join bag_requests + food_hubs + profiles
        .select("*")
        .eq("status", status)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRows((data as Row[]) || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load bag requests.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // load whenever status changes
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    const s = q.toLowerCase();
    return rows.filter((r) =>
      [r.hub?.name, r.hub?.city, r.hub?.suburb, r.profile?.full_name, r.profile?.email]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(s)
    );
  }, [rows, q]);

  const update = async (id: string, next: Status) => {
    setBusyId(id);
    try {
      const { error } = await supabase.from("bag_requests").update({ status: next }).eq("id", id);
      if (error) throw error;
      await load();
    } catch (e) {
      // surface silently in UI header
      setError((e as any)?.message || "Update failed.");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this request? This cannot be undone.")) return;
    setBusyId(id);
    try {
      const { error } = await supabase.from("bag_requests").delete().eq("id", id);
      if (error) throw error;
      await load();
    } catch (e) {
      setError((e as any)?.message || "Delete failed.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 pt-24 pb-16">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4 mb-4">
        <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {(["pending", "approved", "declined", "completed"] as Status[]).map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Search name, email, hub, city, suburb…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="md:flex-1"
        />
      </div>

      {error && (
        <div className="mb-4 text-sm rounded-lg border border-red-200 bg-red-50 text-red-700 px-3 py-2">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-sm text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin inline-block mr-2" />
          Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-600">No requests found.</div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border bg-white/70 backdrop-blur-xl p-4"
            >
              <div className="flex flex-wrap items-center gap-2 justify-between">
                <div className="font-medium">
                  {r.hub?.name || "Hub"}{" "}
                  {r.hub?.suburb ? `• ${r.hub.suburb}` : ""}{" "}
                  {r.hub?.city ? `• ${r.hub.city}` : ""}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(r.created_at).toLocaleString()}
                </div>
              </div>

              <div className="text-sm text-gray-600 mt-1">
                {(r.profile?.full_name || "User") + (r.profile?.email ? ` — ${r.profile.email}` : "")}
              </div>

              <div className="text-sm mt-2">
                <span className="font-medium">Diet:</span>{" "}
                {(r.diet ?? []).join(", ") || "—"}
              </div>
              <div className="text-sm text-gray-600">
                Allergies: {r.allergies || "—"}
              </div>
              {r.notes && (
                <div className="text-sm text-gray-600">
                  Notes: {r.notes}
                </div>
              )}
              <div className="text-sm text-gray-600">
                Pickup: {r.pickup_start ?? "—"}–{r.pickup_end ?? "—"}
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                <Button
                  onClick={() => update(r.id, "approved")}
                  className="rounded-xl"
                  disabled={busyId === r.id}
                >
                  {busyId === r.id ? "Working…" : "Approve"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => update(r.id, "completed")}
                  className="rounded-xl"
                  disabled={busyId === r.id}
                >
                  Mark complete
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => update(r.id, "declined")}
                  className="rounded-xl"
                  disabled={busyId === r.id}
                >
                  Decline
                </Button>
                <Button
                  variant="outline"
                  onClick={() => remove(r.id)}
                  className="rounded-xl"
                  disabled={busyId === r.id}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
