import React, { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Star, Heart, Info, ExternalLink } from "lucide-react";

export type Hub = {
  id: string;
  name: string;
  description: string | null;
  city: string;
  suburb: string;
  address: string | null;
  address_line1: string | null; // Add this line
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  website: string | null;
  image_url: string | null;
  rating: number | null;
  meals_per_day: number | null;
  open_to_public: boolean;
  requires_referral: boolean;
  services?: string[];
  hours?: string | null;
};

type Props = { hub: Hub };

const openMaps = (hub: Hub) => {
  const q =
    hub.latitude != null && hub.longitude != null
      ? `${hub.latitude},${hub.longitude}`
      : encodeURIComponent(
          `${hub.name} ${hub.suburb} ${hub.city} ${hub.address ?? ""}`
        );
  window.open(
    `https://www.google.com/maps/search/?api=1&query=${q}`,
    "_blank",
    "noopener,noreferrer"
  );
};

export default function HubCard({ hub }: Props) {
  const [open, setOpen] = useState(false);
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode"); // when "get-bag", button changes

  return (
    <>
      <motion.div
        initial={{ opacity: 0.9, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        className="group relative overflow-hidden rounded-3xl border bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl shadow-xl border-white/50 dark:border-gray-700/40"
      >
        <div className="relative h-44">
          <img
            src={
              hub.image_url ||
              "https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=1600&auto=format&fit=crop"
            }
            alt={hub.name}
            className="absolute inset-0 w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/15 to-transparent" />

          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className="bg-emerald-600 hover:bg-emerald-600">verified</Badge>
            {hub.rating != null && (
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 text-white text-xs backdrop-blur">
                <Star className="w-3 h-3" /> {hub.rating.toFixed(1)}
              </div>
            )}
          </div>

          <button
            onClick={() => setOpen(true)}
            className="absolute top-3 right-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/80 text-gray-900 text-xs shadow hover:bg-white"
            title="Details"
          >
            {mode === "get-bag" ? "Get a bag" : "Details"} <Info className="w-3 h-3" />
          </button>
        </div>

        <div className="p-4">
          <div className="font-semibold text-lg mb-1">{hub.name}</div>
          <div className="text-sm text-gray-600 flex items-center gap-1">
            <MapPin className="w-4 h-4 text-emerald-600" />
            {hub.suburb}, {hub.city}
          </div>
          {hub.description && (
            <div className="text-sm text-gray-700 mt-2 line-clamp-2">{hub.description}</div>
          )}

          <div className="mt-4 flex items-center gap-2">
            <Button
              onClick={() => openMaps(hub)}
              className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              <MapPin className="w-4 h-4 mr-2" /> Directions
            </Button>
            {hub.phone && (
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => (window.location.href = `tel:${hub.phone}`)}
              >
                <Phone className="w-4 h-4 mr-2" /> Call
              </Button>
            )}
            <button
              className="ml-auto inline-flex items-center justify-center w-9 h-9 rounded-full border bg-white/60 hover:bg-emerald-50"
              title="Save"
            >
              <Heart className="w-4 h-4 text-emerald-600" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-60">
              <img
                src={
                  hub.image_url ||
                  "https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=1600&auto=format&fit=crop"
                }
                alt={hub.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/15 to-transparent" />
              <button
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 inline-flex px-3 py-1 rounded-full bg-white/85 text-gray-900 text-xs"
              >
                Close
              </button>
              <div className="absolute left-4 bottom-4 text-white">
                <div className="text-2xl font-bold">{hub.name}</div>
              </div>
            </div>

            <div className="p-6 grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="text-sm text-gray-600 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600 mt-0.5" />
                  <div>
                    <div>
                      {hub.suburb}, {hub.city}
                    </div>
                    {hub.address && <div className="text-gray-500">{hub.address}</div>}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => openMaps(hub)} className="rounded-xl">
                    Open in Maps <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                {hub.description && (
                  <div className="text-sm text-gray-700">{hub.description}</div>
                )}
              </div>

              <div className="space-y-3">
                <div className="font-medium">What’s available</div>
                <div className="flex flex-wrap gap-2">
                  {(hub.services && hub.services.length
                    ? hub.services
                    : ["Bread", "Chicken soup", "Rice", "Pap", "South African staples"]
                  ).map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {hub.hours && (
                  <>
                    <div className="font-medium pt-2">Opening hours</div>
                    <div className="text-sm text-gray-700">{hub.hours}</div>
                  </>
                )}

                <div className="pt-2">
                  <Button
                    className="rounded-xl w-full bg-emerald-600 hover:bg-emerald-700"
                    onClick={() =>
                      (window.location.href = `/bag/request?hubId=${encodeURIComponent(
                        hub.id
                      )}`)
                    }
                  >
                    {mode === "get-bag" ? "Get a bag" : "Start a bag request"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
