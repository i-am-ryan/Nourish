// /components/admin/AdminVolunteerTasks.tsx
import React, { useEffect, useMemo, useState } from "react";
import * as V from "@/lib/volunteer";
import type { VolunteerTask } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

type NewTask = Partial<VolunteerTask>;

const PRIORITIES = ["urgent", "high", "medium", "low"] as const;
const TYPES = ["pickup", "delivery", "other"] as const;
const STATUSES = ["open", "assigned", "in_progress", "completed", "cancelled"] as const;

export default function AdminVolunteerTasks() {
  const { toast } = useToast();

  // data
  const [tasks, setTasks] = useState<VolunteerTask[]>([]);
  const [loading, setLoading] = useState(true);

  // search / ui
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);

  // create form
  const [form, setForm] = useState<NewTask>({
    title: "",
    description: "",
    city: "",
    suburb: "",
    task_type: "delivery",
    priority: "medium",
    scheduled_date: null,
  });

  const [assignEmail, setAssignEmail] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    if (!query.trim()) return tasks;
    const q = query.toLowerCase();
    return tasks.filter(
      (t) =>
        t.title?.toLowerCase().includes(q) ||
        t.city?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.task_type?.toLowerCase().includes(q)
    );
  }, [tasks, query]);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await V.adminListTasks();
      if (error) throw error;
      setTasks((data as any) || []);
    } catch (e: any) {
      toast({
        title: "Failed to load tasks",
        description: e?.message ?? "Please try again.",
        variant: "destructive",
      });
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ---------------- actions ----------------
  const createTask = async () => {
    if (!form.title?.trim() || !form.task_type || !form.priority) {
      toast({
        title: "Missing fields",
        description: "Title, type and priority are required.",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await V.adminCreateTask({
        ...form,
        status: "open",
      });
      if (error) throw error;
      toast({ title: "Task created" });
      setForm({
        title: "",
        description: "",
        city: "",
        suburb: "",
        task_type: "delivery",
        priority: "medium",
        scheduled_date: null,
      });
      setTasks((prev) => [data as VolunteerTask, ...prev]);
    } catch (e: any) {
      toast({
        title: "Create failed",
        description: e?.message ?? "Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const updateStatus = async (id: string, status: (typeof STATUSES)[number]) => {
    // optimistic
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));

    try {
      const { error } = await V.adminUpdateTask(id, { status });
      if (error) throw error;
      toast({ title: "Status updated" });
    } catch (e: any) {
      toast({
        title: "Update failed",
        description: e?.message ?? "Please try again.",
        variant: "destructive",
      });
      // reload to restore
      load();
    }
  };

  const assignTo = async (id: string) => {
    const email = (assignEmail[id] || "").trim();
    if (!email) {
      toast({ title: "Enter an email to assign", variant: "destructive" });
      return;
    }

    try {
      const { error } = await V.adminAssignToUserEmail(id, email);
      if (error) throw error;
      toast({ title: "Task assigned" });
      setAssignEmail((m) => ({ ...m, [id]: "" }));
      load();
    } catch (e: any) {
      toast({
        title: "Assign failed",
        description: e?.message ?? "Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    const name = task?.title || "this task";
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;

    // optimistic remove
    const snapshot = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== id));

    try {
      const { error } = await V.adminDeleteTask(id);
      if (error) throw error;
      toast({ title: "Task deleted" });
    } catch (e: any) {
      // rollback
      setTasks(snapshot);
      toast({
        title: "Delete failed",
        description: e?.message ?? "Please try again.",
        variant: "destructive",
      });
    }
  };

  // ---------------- UI helpers ----------------
  const priorityBadgeClass = (p?: string) =>
    ({
      urgent: "bg-red-100 text-red-700",
      high: "bg-orange-100 text-orange-700",
      medium: "bg-emerald-100 text-emerald-700",
      low: "bg-blue-100 text-blue-700",
    }[p as any] || "bg-gray-100 text-gray-700");

  return (
    <div className="space-y-6">
      {/* Create */}
      <div className="rounded-xl border bg-white p-4 md:p-6 shadow-sm">
        <h3 className="font-semibold mb-4">Create Task</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <input
            className="border rounded-md px-3 py-2"
            placeholder="Title"
            value={form.title ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <select
            className="border rounded-md px-3 py-2"
            value={form.task_type ?? "delivery"}
            onChange={(e) =>
              setForm((f) => ({ ...f, task_type: e.target.value as any }))
            }
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <textarea
            className="border rounded-md px-3 py-2 md:col-span-2"
            placeholder="Description (optional)"
            value={form.description ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
          />

          <input
            className="border rounded-md px-3 py-2"
            placeholder="City"
            value={form.city ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
          />
          <select
            className="border rounded-md px-3 py-2"
            value={form.priority ?? "medium"}
            onChange={(e) =>
              setForm((f) => ({ ...f, priority: e.target.value as any }))
            }
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <input
            type="datetime-local"
            className="border rounded-md px-3 py-2 md:col-span-2"
            value={
              form.scheduled_date
                ? new Date(form.scheduled_date).toISOString().slice(0, 16)
                : ""
            }
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                scheduled_date: e.target.value
                  ? new Date(e.target.value).toISOString()
                  : null,
              }))
            }
          />
        </div>

        <div className="mt-4">
          <Button onClick={createTask} disabled={creating}>
            {creating ? "Creating..." : "Create Task"}
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <input
          className="border rounded-md px-3 py-2 w-full md:w-80"
          placeholder="Search title/city/type…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button variant="secondary" onClick={load}>
          Reload
        </Button>
      </div>

      {/* List */}
      <div className="rounded-xl border bg-white p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-muted-foreground">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">
            No tasks found.
          </div>
        ) : (
          <ul className="divide-y">
            {filtered.map((t) => (
              <li key={t.id} className="p-4 md:p-5">
                <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold">{t.title}</div>
                      <Badge className={priorityBadgeClass(t.priority)}>
                        {t.priority}
                      </Badge>
                      <Badge variant="secondary">{t.task_type}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t.city}
                      {t.suburb ? ` • ${t.suburb}` : ""}
                      {t.scheduled_date
                        ? ` • ${new Date(t.scheduled_date).toLocaleString()}`
                        : ""}
                    </div>
                    {t.description && (
                      <div className="text-sm mt-1">{t.description}</div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2">
                    <select
                      className="border rounded-md px-2 py-1 text-sm"
                      value={t.status}
                      onChange={(e) =>
                        updateStatus(t.id, e.target.value as any)
                      }
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>

                    {/* Assign */}
                    <input
                      className="border rounded-md px-2 py-1 text-sm w-52"
                      placeholder="assign@email.com"
                      value={assignEmail[t.id] ?? ""}
                      onChange={(e) =>
                        setAssignEmail((m) => ({ ...m, [t.id]: e.target.value }))
                      }
                    />
                    <Button size="sm" onClick={() => assignTo(t.id)}>
                      Assign
                    </Button>

                    {/* Delete */}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteTask(t.id)}
                      className="ml-1"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
