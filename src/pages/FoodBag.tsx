import React from "react";
import { motion } from "framer-motion";
import { ShoppingBag, CheckCircle2, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const hero = "/lovable-uploads/geojango-maps-Z8UgB80_46w-unsplash.jpg";

const features = [
  {
    icon: ShoppingBag,
    title: "Bag of the day",
    text: "Fresh, balanced essentials hand-packed by volunteers.",
    image: "/lovable-uploads/alexander-simonsen-44al1GlFVxo-unsplash.jpg",
  },
  {
    icon: Clock,
    title: "Pick a time",
    text: "Choose a pickup window that suits you.",
    image: "/lovable-uploads/jack-b-_6KWbHyfJDE-unsplash.jpg",
  },
  {
    icon: CheckCircle2,
    title: "Tailored to you",
    text: "Respecting dietary & religious preferences.",
    image: "/lovable-uploads/c84c72dc-5e01-4b9e-a7c8-fcc3dbfcf5e6.png",
  },
];

export default function FoodBag() {
  const navigate = useNavigate();
  return (
    <div className="pt-20">
      {/* Hero */}
      <div className="relative">
        <div
          className="h-[320px] bg-cover bg-center"
          style={{ backgroundImage: `url('${hero}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-white" />
        <div className="absolute inset-x-0 bottom-0 translate-y-8">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow">
              Get your <span className="text-emerald-400">Food Bag</span>
            </h1>
            <p className="text-white/90 mt-3 text-lg">
              See today’s bags, then grab one at a nearby hub.
            </p>
          </div>
        </div>
      </div>

      {/* Feature cards */}
      <div className="max-w-6xl mx-auto px-6 mt-20 grid md:grid-cols-3 gap-8">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              whileHover={{ y: -6, scale: 1.01 }}
              className="relative rounded-3xl overflow-hidden group border bg-white/70 backdrop-blur-xl shadow-xl"
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('${f.image}')` }}
              />
              <div className="absolute inset-0 bg-emerald-900/70 group-hover:bg-emerald-900/60 transition" />
              <div className="relative text-white p-8 h-64 flex flex-col justify-end">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-10 h-10 rounded-xl bg-white/15 inline-flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </span>
                  <div className="text-xl font-semibold">{f.title}</div>
                </div>
                <div className="text-white/85">{f.text}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="max-w-6xl mx-auto px-6 my-16 text-center">
        <Button
          size="lg"
          className="h-12 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700"
          onClick={() => navigate("/hubs?mode=get-bag")}
        >
          <MapPin className="w-4 h-4 mr-2" />
          Get your bag at your nearby hub
        </Button>
        <p className="text-sm text-gray-500 mt-3">
          You’ll choose a hub first, then complete your bag request.
        </p>
      </div>
    </div>
  );
}
