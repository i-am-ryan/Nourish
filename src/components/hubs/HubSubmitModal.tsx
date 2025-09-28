import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MapPin, Upload, LocateFixed } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Props = { open: boolean; onClose: () => void; onCreated?: () => void };

export default function HubSubmitModal({ open, onClose, onCreated }: Props) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    phone: "",
    email: "",
    website: "",
    city: "Johannesburg",
    suburb: "",
    address_line1: "",
    // keep postal_code in the UI if you want, but we won't insert it unless you add the column
    postal_code: "",
    latitude: "",
    longitude: "",
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const getCoords = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setForm((f) => ({
        ...f,
        latitude: String(pos.coords.latitude),
        longitude: String(pos.coords.longitude),
      }));
    });
  };

// In the submit function, remove the created_by field completely:
const submit = async () => {
  if (!form.name.trim() || !form.city.trim()) {
    alert("Please fill in at least Name and City.");
    return;
  }
  setSaving(true);
  try {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) throw new Error("Sign in required");

    let photo_url: string | null = null;
    if (photo) {
      const path = `hub-submissions/${auth.user.id}/${Date.now()}-${photo.name}`;
      const { error: upErr } = await supabase.storage.from("hubs").upload(path, photo, { upsert: false });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("hubs").getPublicUrl(path);
      photo_url = data.publicUrl;
    }

    // DO NOT include created_by - let the database default handle it
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      phone: form.phone || null,
      email: form.email || null,
      website: form.website || null,
      city: form.city.trim(),
      suburb: form.suburb.trim() || null,
      address_line1: form.address_line1 || null,
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
      photo_url,
    };

    const { error } = await supabase.from("hub_submissions").insert(payload);
    if (error) throw error;

    onCreated?.();
    onClose();
    
    // Reset form
    setForm({
      name: "", description: "", phone: "", email: "", website: "",
      city: "Johannesburg", suburb: "", address_line1: "", postal_code: "",
      latitude: "", longitude: ""
    });
    setPhoto(null);
  } catch (e: any) {
    console.error(e);
    alert(e.message || "Failed to submit hub. Please try again.");
  } finally {
    setSaving(false);
  }
};

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Suggest a Food Hub</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-4">
          <Input placeholder="Hub name *" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} />
          <Input placeholder="Phone" value={form.phone} onChange={(e)=>setForm({...form, phone:e.target.value})} />
          <Input placeholder="Email" value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} />
          <Input placeholder="Website" value={form.website} onChange={(e)=>setForm({...form, website:e.target.value})} />
          <Input placeholder="City *" value={form.city} onChange={(e)=>setForm({...form, city:e.target.value})} />
          <Input placeholder="Suburb" value={form.suburb} onChange={(e)=>setForm({...form, suburb:e.target.value})} />
          <Input placeholder="Address / landmark" value={form.address_line1} onChange={(e)=>setForm({...form, address_line1:e.target.value})} />
          <Input placeholder="Postal code (UI only)" value={form.postal_code} onChange={(e)=>setForm({...form, postal_code:e.target.value})} />
          <div className="flex gap-2">
            <Input placeholder="Latitude" value={form.latitude} onChange={(e)=>setForm({...form, latitude:e.target.value})} />
            <Input placeholder="Longitude" value={form.longitude} onChange={(e)=>setForm({...form, longitude:e.target.value})} />
            <Button type="button" variant="outline" onClick={getCoords} title="Use my location">
              <LocateFixed className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Input type="file" accept="image/*" onChange={(e)=>setPhoto(e.target.files?.[0] ?? null)} />
            <Upload className="w-4 h-4 text-gray-500" />
          </div>
          <div className="md:col-span-2">
            <Textarea placeholder="Short description" value={form.description} onChange={(e)=>setForm({...form, description:e.target.value})} />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
            <MapPin className="w-4 h-4 mr-2" /> {saving ? "Submitting…" : "Submit"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
