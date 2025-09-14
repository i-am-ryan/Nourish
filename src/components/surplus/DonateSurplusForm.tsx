import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import DonorThanksModal from "@/components/DonorThanksModal"; // kept, but we won't open it
import { pickRecipients, type Recipient } from "@/data/credibleRecipients";

import {
  Gift,
  ClipboardList,
  CalendarDays,
  MapPin,
  Building2,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  HeartHandshake,
  Camera,
  Upload,
  X,
  ExternalLink,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */
type Hub = {
  id: string;
  name: string;
  city: string;
  suburb: string | null;
  address: string;
  address_line1?: string | null; // Make this optional with ?
  is_active: boolean;
};

type FormData = {
  title: string;
  description: string;
  food_type: string;
  quantity: string;
  expiry_date: string;   // yyyy-mm-dd
  hub_id: string | null; // required
  dropoff_time: string;  // HH:mm
};

type LocalImage = {
  id: string;
  file: File;
  previewUrl: string;
};

/* ------------------------------------------------------------------ */
/* UI Constants                                                       */
/* ------------------------------------------------------------------ */
const foodTypes = [
  "Fresh Produce",
  "Bakery Items",
  "Dairy Products",
  "Meat & Poultry",
  "Packaged Foods",
  "Prepared Meals",
  "Other",
];

const steps = [
  { key: "details", label: "Food details", icon: Gift },
  { key: "meta", label: "Type & timing", icon: ClipboardList },
  { key: "hub", label: "Pickup hub", icon: MapPin },
  { key: "review", label: "Review & submit", icon: CheckCircle2 },
];

const stepVariants = {
  initial: { opacity: 0, y: 10, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.98 },
  transition: { duration: 0.25 },
};

/* 30-minute slots from 08:00 to 17:30 */
const DROPOFF_SLOTS = [
  "08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30",
  "12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30",
  "16:00","16:30","17:00","17:30",
];

/* ------------------------------------------------------------------ */

export default function DonateSurplusForm() {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Hubs
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [hubsLoading, setHubsLoading] = useState(true);
  const [loadErr, setLoadErr] = useState<string | null>(null);

  // Images
  const [images, setImages] = useState<LocalImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Success banner (our new receipt)
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptHub, setReceiptHub] = useState<Hub | null>(null);
  const [receiptTime, setReceiptTime] = useState<string>("");
  const [recipients, setRecipients] = useState<Recipient[]>([]); // NEW: credible orgs to show

  const [form, setForm] = useState<FormData>({
    title: "",
    description: "",
    food_type: "",
    quantity: "",
    expiry_date: "",
    hub_id: null,
    dropoff_time: "",
  });

  // Load hubs once
useEffect(() => {
  let cancelled = false;
  const load = async () => {
    setHubsLoading(true);
    setLoadErr(null);
    try {
      const { data, error } = await apiService.getFoodHubs({ is_active: true });
      if (error) throw error;
      if (!cancelled) {
        const list = (data || []) as Hub[];
        setHubs(list);
        // Only set default hub_id if form.hub_id is null
        if (!form.hub_id && list[0]) {
          setForm((f) => ({ ...f, hub_id: list[0].id }));
        }
      }
    } catch (err: any) {
      console.error("getFoodHubs failed", err);
      if (!cancelled) {
        setLoadErr(err?.message || "Failed to load food hubs");
        // Don't call toast here - it causes re-renders
        console.error("Failed to load hubs:", err?.message);
      }
    } finally {
      if (!cancelled) setHubsLoading(false);
    }
  };
  load();
  return () => {
    cancelled = true;
  };
}, []); // empty deps - run once

  const cities = useMemo(
    () => Array.from(new Set(hubs.map((h) => h.city))).sort(),
    [hubs]
  );

  const canNext = useMemo(() => {
    if (activeStep === 0) {
      return form.title.trim().length > 2 && form.description.trim().length > 5;
    }
    if (activeStep === 1) {
      return !!form.food_type && !!form.quantity && !!form.expiry_date && !!form.dropoff_time;
    }
    if (activeStep === 2) {
      return !!form.hub_id;
    }
    return true;
  }, [activeStep, form]);

  const next = () => setActiveStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setActiveStep((s) => Math.max(s - 1, 0));
  const update = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  /* ---------------- Images: handlers ---------------- */

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const newItems: LocalImage[] = [];
    Array.from(fileList).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      newItems.push({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
      });
    });
    setImages((prev) => [...prev, ...newItems].slice(0, 6)); // cap at 6 images
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      prev.filter((i) => i.id === id).forEach((i) => URL.revokeObjectURL(i.previewUrl));
      return prev.filter((i) => i.id !== id);
    });
  };

  const clearImages = () => {
    images.forEach((i) => URL.revokeObjectURL(i.previewUrl));
    setImages([]);
  };

  async function uploadImagesAndGetUrls(donationId: string) {
    if (images.length === 0) return [];
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const img of images) {
        const ext = img.file.name.split(".").pop() || "jpg";
        const path = `${user?.id}/${donationId}/${img.id}.${ext}`;
        const { error: upErr } = await supabase
          .storage
          .from("donation-images")
          .upload(path, img.file, { upsert: true, cacheControl: "3600" });
        if (upErr) throw upErr;

        const { data: pub } = supabase.storage.from("donation-images").getPublicUrl(path);
        if (pub?.publicUrl) urls.push(pub.publicUrl);
      }
      return urls;
    } finally {
      setUploading(false);
    }
  }

  /* ---------------- Helpers ---------------- */

  const selectedHub = useMemo(
    () => (form.hub_id ? hubs.find((h) => h.id === form.hub_id) || null : null),
    [form.hub_id, hubs]
  );

  const mapsUrl = (hub: Hub | null) => {
    if (!hub) return "#";
    const q = encodeURIComponent([hub.address, hub.suburb ?? "", hub.city].filter(Boolean).join(", "));
    return `https://www.google.com/maps/search/?api=1&query=${q}`;
  };

  /* ---------------- Submit ---------------- */

  const submit = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to create a donation.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      // 1) Create a placeholder donation to get the id (so we can store at /{user}/{donationId}/file)
if (!form.hub_id) {
  toast({
    title: "Hub required",
    description: "Please select a food hub for pickup.",
    variant: "destructive",
  });
  setSubmitting(false); // ADD THIS LINE
  return;
}

// Get the selected hub for proper city/suburb values
const selectedHubData = hubs.find(h => h.id === form.hub_id);

// 1) Create the donation record with proper structure
const donationData = {
  title: form.title.trim(),
  description: form.description.trim(),
  food_type: form.food_type,
  quantity: form.quantity.trim(),
  expiry_date: form.expiry_date,
  dropoff_time: form.dropoff_time,
  pickup_location: selectedHubData?.address_line1 || selectedHubData?.address || `${selectedHubData?.name} Hub`,
  city: selectedHubData?.city || "",
  suburb: selectedHubData?.suburb || null,
  contact_email: user.email,
  contact_phone: profile?.phone || null,
  images: [] as string[],
  status: "available" as const,
  is_urgent: false,
  hub_id: form.hub_id, // Include this directly since the column exists
};

      const { data: created, error: createErr } = await apiService.createDonation(donationData);
      if (createErr || !created) {
  console.error("Create donation error:", createErr);
  throw createErr || new Error("Unable to create donation");
}

console.log("Donation created successfully:", created);
      // 2) Upload images using donation id
      const urls = await uploadImagesAndGetUrls(created.id);

      // 3) If any URLs, update the donation record with images
      if (urls.length) {
        await apiService.updateDonation(created.id, { images: urls } as any);
      }

      // Success UI details
      const hub = selectedHub;
      setReceiptHub(hub);
      setReceiptTime(form.dropoff_time);

      // Choose credible recipients (2) based on city
      const chosen = pickRecipients(hub?.city === "Pretoria" ? "Pretoria" : "Johannesburg", 2);
      setRecipients(chosen);

      // Push a notification for the signed-in user
    // Push a notification for the signed-in user
try {
  await supabase.rpc("push_notification", {
    p_user_id: user.id,
    p_type: "donation_created",
    p_title: "Donation scheduled",
    p_message: `Drop-off at ${hub?.name ?? "your selected hub"} at ${form.dropoff_time}.`,
p_payload: {
  title: form.title,
  dropoff_time: form.dropoff_time,
  hub: hub
    ? { 
        name: hub.name, 
        city: hub.city, 
        suburb: hub.suburb, 
        address: hub.address || hub.address_line1 || `${hub.city} Hub`,
        full_location: `${hub.name}, ${hub.city}${hub.suburb ? ` • ${hub.suburb}` : ''}`
      }
    : null,
  maps_url: hub ? mapsUrl(hub) : null,
  recipients: chosen,
},
  });
} catch {
  // non-fatal
}

      setReceiptOpen(true);

      // Reset form + images (banner stays open)
      setActiveStep(0);
      setForm({
        title: "",
        description: "",
        food_type: "",
        quantity: "",
        expiry_date: "",
        hub_id: null,
        dropoff_time: "",
      });
      clearImages();

      toast({
        title: "Donation created 🎉",
        description: "We’ll route this via your selected Food Hub to a vetted recipient.",
      });
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Couldn’t create donation",
        description: e?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <>
      <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-600 text-white">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-white/15 flex items-center justify-center">
              <Gift className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl">Donate Surplus Food</CardTitle>
              <p className="text-white/80 text-sm">
                Share your food via a nearby Food Hub. We’ll match a recipient in Gauteng.
              </p>
            </div>
          </div>

          {/* stepper */}
          <div className="mt-4">
            <div className="flex items-center gap-3">
              {steps.map((s, i) => {
                const Icon = s.icon as any;
                const done = i < activeStep;
                const active = i === activeStep;
                return (
                  <div key={s.key} className="flex items-center gap-3">
                    <div
                      className={[
                        "h-9 px-3 rounded-full inline-flex items-center gap-2 text-sm transition",
                        done
                          ? "bg-white text-emerald-700"
                          : active
                          ? "bg-white/25 text-white"
                          : "bg-white/10 text-white/70",
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
              <div
                className="h-full bg-white/90 transition-all"
                style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {/* Step 1: details */}
            {activeStep === 0 && (
              <motion.div {...stepVariants} key="s0" className="space-y-6">
                <SectionTitle title="What are you donating?" />
                <div className="grid gap-4">
                  <Field label="Food title *" description="e.g., Fresh vegetables, Bread">
                    <Input
                      value={form.title}
                      onChange={(e) => update("title", e.target.value)}
                      placeholder="e.g., White bread, apples"
                      className="group hover:shadow-sm transition-shadow"
                    />
                  </Field>

                  <Field label="Description *" description="Add helpful details (condition, packaging, etc.)">
                    <Textarea
                      value={form.description}
                      onChange={(e) => update("description", e.target.value)}
                      rows={4}
                      placeholder="Freshly baked today…"
                      className="group hover:shadow-sm transition-shadow"
                    />
                  </Field>

                  {/* Images */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Photos (optional)</Label>
                    <p className="text-xs text-muted-foreground">
                      Add up to 6 photos. You can take a photo or upload from your device.
                    </p>

                    <div className="flex flex-wrap gap-3">
                      <Button
                        type="button"
                        variant="secondary"
                        className="inline-flex items-center gap-2"
                        onClick={() => cameraInputRef.current?.click()}
                      >
                        <Camera className="h-4 w-4" />
                        Take photo
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="inline-flex items-center gap-2"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4" />
                        Upload
                      </Button>

                      <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        multiple
                        className="hidden"
                        onChange={(e) => addFiles(e.target.files)}
                      />
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => addFiles(e.target.files)}
                      />
                    </div>

                    {images.length > 0 && (
                      <div className="mt-3 grid grid-cols-3 sm:grid-cols-6 gap-3">
                        {images.map((img) => (
                          <div key={img.id} className="relative group rounded-lg overflow-hidden border">
                            <img
                              src={img.previewUrl}
                              className="h-24 w-full object-cover group-hover:scale-[1.02] transition"
                              alt="preview"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(img.id)}
                              className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black/70"
                              aria-label="Remove"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: meta (WITH drop-off time as dropdown) */}
            {activeStep === 1 && (
              <motion.div {...stepVariants} key="s1" className="space-y-6">
                <SectionTitle title="Type & timing" />
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Food type *">
                    <Select value={form.food_type} onValueChange={(v) => update("food_type", v)}>
                      <SelectTrigger className="hover:shadow-sm transition">
                        <SelectValue placeholder="Select food type" />
                      </SelectTrigger>
                      <SelectContent>
                        {foodTypes.map((t) => (
                          <SelectItem value={t} key={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field label="Quantity / Serving size *" description="e.g., 5kg, 20 portions">
                    <Input
                      value={form.quantity}
                      onChange={(e) => update("quantity", e.target.value)}
                      placeholder="e.g., 5kg, 20 portions"
                      className="hover:shadow-sm transition"
                    />
                  </Field>

                  <Field label="Best before / expiry date *" icon={<CalendarDays className="h-4 w-4" />}>
                    <Input
                      type="date"
                      value={form.expiry_date}
                      onChange={(e) => update("expiry_date", e.target.value)}
                      className="hover:shadow-sm transition"
                    />
                  </Field>

                  {/* NEW: Drop-off time dropdown */}
                  <Field label="Drop-off time *" description="Choose when you’ll drop off at the hub">
                    <Select value={form.dropoff_time} onValueChange={(v) => update("dropoff_time", v)}>
                      <SelectTrigger className="hover:shadow-sm transition">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {DROPOFF_SLOTS.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </motion.div>
            )}

            {/* Step 3: hub */}
            {activeStep === 2 && (
              <motion.div {...stepVariants} key="s2" className="space-y-6">
                <SectionTitle title="Choose a Food Hub (Drop-off point)" />
                <div className="rounded-xl border p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="h-4 w-4 text-emerald-600" />
                    <p className="text-sm text-muted-foreground">
                      Select a hub closest to you. Volunteers/recipients will collect from there.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    <Field label="City">
                      <Select
                        value={
                          form.hub_id ? (hubs.find((h) => h.id === form.hub_id)?.city || "") : undefined
                        }
                        onValueChange={(city) => {
                          update("hub_id", null);
                          const list = hubs.filter((h) => h.city === city);
                          if (list[0]) update("hub_id", list[0].id);
                        }}
                      >
                        <SelectTrigger className="hover:shadow-sm" disabled={hubsLoading}>
                          <SelectValue
                            placeholder={
                              hubsLoading ? "Loading cities..." : cities.length ? "Select city" : "No hubs found"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {cities.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field label="Food Hub *">
                      <Select
                        value={form.hub_id || undefined}
                        onValueChange={(v) => update("hub_id", v)}
                      >
                        <SelectTrigger className="hover:shadow-sm" disabled={hubsLoading || hubs.length === 0}>
                          <SelectValue
                            placeholder={hubsLoading ? "Loading hubs..." : hubs.length ? "Choose hub" : "No hubs available"}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {hubs
                            .filter((h) =>
                              form.hub_id
                                ? h.city === (hubs.find((x) => x.id === form.hub_id)?.city || h.city)
                                : true
                            )
                            .map((h) => (
                              <SelectItem key={h.id} value={h.id}>
                                {h.name} {h.suburb ? `• ${h.suburb}` : ""}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>

                  {!hubsLoading && hubs.length === 0 && (
                    <p className="text-xs text-red-600 mt-3">
                      No Food Hubs found. Ask an admin to add hubs in Supabase › <code>food_hubs</code>.
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 4: review */}
            {activeStep === 3 && (
              <motion.div {...stepVariants} key="s3" className="space-y-6">
                <SectionTitle title="Review & submit" />
                <div className="rounded-xl border p-5 space-y-4 bg-gradient-to-br from-emerald-50 to-transparent">
                  <ReviewRow label="Title" value={form.title} />
                  <ReviewRow label="Description" value={form.description} />
                  <ReviewRow label="Food type" value={form.food_type} />
                  <ReviewRow label="Quantity" value={form.quantity} />
                  <ReviewRow label="Best before" value={form.expiry_date} />
                  <ReviewRow label="Drop-off time" value={form.dropoff_time} />
                  <ReviewRow
                    label="Pickup hub"
                    value={
                      form.hub_id
                        ? hubs.find((h) => h.id === form.hub_id)?.name || form.hub_id
                        : "—"
                    }
                  />
                  {images.length > 0 && (
                    <div className="pt-2">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground">Photos</span>
                      <div className="mt-2 grid grid-cols-3 sm:grid-cols-6 gap-3">
                        {images.map((img) => (
                          <img key={img.id} src={img.previewUrl} alt="preview" className="h-20 w-full object-cover rounded-md border" />
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Submitted by: <strong>{profile?.full_name || user?.email}</strong>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* nav buttons */}
          <div className="mt-8 flex items-center justify-between">
            <Button variant="outline" onClick={back} disabled={activeStep === 0} className="group">
              <ChevronLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-0.5" />
              Back
            </Button>

            {activeStep < steps.length - 1 ? (
              <Button
                onClick={next}
                disabled={!canNext}
                className="group bg-emerald-600 hover:bg-emerald-700"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-0.5" />
              </Button>
            ) : (
              <Button
                onClick={submit}
                disabled={submitting || uploading}
                className="group bg-emerald-600 hover:bg-emerald-700"
              >
                {submitting || uploading ? "Submitting…" : "Create Donation"}
                <Gift className="h-4 w-4 ml-2 transition-transform group-hover:scale-110" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Success banner */}
      <AnimatePresence>
        {receiptOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.98, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.98, y: 10, opacity: 0 }}
              className="w-full max-w-xl"
            >
              <Card className="shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <div className="font-semibold">Thank you for your donation!</div>
                  </div>
                  <p className="text-white/90 text-sm mt-1">
                    We’ll route it via your selected Food Hub to a vetted organisation.
                  </p>
                </div>
                <CardContent className="p-5 space-y-4">
                  {receiptHub && (
                    <div className="rounded-xl border p-4 bg-emerald-50/50">
                      <div className="text-sm font-medium text-emerald-900 mb-2">Your Selected Food Hub</div>
                      <div className="flex flex-col gap-1 text-sm text-gray-700">
                        <div className="font-semibold">{receiptHub.name}</div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          {receiptHub.city}
                          {receiptHub.suburb ? ` • ${receiptHub.suburb}` : ""}
                        </div>
                        {receiptHub.address && <div className="text-gray-600">{receiptHub.address}</div>}
                      </div>

                      {receiptTime && (
                        <div className="mt-3">
                          <span className="inline-flex text-xs px-2 py-1 rounded-md bg-emerald-600 text-white">
                            Drop-off time: {receiptTime}
                          </span>
                        </div>
                      )}

                      <div className="mt-3">
                        <Button asChild className="rounded-xl">
                          <a href={mapsUrl(receiptHub)} target="_blank" rel="noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open in Maps
                          </a>
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* NEW: credible recipients list */}
                  {recipients.length > 0 && (
                    <div className="mt-2">
                      <div className="text-sm font-medium text-emerald-900 mb-1">
                        Some of your donation will help {recipients.length} partner organisation{recipients.length > 1 ? "s" : ""}:
                      </div>
                      <ul className="space-y-2 text-sm">
                        {recipients.map((r) => (
                          <li key={r.name} className="flex items-start gap-2">
                            <span className="inline-block h-2 w-2 mt-1.5 rounded-full bg-emerald-600" />
                            <div>
                              <div className="font-medium">
                                {r.name} <span className="text-xs text-gray-500">({r.category})</span>
                              </div>
                              <div className="text-gray-600">{r.location}</div>
                              <a
                                className="text-emerald-700 hover:underline text-xs"
                                href={r.website}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {r.website.replace(/^https?:\/\//, "")}
                              </a>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <p className="text-sm text-gray-600">
                    Check your <strong>Notifications</strong> panel to see your donation confirmation.
                  </p>

                  <div className="flex justify-end">
                    <Button onClick={() => setReceiptOpen(false)} className="rounded-xl">
                      Close
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kept for compatibility; we no longer open it */}
      <DonorThanksModal open={false} onClose={() => {}} org={null} hub={undefined} />
    </>
  );
}

/* ---------- helpers ---------- */

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

function Field({
  label,
  description,
  icon,
  children,
}: {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium flex items-center gap-2">
        {icon && <span className="h-6 w-6 rounded-md bg-muted flex items-center justify-center">{icon}</span>}
        {label}
      </Label>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      {children}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <span className="text-xs uppercase tracking-wide text-muted-foreground w-32 shrink-0">
        {label}
      </span>
      <div className="text-sm">{value || <span className="text-muted-foreground">—</span>}</div>
    </div>
  );
}
