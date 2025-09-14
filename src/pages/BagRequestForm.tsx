import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { MapPin, CheckCircle2 } from "lucide-react";
import type { User } from "@supabase/supabase-js";

type HubLite = {
  id: string;
  name: string;
  city: string;
  suburb: string | null;
  address_line1: string | null;
  latitude: number | null;
  longitude: number | null;
  photo_url: string | null;
};

const DIET_OPTIONS = ["Halal", "Kosher", "Vegetarian", "Vegan", "No pork", "Other"] as const;

const PICKUP_WINDOWS = [
  "08:00 - 09:30", "09:30 - 11:00", "11:00 - 12:30", 
  "12:30 - 14:00", "14:00 - 15:30", "15:30 - 17:00"
];

export default function BagRequestForm() {
  const [params] = useSearchParams();
  const hubId = params.get("hubId") || "";
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [hub, setHub] = useState<HubLite | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [ok, setOk] = useState(false);

  // Updated form state - single diet selection
  const [diet, setDiet] = useState<string>("");
  const [otherDiet, setOtherDiet] = useState("");
  const [allergies, setAllergies] = useState("");
  const [notes, setNotes] = useState("");
  const [pickupWindow, setPickupWindow] = useState("");
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
  }, []);

  useEffect(() => {
    if (!hubId) return;
    supabase
      .from("food_hubs")
      .select("id,name,city,suburb,address_line1,latitude,longitude,photo_url")
      .eq("id", hubId)
      .maybeSingle()
      .then(({ data }) => setHub((data as HubLite) || null));
  }, [hubId]);

  const submit = async () => {
    if (!user) {
      alert("Please sign in to request a bag.");
      return;
    }
    if (!hub) {
      alert("Please pick a hub first.");
      return;
    }
    if (!diet) {
      alert("Please select a dietary preference.");
      return;
    }
    if (diet === "Other" && !otherDiet.trim()) {
      alert("Please specify your dietary requirements.");
      return;
    }
    if (!pickupWindow) {
      alert("Please select a pickup window.");
      return;
    }
    if (!agreed) {
      alert("Please agree to the hub rules.");
      return;
    }

    setSubmitting(true);
    try {
      const finalDiet = diet === "Other" ? otherDiet : diet;
      
      const insertPayload = {
        user_id: user.id,
        hub_id: hub.id,
        dietary_preferences: finalDiet,
        allergies: allergies || null,
        notes: notes || null,
        preferred_window: pickupWindow,
        status: "pending" as const,
      };

      const { error } = await supabase.from("bag_requests").insert(insertPayload);
      if (error) throw error;

      // Optional email notification
      try {
        await supabase.functions.invoke("send-mail", {
          body: {
            to: user.email,
            subject: "Your NourishSA bag request",
            type: "bag-request",
            data: {
              hub: { name: hub.name, suburb: hub.suburb, city: hub.city },
              window: pickupWindow,
              diet: finalDiet,
              allergies,
              notes,
            },
          },
        });
      } catch {
        // ignore if function not set up
      }

      setOk(true);
    } catch (e: any) {
      alert(e.message || "Could not submit request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!hubId) {
    return (
      <div className="max-w-2xl mx-auto px-6 pt-24 pb-16">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>No hub selected</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Please choose a hub first.</p>
            <Button onClick={() => navigate("/hubs?mode=get-bag")}>Browse hubs</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (ok) {
    return (
      <div className="max-w-2xl mx-auto px-6 pt-24 pb-16">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="w-6 h-6" />
              Request received — thank you!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We've logged your preferences and pickup window for{" "}
              <strong>{hub?.name}</strong>
              {hub?.suburb ? ` • ${hub?.suburb}` : ""} • {hub?.city}.
            </p>
            {pickupWindow && (
              <p>
                <span className="font-medium">Pickup window:</span> {pickupWindow}
              </p>
            )}
            <Button onClick={() => navigate("/hubs?mode=get-bag")}>Back to hubs</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 pt-24 pb-16">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Tell us about your food bag</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {hub && (
            <div className="rounded-xl border p-4 bg-emerald-50/40">
              <div className="flex items-center gap-2 text-sm text-emerald-800">
                <MapPin className="w-4 h-4" />
                <span className="font-medium">{hub.name}</span>
                {hub.suburb ? <span>• {hub.suburb}</span> : null} • {hub.city}
              </div>
              {hub.address_line1 && (
                <div className="text-sm text-gray-600 ml-6">{hub.address_line1}</div>
              )}
            </div>
          )}

          {/* Updated Diet Selection - Single Choice */}
          <div>
            <Label className="text-sm">Diet & religion (select one)</Label>
            <div className="space-y-2 mt-2">
              {DIET_OPTIONS.map((d) => (
                <label 
                  key={d} 
                  className="border rounded-xl px-3 py-2 flex items-center gap-3 hover:bg-emerald-50 transition cursor-pointer"
                >
                  <input
                    type="radio"
                    name="diet"
                    value={d}
                    checked={diet === d}
                    onChange={(e) => setDiet(e.target.value)}
                    className="text-emerald-600"
                  />
                  <span>{d}</span>
                </label>
              ))}
            </div>
            
            {diet === "Other" && (
              <div className="mt-3">
                <Input
                  placeholder="Please specify your dietary requirements"
                  value={otherDiet}
                  onChange={(e) => setOtherDiet(e.target.value)}
                  className="border-emerald-200"
                />
              </div>
            )}
          </div>

          {/* Allergies + Notes */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Allergies (optional)</Label>
              <Input
                placeholder="e.g., nuts, shellfish, gluten"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
              />
            </div>
            <div>
              <Label>Notes (optional)</Label>
              <Textarea
                rows={3}
                placeholder="Anything else you'd like us to know"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Updated Pickup Window - Dropdown */}
          <div>
            <Label>Pickup window</Label>
            <select 
              className="w-full mt-2 px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              value={pickupWindow}
              onChange={(e) => setPickupWindow(e.target.value)}
            >
              <option value="">Select a time window</option>
              {PICKUP_WINDOWS.map((window) => (
                <option key={window} value={window}>{window}</option>
              ))}
            </select>
          </div>

          {/* Terms */}
          <label className="flex items-center gap-3 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="rounded text-emerald-600"
            />
            I agree to hub rules (queueing, ID check if requested, be respectful).
          </label>

          <div className="pt-2">
            <Button
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
              disabled={submitting}
              onClick={submit}
            >
              {submitting ? "Submitting…" : "Submit"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}