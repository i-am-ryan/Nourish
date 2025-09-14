import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/* ------------------------------------------------------------------ */
/* Inline chips + tiny SVG icons (no extra icon deps)                 */
/* ------------------------------------------------------------------ */
function Pill({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}

const IcoActivity = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" {...p}>
    <path d="M3 12h4l3 8 4-16 3 8h4" strokeWidth="2" />
  </svg>
);
const IcoPkg = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" {...p}>
    <path d="m3 7 9-4 9 4-9 4-9-4Z" strokeWidth="2" />
    <path d="M21 7v10l-9 4-9-4V7" strokeWidth="2" />
    <path d="M12 11v10" strokeWidth="2" />
  </svg>
);
const IcoClip = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" {...p}>
    <rect x="9" y="2" width="6" height="4" rx="1" strokeWidth="2" />
    <rect x="4" y="5" width="16" height="16" rx="2" strokeWidth="2" />
  </svg>
);
const IcoUsers = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" strokeWidth="2" />
    <circle cx="9" cy="7" r="4" strokeWidth="2" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" strokeWidth="2" />
    <path d="M16 3.13A4 4 0 0 1 18 7" strokeWidth="2" />
  </svg>
);
const IcoPin = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" {...p}>
    <path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10Z" strokeWidth="2" />
    <circle cx="12" cy="11" r="2" strokeWidth="2" />
  </svg>
);
const IcoMegaphone = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" {...p}>
    <path d="M3 11v2a4 4 0 0 0 4 4h1" strokeWidth="2" />
    <path d="M14 8v8l7-4-7-4Z" strokeWidth="2" />
    <path d="M7 15v5" strokeWidth="2" />
  </svg>
);
const IcoCheck = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" {...p}>
    <path d="M20 6 9 17l-5-5" strokeWidth="2" />
  </svg>
);
const IcoTrash = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" {...p}>
    <path d="M3 6h18" strokeWidth="2" />
    <path d="M8 6V4h8v2" strokeWidth="2" />
    <rect x="6" y="6" width="12" height="14" rx="2" strokeWidth="2" />
  </svg>
);
const IcoAlert = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" {...p}>
    <path d="M12 9v4m0 4h.01" strokeWidth="2" />
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" strokeWidth="2" />
  </svg>
);

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */
type Donation = { id: string; title?: string | null; status?: string | null; created_at?: string | null };
type Claim = { id: string; status?: string | null; created_at?: string | null };
type Profile = {
  id: string;
  full_name?: string | null;
  email?: string | null;
  role?: string | null;
  is_admin?: boolean | null;
  is_active?: boolean | null;
  created_at?: string | null;
};
type FoodHub = { id: string; name?: string | null; city?: string | null; suburb?: string | null; verified?: boolean | null };
type VolunteerTask = { id: string; title?: string | null; status?: string | null; due_date?: string | null; created_at?: string | null };
type Announcement = { id: string; title?: string | null; content?: string | null; type?: string | null; target_audience?: string[] | null; created_at?: string | null };

type TabKey =
  | "overview"
  | "donations"
  | "claims"
  | "announcements"
  | "users"
  | "volunteer_tasks"
  | "food_hubs";

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */
const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleString() : "—");

function statusPill(status?: string | null) {
  const s = (status || "").toLowerCase();
  if (s === "available" || s === "open")
    return <Pill className="bg-emerald-600/90 text-white">{status}</Pill>;
  if (s === "pending" || s === "in_progress")
    return <Pill className="bg-amber-500 text-white">{status}</Pill>;
  if (s === "claimed" || s === "approved" || s === "assigned")
    return <Pill className="bg-blue-600 text-white">{status}</Pill>;
  if (s === "rejected" || s === "cancelled")
    return <Pill className="bg-rose-600 text-white">{status}</Pill>;
  if (s === "delivered" || s === "done" || s === "completed")
    return <Pill className="bg-slate-700 text-white">{status}</Pill>;
  return <Pill className="bg-gray-200 text-gray-700">{status || "—"}</Pill>;
}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */
export default function AdminDashboard() {
  const { toast } = useToast();

  // Read tab from ?tab= but fall back to overview
  const initialTab = useMemo(() => {
    const qs = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const t = (qs?.get("tab") || "overview") as TabKey;
    const ok = ["overview","donations","claims","announcements","users","volunteer_tasks","food_hubs"].includes(t);
    return (ok ? t : "overview") as TabKey;
  }, []);

  const [tab, setTab] = useState<TabKey>(initialTab);
  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    qs.set("tab", tab);
    history.replaceState(null, "", `${window.location.pathname}?${qs.toString()}`);
  }, [tab]);

  const [loading, setLoading] = useState(true);

  const [donations, setDonations] = useState<Donation[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [hubs, setHubs] = useState<FoodHub[]>([]);
  const [tasks, setTasks] = useState<VolunteerTask[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const [totalDonations, setTotalDonations] = useState(0);
  const [activeDonations, setActiveDonations] = useState(0);
  const [totalClaims, setTotalClaims] = useState(0);
  const [pendingClaims, setPendingClaims] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalHubs, setTotalHubs] = useState(0);

  async function loadAll() {
    setLoading(true);
    try {
      const [{ data: d1 }, { data: c1 }, { data: u1 }, { data: h1 }, { data: t1 }, { data: a1 }] =
        await Promise.all([
          supabase.from("donations").select("*").order("created_at", { ascending: false }).limit(50),
          supabase.from("claims").select("*").order("created_at", { ascending: false }).limit(50),
          supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(100),
          supabase.from("food_hubs").select("*").order("created_at", { ascending: false }).limit(100),
          supabase.from("volunteer_tasks").select("*").order("created_at", { ascending: false }).limit(100),
          supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(50),
        ]);

      setDonations((d1 as any[])?.map((r) => ({ id: String(r.id), title: r.title, status: r.status, created_at: r.created_at })) || []);
      setClaims((c1 as any[])?.map((r) => ({ id: String(r.id), status: r.status, created_at: r.created_at })) || []);
      setUsers((u1 as any[])?.map((r) => ({
        id: String(r.id),
        full_name: r.full_name,
        email: r.email,
        role: r.role,
        is_admin: r.is_admin,
        is_active: r.is_active,
        created_at: r.created_at,
      })) || []);
      setHubs((h1 as any[])?.map((r) => ({ id: String(r.id), name: r.name, city: r.city, suburb: r.suburb, verified: r.verified })) || []);
      setTasks((t1 as any[])?.map((r) => ({ id: String(r.id), title: r.title, status: r.status, due_date: r.due_date ?? r.scheduled_date, created_at: r.created_at })) || []);
      setAnnouncements((a1 as any[])?.map((r) => ({ id: String(r.id), title: r.title, content: r.content, type: r.type, target_audience: r.target_audience, created_at: r.created_at })) || []);

      const [
        { count: dCount },
        { count: dActive },
        { count: cCount },
        { count: cPending },
        { count: uCount },
        { count: hCount },
      ] = await Promise.all([
        supabase.from("donations").select("*", { count: "exact", head: true }),
        supabase.from("donations").select("*", { count: "exact", head: true }).eq("status", "available"),
        supabase.from("claims").select("*", { count: "exact", head: true }),
        supabase.from("claims").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("food_hubs").select("*", { count: "exact", head: true }),
      ]);

      setTotalDonations(dCount || 0);
      setActiveDonations(dActive || 0);
      setTotalClaims(cCount || 0);
      setPendingClaims(cPending || 0);
      setTotalUsers(uCount || 0);
      setTotalHubs(hCount || 0);
    } catch (e: any) {
      toast({
        title: "Failed to load admin data",
        description: e?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAll();
  }, []);

  /* --------------------------- UI building blocks --------------------------- */
  function TabsHeader() {
    const tabs: Array<{ key: TabKey; label: string; Icon: React.FC<any> }> = [
      { key: "overview", label: "Overview", Icon: IcoActivity },
      { key: "donations", label: "Donations", Icon: IcoPkg },
      { key: "claims", label: "Claims", Icon: IcoClip },
      { key: "announcements", label: "Announcements", Icon: IcoMegaphone },
      { key: "users", label: "Users", Icon: IcoUsers },
      { key: "volunteer_tasks", label: "Volunteer Tasks", Icon: IcoCheck },
      { key: "food_hubs", label: "Food Hubs", Icon: IcoPin },
    ];
    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {tabs.map(({ key, label, Icon }) => {
          const active = tab === key;
          return (
            <Button
              key={key}
              variant={active ? "default" : "outline"}
              className={active ? "bg-emerald-600 hover:bg-emerald-700" : "bg-white hover:bg-emerald-50"}
              onClick={() => setTab(key)}
            >
              <Icon className="mr-2" />
              {label}
            </Button>
          );
        })}
      </div>
    );
  }

  function StatCard({
    title,
    subtitle,
    value,
    secondary,
    Icon,
  }: {
    title: string;
    subtitle?: string;
    value: number | string;
    secondary?: string;
    Icon: React.FC<any>;
  }) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{title}</CardTitle>
            <Icon />
          </div>
          {subtitle && <CardDescription>{subtitle}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-extrabold">{value}</div>
          {secondary && <div className="text-xs text-gray-500 mt-1">{secondary}</div>}
        </CardContent>
      </Card>
    );
  }

  function Empty({ label }: { label: string }) {
    return (
      <div className="py-10 text-center text-sm text-gray-600">
        <IcoAlert className="inline-block mr-1" />
        {label}
      </div>
    );
  }

  /* ------------------------------ Sections --------------------------------- */

  function Overview() {
    return (
      <>
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            title="Total Donations"
            subtitle="Active donations"
            value={totalDonations}
            secondary={`${activeDonations} active`}
            Icon={IcoPkg}
          />
          <StatCard
            title="Total Claims"
            subtitle={`Pending: ${pendingClaims}`}
            value={totalClaims}
            Icon={IcoClip}
          />
          <StatCard
            title="Users"
            subtitle="Registered accounts"
            value={totalUsers}
            Icon={IcoUsers}
          />
          <StatCard
            title="Food Hubs"
            subtitle="Active hubs"
            value={totalHubs}
            Icon={IcoPin}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Donations</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-sm text-gray-500">Loading…</div>
              ) : donations.length === 0 ? (
                <div className="text-sm text-gray-500">No recent donations</div>
              ) : (
                <ul className="divide-y">
                  {donations.slice(0, 6).map((d) => (
                    <li key={d.id} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{d.title || "Untitled"}</div>
                        <div className="text-xs text-gray-500">{fmtDate(d.created_at)}</div>
                      </div>
                      <div>{statusPill(d.status)}</div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Claims</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-sm text-gray-500">Loading…</div>
              ) : claims.length === 0 ? (
                <div className="text-sm text-gray-500">No recent claims</div>
              ) : (
                <ul className="divide-y">
                  {claims.slice(0, 6).map((c) => (
                    <li key={c.id} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium">Claim #{c.id}</div>
                        <div className="text-xs text-gray-500">{fmtDate(c.created_at)}</div>
                      </div>
                      <div>{statusPill(c.status)}</div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  function DonationsTab() {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Donations</CardTitle>
          <CardDescription>Latest donations</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-gray-500">Loading…</div>
          ) : donations.length === 0 ? (
            <Empty label="No donations found" />
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-3">Title</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((d) => (
                    <tr key={d.id} className="border-b">
                      <td className="py-2 pr-3">{d.title || "Untitled"}</td>
                      <td className="py-2 pr-3">{statusPill(d.status)}</td>
                      <td className="py-2 pr-3">{fmtDate(d.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  function ClaimsTab() {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Claims</CardTitle>
          <CardDescription>Latest claims</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-gray-500">Loading…</div>
          ) : claims.length === 0 ? (
            <Empty label="No claims found" />
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-3">Claim #</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map((c) => (
                    <tr key={c.id} className="border-b">
                      <td className="py-2 pr-3">#{c.id}</td>
                      <td className="py-2 pr-3">{statusPill(c.status)}</td>
                      <td className="py-2 pr-3">{fmtDate(c.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  function UsersTab() {
    const [busy, setBusy] = useState<string | null>(null);

    const setRole = async (u: Profile, makeAdmin: boolean) => {
      setBusy(u.id);
      try {
        const { error } = await supabase
          .from("profiles")
          .update({ role: makeAdmin ? "admin" : "user", is_admin: makeAdmin })
          .eq("id", u.id);
        if (error) throw error;
        setUsers((prev) =>
          prev.map((x) => (x.id === u.id ? { ...x, role: makeAdmin ? "admin" : "user", is_admin: makeAdmin } : x))
        );
        toast({ title: makeAdmin ? "Promoted to admin" : "Demoted to user" });
      } catch (e: any) {
        toast({ title: "Update failed", description: e?.message, variant: "destructive" });
      } finally {
        setBusy(null);
      }
    };

    const deactivate = async (u: Profile) => {
      if (!confirm(`Deactivate ${u.email}?`)) return;
      setBusy(u.id);
      try {
        const { error } = await supabase.from("profiles").update({ is_active: false }).eq("id", u.id);
        if (error) throw error;
        setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, is_active: false } : x)));
        toast({ title: "User deactivated" });
      } catch (e: any) {
        toast({ title: "Action failed", description: e?.message, variant: "destructive" });
      } finally {
        setBusy(null);
      }
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Registered accounts</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-gray-500">Loading…</div>
          ) : users.length === 0 ? (
            <Empty label="No users found" />
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-3">Name</th>
                    <th className="py-2 pr-3">Email</th>
                    <th className="py-2 pr-3">Role</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Created</th>
                    <th className="py-2 pr-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b">
                      <td className="py-2 pr-3">{u.full_name || "—"}</td>
                      <td className="py-2 pr-3">{u.email || "—"}</td>
                      <td className="py-2 pr-3">
                        <Pill className={u.role === "admin" ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-800"}>
                          {u.role || "user"}
                        </Pill>
                      </td>
                      <td className="py-2 pr-3">
                        <Pill className={u.is_active === false ? "bg-rose-600 text-white" : "bg-emerald-100 text-emerald-900"}>
                          {u.is_active === false ? "inactive" : "active"}
                        </Pill>
                      </td>
                      <td className="py-2 pr-3">{fmtDate(u.created_at)}</td>
                      <td className="py-2 pr-3">
                        <div className="flex flex-wrap gap-2">
                          {u.role === "admin" ? (
                            <Button size="sm" variant="outline" disabled={busy === u.id} onClick={() => setRole(u, false)}>
                              Demote
                            </Button>
                          ) : (
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" disabled={busy === u.id} onClick={() => setRole(u, true)}>
                              Promote
                            </Button>
                          )}
                          <Button size="sm" variant="destructive" disabled={busy === u.id} onClick={() => deactivate(u)}>
                            <IcoTrash className="mr-1" /> Deactivate
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  function FoodHubsTab() {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Food Hubs</CardTitle>
          <CardDescription>Active hubs</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-gray-500">Loading…</div>
          ) : hubs.length === 0 ? (
            <Empty label="No hubs found" />
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-3">Name</th>
                    <th className="py-2 pr-3">Location</th>
                    <th className="py-2 pr-3">Verified</th>
                  </tr>
                </thead>
                <tbody>
                  {hubs.map((h) => (
                    <tr key={h.id} className="border-b">
                      <td className="py-2 pr-3">{h.name || "—"}</td>
                      <td className="py-2 pr-3">{[h.suburb, h.city].filter(Boolean).join(", ") || "—"}</td>
                      <td className="py-2 pr-3">
                        {h.verified ? (
                          <Pill className="bg-emerald-600 text-white">verified</Pill>
                        ) : (
                          <Pill className="bg-gray-200 text-gray-800">—</Pill>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
  
function TasksTab() {
  const { toast } = useToast();
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [taskType, setTaskType] = useState<"pickup"|"delivery"|"other">("pickup");
  const [city, setCity] = useState("");
  const [suburb, setSuburb] = useState("");
  const [address, setAddress] = useState("");
  const [due, setDue] = useState("");
  const [priority, setPriority] = useState<"low"|"medium"|"high"|"urgent">("medium");
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("volunteer_tasks")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setTasks(data || []);
    } catch (e: any) {
      toast({ title: "Load failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createTask = async () => {
    if (!title.trim()) {
      toast({ title: "Enter a title", variant: "destructive" });
      return;
    }
    if (!description.trim()) {
      toast({ title: "Enter a description", variant: "destructive" });
      return;
    }

    setCreating(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        task_type: taskType,
        status: "open",
        priority,
        city: city.trim() || null,
        suburb: suburb.trim() || null,
        address_line1: address.trim() || null,
        scheduled_date: due ? new Date(due).toISOString() : null,
      };

      const { data, error } = await supabase
        .from("volunteer_tasks")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
    try {
      const { data: volunteers } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "volunteer");

      if (volunteers && volunteers.length > 0) {
        for (const volunteer of volunteers) {
          await supabase.from("notifications").insert({
            user_id: volunteer.id,
            type: "volunteer_task_assigned",
            title: "New Task Available",
            message: `New ${taskType} task: ${title.trim()}`,
            payload: {
              task_id: data.id,
              role: taskType,
              when: due || "No deadline set",
              hub: city ? { name: "Task Location", city, suburb } : null
            }
          });
        }
      }
    } catch (notifError) {
      console.error("Failed to create notifications:", notifError);
      // Don't fail the task creation if notifications fail
    }
      // Clear form
      setTitle("");
      setDescription("");
      setCity("");
      setSuburb("");
      setAddress("");
      setDue("");
      setTaskType("pickup");
      setPriority("medium");

      toast({ title: "Task created successfully" });
      await load();
    } catch (e: any) {
      toast({ title: "Failed to create task", description: e.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const changeStatus = async (task: any, status: string) => {
    try {
      const { error } = await supabase
        .from("volunteer_tasks")
        .update({ status })
        .eq("id", task.id);
      
      if (error) throw error;
      
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status } : t));
      toast({ title: `Task marked as ${status}` });
    } catch (e: any) {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    }
  };

  const removeTask = async (task: any) => {
    if (!confirm("Delete this task?")) return;
    
    try {
      const { error } = await supabase.from("volunteer_tasks").delete().eq("id", task.id);
      if (error) throw error;
      
      setTasks(prev => prev.filter(t => t.id !== task.id));
      toast({ title: "Task deleted" });
    } catch (e: any) {
      toast({ title: "Delete failed", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Create Volunteer Task</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid md:grid-cols-2 gap-4">
              <input
                className="border rounded-md px-3 py-2"
                placeholder="Task title (required)"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
              <select
                className="border rounded-md px-3 py-2"
                value={taskType}
                onChange={e => setTaskType(e.target.value as any)}
              >
                <option value="pickup">Food Pickup</option>
                <option value="delivery">Food Delivery</option>
                <option value="other">Other Task</option>
              </select>
            </div>

            <textarea
              className="border rounded-md px-3 py-2 min-h-[100px]"
              placeholder="Task description - what needs to be done, requirements, etc. (required)"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />

            <div className="grid md:grid-cols-3 gap-4">
              <input
                className="border rounded-md px-3 py-2"
                placeholder="City"
                value={city}
                onChange={e => setCity(e.target.value)}
              />
              <input
                className="border rounded-md px-3 py-2"
                placeholder="Suburb"
                value={suburb}
                onChange={e => setSuburb(e.target.value)}
              />
              <input
                className="border rounded-md px-3 py-2"
                placeholder="Address"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <input
                type="date"
                className="border rounded-md px-3 py-2"
                value={due}
                onChange={e => setDue(e.target.value)}
              />
              <select
                className="border rounded-md px-3 py-2"
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
              <Button
                onClick={createTask}
                disabled={creating}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {creating ? "Creating…" : "Create Task"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Volunteer Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-gray-500">Loading…</div>
          ) : tasks.length === 0 ? (
            <div className="text-sm text-gray-500">No tasks yet</div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-3">Task</th>
                    <th className="py-2 pr-3">Type</th>
                    <th className="py-2 pr-3">Location</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Due</th>
                    <th className="py-2 pr-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((t: any) => (
                    <tr key={t.id} className="border-b">
                      <td className="py-2 pr-3">
                        <div className="font-medium">{t.title}</div>
                        <div className="text-xs text-gray-500">{t.description}</div>
                      </td>
                      <td className="py-2 pr-3">
                        <Pill className="bg-blue-100 text-blue-800 capitalize">{t.task_type}</Pill>
                      </td>
                      <td className="py-2 pr-3">
                        <div>{t.city || "—"}</div>
                        {t.suburb && <div className="text-xs text-gray-500">{t.suburb}</div>}
                      </td>
                      <td className="py-2 pr-3">{statusPill(t.status)}</td>
                      <td className="py-2 pr-3">{fmtDate(t.scheduled_date)}</td>
                      <td className="py-2 pr-3">
                        <div className="flex gap-2">
                          {t.status === 'open' && (
                            <Button size="sm" variant="outline" onClick={() => changeStatus(t, "assigned")}>
                              Assign
                            </Button>
                          )}
                          {(t.status === 'assigned' || t.status === 'in_progress') && (
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700"
                              onClick={() => changeStatus(t, "completed")}
                            >
                              Complete
                            </Button>
                          )}
                          <Button size="sm" variant="destructive" onClick={() => removeTask(t)}>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


function AnnouncementsTab() {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<"general"|"update"|"maintenance"|"urgent">("general");
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [editingId, setEditingId] = useState<string|null>(null);

  const load = async ()=>{
    setLoading(true);
    const { data, error } = await supabase.from("announcements").select("*").order("created_at",{ascending:false});
    setLoading(false);
    if (error) return toast({ title:"Load failed", description:error.message, variant:"destructive" });
    setItems((data||[]) as any);
  };
  useEffect(()=>{ void load(); },[]);

  const publish = async ()=>{
    if (!title.trim() || !content.trim())
      return toast({ title:"Title and content are required", variant:"destructive" });
    setPublishing(true);
    const { error } = await supabase.from("announcements")
      .insert({ title, content, type, target_audience:['all'], is_published:true });
    setPublishing(false);
    if (error) return toast({ title:"Failed to publish", description:error.message, variant:"destructive" });
    setTitle(""); setContent(""); setType("general");
    toast({ title:"Announcement published" });
    await load();
    // Notification fan-out handled by DB trigger
  };

  const saveEdit = async (id:string, next: Partial<Announcement>)=>{
    const payload:any = { ...next };
    if (payload.target_audience && !Array.isArray(payload.target_audience))
      payload.target_audience = [payload.target_audience];
    const { error } = await supabase.from("announcements").update(payload).eq("id", id);
    if (error) return toast({ title:"Update failed", description:error.message, variant:"destructive" });
    setEditingId(null);
    await load();
  };

  const remove = async (id:string)=>{
    if (!confirm("Delete this announcement?")) return;
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) return toast({ title:"Delete failed", description:error.message, variant:"destructive" });
    setItems(prev=>prev.filter(a=>a.id!==id));
    toast({ title:"Announcement deleted" });
  };

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader><CardTitle>Send Announcement</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <input className="border rounded-md px-3 py-2" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
            <textarea className="border rounded-md px-3 py-2 min-h-[120px]" placeholder="Content" value={content} onChange={e=>setContent(e.target.value)} />
            <div className="flex gap-2">
              <select className="border rounded-md px-3 py-2" value={type} onChange={e=>setType(e.target.value as any)}>
                <option value="general">General</option><option value="update">Update</option>
                <option value="maintenance">Maintenance</option><option value="urgent">Urgent</option>
              </select>
              <Button onClick={publish} disabled={publishing} className="bg-emerald-600 hover:bg-emerald-700">
                {publishing ? "Sending…" : "Send Announcement"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent Announcements</CardTitle></CardHeader>
        <CardContent>
          {loading ? <div className="text-sm text-gray-500">Loading…</div> :
           items.length===0 ? <div className="text-sm text-gray-500">No announcements yet</div> :
           <ul className="space-y-3">
             {items.map(a=>(
               <li key={a.id} className="border rounded-xl p-3">
                 {editingId===a.id ? (
                   <EditAnnouncement a={a} onSave={(next)=>saveEdit(a.id, next)} onCancel={()=>setEditingId(null)} />
                 ) : (
                   <ReadAnnouncement a={a} onEdit={()=>setEditingId(a.id)} onDelete={()=>remove(a.id)} />
                 )}
               </li>
             ))}
           </ul>}
        </CardContent>
      </Card>
    </div>
  );
}

/* helpers used in the list for edit/read rows */
function ReadAnnouncement({
  a,
  onEdit,
  onDelete,
}: {
  a: Announcement;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium">{a.title}</span>
          <Pill className="bg-gray-200 text-gray-800">{a.type || "general"}</Pill>
        </div>
        <div className="text-xs text-gray-500">{fmtDate(a.created_at)}</div>
      </div>
      <div className="text-sm text-gray-700 mt-1">{a.content}</div>
      <div className="text-xs text-gray-500 mt-1">
        Audience: {(a.target_audience && a.target_audience.join(", ")) || "all"}
      </div>
      <div className="mt-2 flex gap-2">
        <Button size="sm" variant="outline" onClick={onEdit}>Edit</Button>
        <Button size="sm" variant="destructive" onClick={onDelete}>
          <IcoTrash className="mr-1" /> Delete
        </Button>
      </div>
    </>
  );
}

function EditAnnouncement({
  a,
  onSave,
  onCancel,
}: {
  a: Announcement;
  onSave: (next: Partial<Announcement>) => void;
  onCancel: () => void;
}) {
  const [t, setT] = useState(a.title || "");
  const [c, setC] = useState(a.content || "");
  const [ty, setTy] = useState(a.type || "general");
  const [aud, setAud] = useState((a.target_audience && a.target_audience[0]) || "all");

  return (
    <div className="grid gap-2">
      <input className="border rounded-md px-3 py-2" value={t} onChange={(e) => setT(e.target.value)} />
      <textarea className="border rounded-md px-3 py-2 min-h-[100px]" value={c} onChange={(e) => setC(e.target.value)} />
      <div className="flex gap-2">
        <select className="border rounded-md px-3 py-2" value={ty} onChange={(e) => setTy(e.target.value)}>
          <option value="general">General</option>
          <option value="update">Update</option>
          <option value="maintenance">Maintenance</option>
          <option value="urgent">Urgent</option>
        </select>
        <select className="border rounded-md px-3 py-2" value={aud} onChange={(e) => setAud(e.target.value)}>
          <option value="all">All Users</option>
          <option value="donor">Donors</option>
          <option value="volunteer">Volunteers</option>
          <option value="recipient">Recipients</option>
        </select>
        <Button
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700"
          onClick={() => onSave({ title: t, content: c, type: ty, target_audience: [aud] })}
        >
          Save
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

/* ------------------------------ render ----------------------------------- */
return (
  <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
    <div>
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="text-sm text-gray-600">Manage the NourishSA platform</p>
    </div>

    <TabsHeader />

    {tab === "overview" && <Overview />}
    {tab === "donations" && <DonationsTab />}
    {tab === "claims" && <ClaimsTab />}
    {tab === "users" && <UsersTab />}
    {tab === "food_hubs" && <FoodHubsTab />}
    {tab === "volunteer_tasks" && <TasksTab />}
    {tab === "announcements" && <AnnouncementsTab />}
  </div>
);
}
