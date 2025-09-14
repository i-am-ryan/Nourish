import React from "react";
import { MapPin } from "lucide-react";

export type City = "Johannesburg" | "Pretoria";

type Props = {
  /** Primary modern callback: both city and suburb */
  onSelect?: (city: City, suburb: string) => void;
  /** Legacy one-arg callback (kept for back-compat) */
  onSuburbSelect?: (suburb: string) => void;
  /** Legacy two-arg callback (kept for back-compat) */
  onPick?: (city: City, suburb: string) => void;
  /** Optional wrapper class */
  className?: string;
};

const JHB_SUBURBS = [
  "Alexandra",
  "Braamfontein",
  "Fourways",
  "Hillbrow",
  "Midrand",
  "Randburg",
  "Rosebank",
  "Sandton",
  "Soweto",
];

const PTA_SUBURBS = [
  "Centurion",
  "Hatfield",
  "Mamelodi",
  "Pretoria Central",
  "Sunnyside",
];

/** Core selector cards (glassy, emerald/teal, hover fades) */
export default function SuburbSelector({
  onSelect,
  onSuburbSelect,
  onPick,
  className = "",
}: Props) {
  type CardProps = {
    city: City;
    suburbs: string[];
    accentDotClass: string;
  };

  const Card = ({ city, suburbs, accentDotClass }: CardProps) => (
    <div className="relative overflow-hidden rounded-3xl border bg-white/75 dark:bg-gray-900/60 backdrop-blur-xl shadow-xl border-white/50 dark:border-gray-700/40">
      {/* top accent line */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500" />
      <div className="p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-10 h-10 rounded-xl ${accentDotClass} flex items-center justify-center`}>
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{city}</h3>
        </div>

        <ul className="grid gap-3">
          {suburbs.map((s) => (
            <li key={s}>
              <button
                className="w-full text-left px-4 py-3 rounded-xl border bg-white/70 dark:bg-gray-800/70 border-white/50 dark:border-gray-700/40 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 dark:hover:from-emerald-900/20 dark:hover:to-teal-900/20 transition-all"
                onClick={() => {
                  // Fire all supported callbacks so old usages keep working
                  onSelect?.(city, s);
                  onPick?.(city, s);
                  onSuburbSelect?.(s);
                }}
              >
                <span className="font-medium">{s}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <section className={`space-y-3 ${className}`}>
      <h2 className="text-3xl font-bold text-center">Which area are you in?</h2>
      <p className="text-center text-gray-600">
        Select your suburb to find nearby food hubs
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <Card city="Johannesburg" suburbs={JHB_SUBURBS} accentDotClass="bg-emerald-600" />
        <Card city="Pretoria" suburbs={PTA_SUBURBS} accentDotClass="bg-teal-600" />
      </div>
    </section>
  );
}

/**
 * Volunteer-style hero wrapper with background image + gradient overlay.
 * Use this if you want the “words on image with curves/accents” look.
 *
 * Example:
 * <AreaChooserHero
 *   background="/lovable-uploads/joel-muniz-A4Ax1ApccfA-unsplash.jpg"
 *   onSelect={(city, suburb) => ...}
 * />
 */
export function AreaChooserHero({
  background = "/lovable-uploads/joel-muniz-A4Ax1ApccfA-unsplash.jpg",
  title = "Find a Food Hub Near You",
  subtitle = "Pick your city & suburb to see verified community hubs.",
  ...rest
}: Props & { background?: string; title?: string; subtitle?: string }) {
  return (
    <div className="relative">
      {/* HERO */}
      <div className="relative h-[42vh] min-h-[320px] overflow-hidden rounded-3xl">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 will-change-transform"
          style={{ backgroundImage: `url('${background}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/55 via-black/35 to-black/25" />
        <div className="absolute -top-10 -left-10 w-44 h-44 rounded-full bg-emerald-500/25 blur-2xl" />
        <div className="absolute -bottom-10 -right-10 w-56 h-56 rounded-full bg-teal-500/25 blur-2xl" />

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-white text-4xl md:text-5xl font-extrabold tracking-tight">
            {title}
          </h1>
          <p className="mt-3 text-emerald-100/90 max-w-3xl text-lg">{subtitle}</p>
        </div>

        {/* wave bottom */}
        <svg className="absolute -bottom-px left-0 w-full h-14" viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path
            d="M0,80 C200,0 420,0 720,80 C1020,160 1240,160 1440,80 L1440,100 L0,100 Z"
            fill="white"
            opacity="0.96"
          />
        </svg>
      </div>

      {/* SELECTOR — pulled upward for overlap effect */}
      <div className="-mt-8">
        <SuburbSelector {...rest} />
      </div>
    </div>
  );
}
