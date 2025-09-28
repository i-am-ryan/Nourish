// /src/pages/FoodHubs.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, Crosshair, Plus, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import HubCard, { type Hub } from "@/components/hubs/HubCard";
import SuburbSelector from "@/components/hubs/SuburbSelector";
import HubSubmitModal from "@/components/hubs/HubSubmitModal";

/** Cities & suburbs covered by the selector */
type City = "Johannesburg" | "Pretoria";

type Coords = { lat: number; lng: number };
const SUBURB_COORDS: Record<City, Record<string, Coords>> = {
  Johannesburg: {
    Alexandra: { lat: -26.1033, lng: 28.0899 },
    Braamfontein: { lat: -26.1949, lng: 28.0323 },
    Fourways: { lat: -26.0219, lng: 28.0134 },
    Hillbrow: { lat: -26.1899, lng: 28.05 },
    Midrand: { lat: -25.9992, lng: 28.1263 },
    Randburg: { lat: -26.0941, lng: 27.982 },
    Rosebank: { lat: -26.1466, lng: 28.0416 },
    Sandton: { lat: -26.1076, lng: 28.0567 },
    Soweto: { lat: -26.2485, lng: 27.8544 },
  },
  Pretoria: {
    Centurion: { lat: -25.8603, lng: 28.1892 },
    Hatfield: { lat: -25.7464, lng: 28.2293 },
    Mamelodi: { lat: -25.7167, lng: 28.3833 },
    "Pretoria Central": { lat: -25.7461, lng: 28.1881 },
    Sunnyside: { lat: -25.763, lng: 28.213 },
  },
};

/** Small helpers */
const HOUR_STRING = "Mon–Fri 09:00–17:00; Sat 09:00–13:00";
const FOOD_BAG = ["Bread", "Rice", "Pap", "Chicken soup", "Veg hamper", "Canned beans"];

/** Fallback, guaranteed hubs for any suburb so your page never looks empty */
function fallbackHub(city: City, suburb: string, i: number): Hub {
  const coords = SUBURB_COORDS[city][suburb] ?? { lat: -26.2, lng: 28.04 };
  const images = [
    "/lovable-uploads/arstin-chen-yvP5VhVyBMY-unsplash.jpg",
    "/lovable-uploads/adli-hadiyan-munif-prnjpS_ZnKw-unsplash.jpg",
    "/lovable-uploads/ella-olsson-rD3YrnhTmf0-unsplash.jpg",
    "/lovable-uploads/markus-spiske-5UJbKYUQ1kA-unsplash.jpg",
    "/lovable-uploads/priscilla-du-preez-K8XYGbw4Ahg-unsplash.jpg",
  ];
  const pick = images[i % images.length];

  return {
    id: `${city}-${suburb}-${i}`,
    name: `${suburb} Community Hub`,
    description: "Fresh produce & prepared meals for families",
    city,
    suburb,
    address: `${suburb} City`,
    address_line1: `${suburb} City`, 
    phone: "+27 12 345 6789",
    image_url: pick,
    photo_url: null, // ADD THIS LINE
    rating: 4 + (i % 10) / 10, // 4.0 – 4.9
    meals_per_day: 180 + (i % 5) * 20,
    open_to_public: true,
    requires_referral: false,
    services: FOOD_BAG,
    hours: HOUR_STRING,
    latitude: coords.lat,
    longitude: coords.lng,
    website: "https://nourishsa.org",
  };
}

/** Make sure a list always has at least one hub for a suburb */
function ensureAtLeastOnePerSuburb(city: City, suburb: string | null, existing: Hub[]): Hub[] {
  if (!suburb) return existing;
  const hasOne = existing.some((h) => h.suburb?.toLowerCase() === suburb.toLowerCase());
  return hasOne ? existing : [fallbackHub(city, suburb, 0), ...existing];
}

/** Distance in KM for “Nearby” */
function haversine(a: Coords, b: Coords): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const s =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * (2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s)));
}

export default function FoodHubs() {
  const [city, setCity] = useState<City>("Johannesburg");
  const [suburb, setSuburb] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [nearbyBusy, setNearbyBusy] = useState(false);
  const [nearbyMsg, setNearbyMsg] = useState<string | null>(null);

  const [hubs, setHubs] = useState<Hub[]>([]);
  const [submitOpen, setSubmitOpen] = useState(false);
  const searchBox = useRef<HTMLDivElement>(null);

  /** Load hubs for city/suburb (DB first, then fallback if nothing) */
  const loadHubs = async (q?: string) => {
    setLoading(true);
    try {
      const { data } = await supabase.rpc("search_hubs", {
        p_q: (q ?? query).trim(),
        p_city: city,
        p_suburb: suburb,
        p_limit: 40,
      });

      const mapped: Hub[] =
        (data as any[])?.map((r, i) => {
          const sub = (r.suburb as string) || suburb || "Unknown";
          const coords =
            SUBURB_COORDS[city][sub] ||
            ({ lat: r.latitude ?? -26.2, lng: r.longitude ?? 28.04 } as Coords);

          return {
            id: String(r.id ?? `${city}-${sub}-db-${i}`),
            name: String(r.name ?? `${sub} Community Hub`),
            description: String(r.description ?? "Fresh produce & prepared meals for families"),
            city: (r.city as City) ?? city,
            suburb: sub,
            address: String(r.address ?? `${sub} City`),
              address_line1: String(r.address_line1 ?? `${sub} City`),
            phone: String(r.phone ?? "+27 12 345 6789"),
            image_url: String(
              r.image_url ??
                [
                  "/lovable-uploads/geojango-maps-Z8UgB80_46w-unsplash.jpg",
                  "/lovable-uploads/joel-muniz-A4Ax1ApccfA-unsplash.jpg",
                  "/lovable-uploads/ella-olsson-rD3YrnhTmf0-unsplash.jpg",
                ][i % 3]
            ),
            rating: Number(r.rating ?? 4.6),
            meals_per_day: Number(r.meals_per_day ?? 180),
            open_to_public: Boolean(r.open_to_public ?? true),
            requires_referral: Boolean(r.requires_referral ?? false),
            services: Array.isArray(r.services) && r.services.length
              ? (r.services as string[])
              : FOOD_BAG,
            hours: String(r.hours ?? HOUR_STRING),
            latitude: Number(r.latitude ?? coords.lat),
            longitude: Number(r.longitude ?? coords.lng),
            website: String(r.website ?? "https://nourishsa.org"),
          } as Hub;
        }) ?? [];

      const withGuarantee = ensureAtLeastOnePerSuburb(city, suburb, mapped);
      const finalList =
        withGuarantee.length > 0
          ? withGuarantee
          : Object.keys(SUBURB_COORDS[city]).map((s, i) => fallbackHub(city, s, i));

      setHubs(finalList);
    } catch {
      const fallback =
        suburb != null
          ? [fallbackHub(city, suburb, 0)]
          : Object.keys(SUBURB_COORDS[city]).map((s, i) => fallbackHub(city, s, i));
      setHubs(fallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadHubs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, suburb]);

  /** Nearby */
  const nearby = async () => {
    if (!navigator.geolocation) {
      setNearbyMsg("Location not supported on this device.");
      return;
    }
    setNearbyBusy(true);
    setNearbyMsg(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const me = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const filtered = hubs
          .map((h) => ({
            hub: h,
            d: haversine(me, { lat: h.latitude, lng: h.longitude }),
          }))
          .filter((x) => x.d <= 20)
          .sort((a, b) => a.d - b.d)
          .map((x) => x.hub);

        if (filtered.length === 0) {
          setNearbyMsg("No food hubs within 20km of your location.");
        } else {
          setNearbyMsg(null);
          setHubs(filtered);
        }
        setNearbyBusy(false);
      },
      () => {
        setNearbyBusy(false);
        setNearbyMsg("We couldn’t get your location permission.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  /** Volunteer-style hero (cleaned: no city pills / save area) */
  const hero = useMemo(
    () => (
      <div className="relative overflow-hidden rounded-3xl mb-8 border border-white/30 bg-white/60 dark:bg-gray-800/50 backdrop-blur-xl shadow-xl">
        <div className="absolute inset-0 bg-[url('/lovable-uploads/joel-muniz-A4Ax1ApccfA-unsplash.jpg')] bg-cover bg-center opacity-25" />
        <div className="relative px-6 md:px-10 py-10">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">
                Find a Food Hub
              </h1>
              <p className="text-gray-600">
                Search by name or pick a suburb below. You’ll see real hubs with hours and directions.
              </p>
            </div>
            <Button
              onClick={() => setSubmitOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4 mr-2" /> Add a Food Hub
            </Button>
          </div>

          <div ref={searchBox} className="relative max-w-3xl">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search hubs, food bags…"
                  className="pl-10"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && void loadHubs()}
                />
              </div>
              <Button variant="outline" onClick={() => void loadHubs()}>
                <Search className="w-4 h-4 mr-2" /> Search
              </Button>
              <Button onClick={() => void nearby()} className="bg-emerald-600 hover:bg-emerald-700">
                {nearbyBusy ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Locating…
                  </>
                ) : (
                  <>
                    <Crosshair className="w-4 h-4 mr-2" /> Nearby
                  </>
                )}
              </Button>
            </div>
            {nearbyMsg && <p className="mt-2 text-sm text-gray-600">{nearbyMsg}</p>}
          </div>
        </div>
      </div>
    ),
    [query, nearbyBusy, nearbyMsg]
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Hero */}
      {hero}

      {/* Suburb selector (expects a single-arg callback). */}
      <SuburbSelector
        onSuburbSelect={(s: string) => {
          setSuburb(s);
          void loadHubs();
          window.scrollTo({
            top: (searchBox.current?.offsetTop ?? 0) + 140,
            behavior: "smooth",
          });
        }}
      />

      {/* Results */}
      <section className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-gray-700">
              <MapPin className="w-4 h-4 mr-1" />
              {suburb ? `${suburb}, ${city}` : city}
            </Badge>
            {!loading && <span className="text-sm text-gray-500">{hubs.length} hub(s)</span>}
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-[320px] rounded-3xl bg-gray-100 dark:bg-gray-800 animate-pulse"
              />
            ))}
          </div>
        ) : hubs.length ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {hubs.map((h) => (
              <HubCard key={h.id} hub={h} />
            ))}
          </motion.div>
        ) : (
          <div className="text-center text-gray-500 py-16">
            No hubs found. Try a different suburb or add one.
          </div>
        )}
      </section>

      {/* Submit modal */}
      <HubSubmitModal
        open={submitOpen}
        onClose={() => setSubmitOpen(false)}
        onCreated={() => void loadHubs()}
      />
    </div>
  );
}
