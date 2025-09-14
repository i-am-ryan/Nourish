import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/lib/api";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { HeartHandshake, Building2, Clock, ChevronLeft, ChevronRight, CheckCircle2, MapPin } from "lucide-react";

/* -------------------- Types -------------------- */
type Hub = {
  id: string;
  name: string;
  city: string;
  suburb: string | null;
  address: string | null;
  latitude?: number | null;
  longitude?: number | null;
  is_active: boolean;
};

type Religion = "" | "Christian" | "Other";

type Diet = {
  halal: boolean;
  kosher: boolean;
  vegetarian: boolean;
  vegan: boolean;
  allergies: string;
  notes: string;
  religion: Religion;
  religion_other: string; // used only when religion === "Other"
};

/* -------------------- UI State -------------------- */
const steps = [
  { key: "diet", label: "Diet & religion", icon: HeartHandshake },
  { key: "hub", label: "Choose hub", icon: MapPin },
  { key: "time", label: "Pickup window", icon: Clock },
  { key: "review", label: "Review & submit", icon: CheckCircle2 },
];

const stepAnim = {
  initial: { opacity: 0, y: 8, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.98 },
  transition: { duration: 0.22 },
};

const pickupWindows = [
  "Morning (8–11am)",
  "Midday (11am–2pm)",
  "Afternoon (2–5pm)",
  "Evening (5–7pm)",
];

const initialDiet: Diet = {
  halal: false,
  kosher: false,
  vegetarian: false,
  vegan: false,
  allergies: "",
  notes: "",
  religion: "",
  religion_other: "",
};

/* -------------------- Component -------------------- */
export default function ClaimSurplusForm() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [active, setActive] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [diet, setDiet] = useState<Diet>(initialDiet);

  // hubs
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [hubsLoading, setHubsLoading] = useState(true);
  const [hubId, setHubId] = useState<string | null>(null);
  const [cityFilter, setCityFilter] = useState<string>("");

  // pickup
  const [windowLabel, setWindowLabel] = useState<string>("");

  // confirmation modal
  const [openConfirm, setOpenConfirm] = useState(false);

  useEffect(() => {
    (async () => {
      setHubsLoading(true);
      const { data, error } = await apiService.getFoodHubs();
      if (error) {
        toast({
          title: "Couldn’t load hubs",
          description: error.message || "Please try again.",
          variant: "destructive",
        });
      } else {
        const list = (data || []) as Hub[];
        setHubs(list);

        // default city + hub to first active entries (helps avoid empty selects)
        const firstActiveCity = list.find((h) => h.is_active)?.city;
        if (firstActiveCity && !cityFilter) setCityFilter(firstActiveCity);
        const firstActiveHub =
          list.find((h) => h.is_active && h.city === firstActiveCity) ||
          list.find((h) => h.is_active) ||
          null;
        if (firstActiveHub && !hubId) setHubId(firstActiveHub.id);
      }
      setHubsLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hubsByCity = useMemo(() => {
    const m: Record<string, Hub[]> = {};
    hubs.forEach((h) => {
      const key = h.city || "Other";
      (m[key] ||= []).push(h);
    });
    return m;
  }, [hubs]);

  const currentHub = hubId ? hubs.find((h) => h.id === hubId) || null : null;

  const canNext = useMemo(() => {
    if (active === 0) {
      const picked =
        diet.halal ||
        diet.kosher ||
        diet.vegetarian ||
        diet.vegan ||
        !!diet.religion ||
        !!diet.allergies.trim() ||
        !!diet.notes.trim() ||
        (diet.religion === "Other" && !!diet.religion_other.trim());
      return !!picked;
    }
    if (active === 1) return !!hubId;
    if (active === 2) return !!windowLabel;
    return true;
  }, [active, diet, hubId, windowLabel]);

  const next = () => setActive((i) => Math.min(i + 1, steps.length - 1));
  const back = () => setActive((i) => Math.max(i - 1, 0));

  const submit = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to submit a request.",
        variant: "destructive",
      });
      return;
    }
    if (!hubId || !windowLabel) return;

    setSubmitting(true);
    try {
      const payload = {
        hub_id: hubId,
        food_category: "General",
        dietary: {
          halal: diet.halal,
          kosher: diet.kosher,
          vegetarian: diet.vegetarian,
          vegan: diet.vegan,
          allergies: diet.allergies
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          religion: diet.religion || null,
          religion_other: diet.religion === "Other" ? diet.religion_other || null : null,
        },
        notes: diet.notes || null,
        preferred_window: windowLabel,
      };

      const { error } = await apiService.createClaimRequest(payload as any);
      if (error) throw error;

      setOpenConfirm(true);
      toast({ title: "Request submitted", description: "We’ll notify you when it’s ready." });

      // reset
      setActive(0);
      setDiet(initialDiet);
      setWindowLabel("");
      // optional: keep city/hub as-is so user can submit again quickly
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Couldn’t submit request",
        description: e?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-600 text-white">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-white/15 flex items-center justify-center">
              <HeartHandshake className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl">Request Surplus Food</CardTitle>
              <p className="text-white/80 text-sm">We’ll guide you step by step and connect you to a nearby Food Hub.</p>
            </div>
          </div>

          {/* Stepper */}
          <div className="mt-4">
            <div className="flex items-center gap-3">
              {steps.map((s, i) => {
                const Icon = s.icon;
                const done = i < active;
                const isCurrent = i === active;
                return (
                  <div key={s.key} className="flex items-center gap-3">
                    <div
                      className={[
                        "h-9 px-3 rounded-full inline-flex items-center gap-2 text-sm transition",
                        done ? "bg-white text-emerald-700" : isCurrent ? "bg-white/25 text-white" : "bg-white/10 text-white/70",
                      ].join(" ")}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{s.label}</span>
                    </div>
                    {i < steps.length - 1 && <div className="h-0.5 w-6 sm:w-10 bg-white/30 rounded" />}
                  </div>
                );
              })}
            </div>
            <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white/90 transition-all" style={{ width: `${((active + 1) / steps.length) * 100}%` }} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {/* Step 1: Diet & religion */}
            {active === 0 && (
              <motion.div key="diet" {...stepAnim} className="space-y-6">
                <SectionTitle title="Diet & religion" />

                <div className="grid sm:grid-cols-2 gap-4">
                  <CheckRow label="Halal" checked={diet.halal} onChange={(v) => setDiet((d) => ({ ...d, halal: v }))} />
                  <CheckRow label="Kosher" checked={diet.kosher} onChange={(v) => setDiet((d) => ({ ...d, kosher: v }))} />
                  <CheckRow label="Vegetarian" checked={diet.vegetarian} onChange={(v) => setDiet((d) => ({ ...d, vegetarian: v }))} />
                  <CheckRow label="Vegan" checked={diet.vegan} onChange={(v) => setDiet((d) => ({ ...d, vegan: v }))} />
                    <CheckRow label="Other" checked={diet.vegan} onChange={(v) => setDiet((d) => ({ ...d, vegan: v }))} />
                      <CheckRow label="Prefer not to say" checked={diet.vegan} onChange={(v) => setDiet((d) => ({ ...d, vegan: v }))} />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Allergies (comma separated)">
                    <Input
                      placeholder="e.g., nuts, shellfish, gluten"
                      value={diet.allergies}
                      onChange={(e) => setDiet((d) => ({ ...d, allergies: e.target.value }))}
                    />
                  </Field>

                  <Field label="Notes (optional)">
                    <Input
                      placeholder="Any extra details"
                      value={diet.notes}
                      onChange={(e) => setDiet((d) => ({ ...d, notes: e.target.value }))}
                    />
                  </Field>
                </div>
{/* Religion (optional) */}
<div className="grid sm:grid-cols-2 gap-4">
  <Field label="Religion (optional)">
    <Select
      value={diet.religion || undefined}
      onValueChange={(v) => {
        const val = v === "none" ? "" : (v as Religion);
        setDiet((d) => ({
          ...d,
          religion: val,
          religion_other: val === "Other" ? d.religion_other : "",
        }));
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select religion (optional)" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Christian">Christian</SelectItem>
        <SelectItem value="Other">Other</SelectItem>
        <SelectItem value="none">Prefer not to say</SelectItem>
      </SelectContent>
    </Select>
  </Field>

  {diet.religion === "Other" && (
    <Field label="Please specify">
      <Input
        placeholder="e.g., Hindu, Muslim, Jewish, etc."
        value={diet.religion_other}
        onChange={(e) => setDiet((d) => ({ ...d, religion_other: e.target.value }))}
      />
    </Field>
  )}
</div>

              </motion.div>
            )}

            {/* Step 2: Hub */}
            {active === 1 && (
              <motion.div key="hub" {...stepAnim} className="space-y-6">
                <SectionTitle title="Choose a Food Hub" />
                <div className="rounded-xl border p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="h-4 w-4 text-emerald-600" />
                    <p className="text-sm text-muted-foreground">Pick the hub you’ll collect from.</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="City">
                      <Select
                        value={cityFilter || undefined}
                        onValueChange={(v) => {
                          setCityFilter(v);
                          const list = (hubsByCity[v] || []).filter((h) => h.is_active);
                          setHubId(list[0]?.id ?? null);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={hubsLoading ? "Loading cities..." : "Select city"} />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(hubsByCity)
                            .sort()
                            .map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field label="Food Hub">
                      <Select value={hubId || undefined} onValueChange={(v) => setHubId(v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose hub" />
                        </SelectTrigger>
                        <SelectContent>
                          {(cityFilter ? hubsByCity[cityFilter] || [] : hubs)
                            .filter((h) => h.is_active)
                            .map((h) => (
                              <SelectItem key={h.id} value={h.id}>
                                {h.name} {h.suburb ? `• ${h.suburb}` : ""} • {h.city}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>

                  {currentHub && (
                    <div className="mt-4 text-sm text-muted-foreground">
                      <div className="font-medium text-foreground">{currentHub.name}</div>
                      <div>
                        {currentHub.address || ""} {currentHub.suburb ? `• ${currentHub.suburb}` : ""} • {currentHub.city}
                      </div>
                      {currentHub.latitude && currentHub.longitude ? (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${currentHub.latitude},${currentHub.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-700 underline underline-offset-4"
                        >
                          Open in Google Maps
                        </a>
                      ) : null}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 3: Pickup window */}
            {active === 2 && (
              <motion.div key="time" {...stepAnim} className="space-y-6">
                <SectionTitle title="Pickup window" />
                <Field label="When can you collect?">
                  <Select value={windowLabel || undefined} onValueChange={setWindowLabel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a time window" />
                    </SelectTrigger>
                    <SelectContent>
                      {pickupWindows.map((w) => (
                        <SelectItem key={w} value={w}>
                          {w}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </motion.div>
            )}

            {/* Step 4: Review */}
            {active === 3 && (
              <motion.div key="review" {...stepAnim} className="space-y-6">
                <SectionTitle title="Review & submit" />
                <div className="rounded-xl border p-5 space-y-3 bg-gradient-to-br from-emerald-50 to-transparent">
                  <ReviewRow label="Diet" value={prettyDiet(diet)} />
                  <ReviewRow label="Hub" value={currentHub ? `${currentHub.name} • ${currentHub.city}` : "—"} />
                  <ReviewRow label="Pickup window" value={windowLabel || "—"} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Nav buttons */}
          <div className="mt-8 flex items-center justify-between">
            <Button variant="outline" onClick={back} disabled={active === 0} className="group">
              <ChevronLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-0.5" />
              Back
            </Button>

            {active < steps.length - 1 ? (
              <Button onClick={next} disabled={!canNext} className="group bg-emerald-600 hover:bg-emerald-700">
                Next
                <ChevronRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-0.5" />
              </Button>
            ) : (
              <Button onClick={submit} disabled={submitting} className="group bg-emerald-600 hover:bg-emerald-700">
                {submitting ? "Submitting…" : "Submit request"}
                <CheckCircle2 className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation modal */}
     {/* Confirmation modal */}
<Dialog open={openConfirm} onOpenChange={setOpenConfirm}>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">✔</span>
        Request received — thank you! 🎉
      </DialogTitle>
    </DialogHeader>

    <div className="space-y-4 text-sm">
      <p className="text-muted-foreground">
        We’re preparing a <strong>nutritious food bag</strong> tailored to your dietary and religious preferences.
        Please collect it during your selected time window.
      </p>

      <div className="rounded-lg border p-3 bg-gradient-to-br from-emerald-50/50 to-transparent">
        <div className="font-medium text-foreground">Pickup details</div>
        <div className="mt-1.5 grid gap-1.5">
          <div>
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Food Hub</span><br />
            {currentHub ? (
              <>
                <span className="font-medium">
                  {currentHub.name} {currentHub.suburb ? `• ${currentHub.suburb}` : ""} • {currentHub.city}
                </span>
                <div className="text-muted-foreground">
                  {currentHub.address || ""}
                </div>
                {currentHub.latitude && currentHub.longitude ? (
                  <a
                    className="text-emerald-700 underline underline-offset-4"
                    target="_blank"
                    rel="noreferrer"
                    href={`https://www.google.com/maps/search/?api=1&query=${currentHub.latitude},${currentHub.longitude}`}
                  >
                    Open in Google Maps
                  </a>
                ) : null}
              </>
            ) : "—"}
          </div>

          <div className="mt-2">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Pickup window</span><br />
            <span className="font-medium">{windowLabel}</span>
          </div>

          <div className="mt-2">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Diet & religion</span><br />
            <span className="font-medium">{prettyDiet(diet)}</span>
          </div>
        </div>
      </div>

      <div className="text-muted-foreground">
        When you arrive, ask for your <strong>prepared bag</strong>. It will contain items that match your
        preferences (e.g. <em>{prettyDiet(diet) || "your selections"}</em>). If you can’t make your time,
        please return to this page and submit a new request so we can re-schedule.
      </div>
    </div>

    <DialogFooter>
      <Button onClick={() => setOpenConfirm(false)} className="bg-emerald-600 hover:bg-emerald-700">
        Got it — I’ll collect then
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

    </>
  );
}

/* -------------------- Small bits -------------------- */
function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
        <HeartHandshake className="h-5 w-5" />
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
    </div>
  );
}

function CheckRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 rounded-lg border p-3 hover:bg-emerald-50 transition cursor-pointer">
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(Boolean(v))} />
      <span>{label}</span>
    </label>
  );
}

function ReviewRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-1.5">
      <span className="text-xs uppercase tracking-wide text-muted-foreground w-36 shrink-0">{label}</span>
      <div className="text-sm">{value || <span className="text-muted-foreground">—</span>}</div>
    </div>
  );
}

function prettyDiet(d: {
  halal: boolean;
  kosher: boolean;
  vegetarian: boolean;
  vegan: boolean;
  allergies: string;
  religion?: "" | "Christian" | "Other";
  religion_other?: string;
}) {
  const picks = [
    d.halal && "Halal",
    d.kosher && "Kosher",
    d.vegetarian && "Vegetarian",
    d.vegan && "Vegan",
  ].filter(Boolean) as string[];

  const allergy = d.allergies.trim() ? `Allergies: ${d.allergies.trim()}` : "";

  const rel =
    d.religion
      ? `Religion: ${d.religion === "Other" ? (d.religion_other?.trim() || "Other") : d.religion}`
      : "";

  return [picks.join(", ") || "—", rel, allergy].filter(Boolean).join(" • ");
}

