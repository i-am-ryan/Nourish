import React, { useEffect, useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Package, Truck, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import * as V from "@/lib/volunteer";
import type { VolunteerTask } from "@/lib/supabase";
console.log('Available V functions:', Object.keys(V));
console.log('acceptTask function:', V.acceptTask);


const FOOD_FALLBACKS: string[] = [
  "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1506806732259-39c2d0268443?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1466637574441-749b8f19452f?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1498575207490-8e0c4e270d3f?q=80&w=1600&auto=format&fit=crop",
];

async function loadLocalImageManifest(): Promise<string[]> {
  try {
    const res = await fetch("/lovable-uploads/manifest.json", { cache: "no-store" });
    if (!res.ok) return [];
    const files: string[] = await res.json();
    return files
      .filter(Boolean)
      .map((f) => (f.startsWith("/") ? f : `/lovable-uploads/${f}`));
  } catch {
    return [];
  }
}

function pickStable<T>(items: T[], key: string): T | undefined {
  if (!items.length) return undefined;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % items.length;
  return items[idx];
}

const SmartImage: React.FC<{
  candidates: string[];
  alt: string;
  className?: string;
}> = ({ candidates, alt, className }) => {
  const [srcIndex, setSrcIndex] = useState(0);
  const src = candidates[srcIndex];

  if (!src) {
    return (
      <div className={`bg-gray-100 ${className}`} aria-label={alt} />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => {
        setSrcIndex((i) => Math.min(i + 1, candidates.length));
      }}
    />
  );
};

interface UserStats {
  totalTasks: number;
  tasksThisWeek: number;
  totalHours: number;
  level: number;
  xp: number;
  streak: number;
  badges: string[];
  rank?: string;
  impactPoints: number;
}

interface TaskBoardProps {
  roleFilter?: "pickup" | "delivery" | null;
  userStats?: UserStats;
  setUserStats?: React.Dispatch<React.SetStateAction<UserStats>>;
}

export default function TaskBoard({ roleFilter, userStats, setUserStats }: TaskBoardProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [open, setOpen] = useState<VolunteerTask[]>([]);
  const [mine, setMine] = useState<VolunteerTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [localImages, setLocalImages] = useState<string[]>([]);

  useEffect(() => {
    loadLocalImageManifest().then(setLocalImages);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [openRes, mineRes] = await Promise.all([
        V.listOpenTasks(roleFilter ?? undefined),
        V.listMyTasks(),
      ]);

      setOpen(openRes.data ?? []);
      setMine(mineRes.data ?? []);
    } catch (error) {
      console.error("Failed to load tasks:", error);
      toast({
        title: "Failed to load tasks",
        description: "Please try again later",
        variant: "destructive",
      });
      setOpen([]);
      setMine([]);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const refreshServerStats = useCallback(async () => {
    try {
      if (setUserStats && userStats) {
        const currentUserId = (await (await V["getProfile"]()).data)?.id;
        if (currentUserId) {
          const { data } = await V.getUserStats(currentUserId);
          if (data) setUserStats(data);
        }
      }
    } catch {
      /* non-blocking */
    }
  }, [setUserStats, userStats]);

  const bumpStatsOptimistically = (kind: "accept" | "complete") => {
    if (!setUserStats || !userStats) return;
    setUserStats((prev) => {
      const upd: Partial<UserStats> = {};
      if (kind === "accept") {
        upd.xp = (prev.xp || 0) + 50;
      } else {
        upd.totalTasks = (prev.totalTasks || 0) + 1;
        upd.tasksThisWeek = (prev.tasksThisWeek || 0) + 1;
        upd.totalHours = (prev.totalHours || 0) + 2;
        upd.xp = (prev.xp || 0) + 100;
        upd.impactPoints = (prev.impactPoints || 0) + 75;
        const newLevel = Math.floor((upd.xp ?? prev.xp) / 1000) + 1;
        if (newLevel > prev.level) upd.level = newLevel;
      }
      return { ...prev, ...upd };
    });
  };

  const act = async (fn: () => Promise<any>, ok: string, kind?: "accept" | "complete") => {
    try {
      const res = await fn();
      if (res?.error) {
        toast({
          title: "Action failed",
          description: res.error.message ?? "Please try again",
          variant: "destructive",
        });
        return;
      }
      if (kind) bumpStatsOptimistically(kind);
      toast({ title: ok });
      await load();
      if (kind === "complete") {
        await refreshServerStats();
      }
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Action failed",
        description: e?.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const getTaskImageCandidates = (t: VolunteerTask): string[] => {
    const cands: string[] = [];
    // @ts-expect-error: allow optional column
    if (t.image_url) cands.push(String((t as any).image_url));

    const stableLocal = pickStable(localImages, t.id || t.title || "");
    if (stableLocal) cands.push(stableLocal);

    const pool =
      t.task_type === "pickup" ? FOOD_FALLBACKS.slice(0, 3) : FOOD_FALLBACKS.slice(3);
    const stableCdn = pickStable(pool, t.id || t.title || "");
    if (stableCdn) cands.push(stableCdn);

    if (!cands.length) cands.push(...FOOD_FALLBACKS);
    return cands;
  };

  const Card = ({ t, mineCard }: { t: VolunteerTask; mineCard?: boolean }) => {
    const candidates = useMemo(() => getTaskImageCandidates(t), [t]);

    return (
      <motion.div
        whileHover={{ y: -4 }}
        className="group relative overflow-hidden rounded-2xl border bg-white shadow-sm"
      >
        <div className="absolute inset-x-0 top-0 h-28">
          <SmartImage
            candidates={candidates}
            alt={`${t.task_type} task`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
        </div>

        <div className="relative p-4 pt-32">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">{t.title}</h3>
            <Badge>{t.task_type}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {t.city}{t.suburb ? ` • ${t.suburb}` : ""}
          </p>
          {t.description && <p className="mt-3 text-sm">{t.description}</p>}

          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            {t.task_type === "pickup" ? <Package className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
            <span className="uppercase tracking-wide">{t.priority}</span>
            {t.scheduled_date && (
              <span>• {new Date(t.scheduled_date).toLocaleString()}</span>
            )}
            {t.status && <span>• {t.status}</span>}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
{!mineCard && t.status === "open" && (
  <Button
    onClick={() => {
      const taskId = t.id;
      act(() => V.acceptTask(taskId), "Task accepted", "accept");
    }}
    size="sm"
  >
    Accept
    <ChevronRight className="w-4 h-4 ml-1" />
  </Button>
)}

{mineCard && (t.status === "assigned" || t.status === "open") && (
  <Button
    variant="secondary"
    onClick={() => {
      const taskId = t.id;
      act(() => V.startTask(taskId), "Task started");
    }}
    size="sm"
  >
    Start
  </Button>
)}

{mineCard && t.status !== "completed" && (
  <Button
    variant="outline"
    onClick={() => {
      const taskId = t.id;
      act(() => V.completeTask(taskId), "Task completed", "complete");
    }}
    size="sm"
  >
    Complete
  </Button>
)}
          </div>
        </div>

        <div className="absolute inset-0 pointer-events-none rounded-2xl ring-1 ring-black/5 group-hover:ring-black/10" />
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-sm text-muted-foreground px-1">Loading tasks...</div>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border bg-white shadow-sm animate-pulse">
              <div className="h-28 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="flex gap-2">
                  <div className="h-8 bg-gray-200 rounded w-20" />
                  <div className="h-8 bg-gray-200 rounded w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-semibold mb-3">
          Available Tasks{roleFilter ? ` • ${roleFilter}` : ""}
        </h2>
        {open.length ? (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {open.map((t) => (
              <Card key={t.id} t={t} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm text-muted-foreground">No open tasks right now.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Check back later for new opportunities to help!
            </p>
          </div>
        )}
      </section>

      <section>
        <h2 className="font-semibold mb-3">My Tasks</h2>
        {mine.length ? (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {mine.map((t) => (
              <Card key={t.id} t={t} mineCard />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-200 flex items-center justify-center">
              <Truck className="w-8 h-8 text-emerald-600" />
            </div>
            <p className="text-sm text-muted-foreground">You have no assigned tasks yet.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Accept tasks from the available list above to get started!
            </p>
          </div>
        )}
      </section>
    </div>
  );
}