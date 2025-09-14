import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  imageUrl: string;
  className?: string;
  children?: React.ReactNode; // optional actions
};

const PageHero: React.FC<Props> = ({ title, subtitle, imageUrl, className, children }) => {
  return (
    <div className={cn("relative overflow-hidden rounded-3xl mb-8 shadow-lg", className)}>
      <div className="absolute inset-0">
        <img src={imageUrl} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/10" />
        <div className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-green-500/20 blur-3xl" />
        <div className="absolute -bottom-28 -left-28 w-[420px] h-[420px] rounded-full bg-emerald-300/20 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 px-6 md:px-10 py-12 md:py-20 text-white"
      >
        <h1 className="text-3xl md:text-5xl font-extrabold drop-shadow-lg">{title}</h1>
        {subtitle && <p className="mt-3 text-lg md:text-xl text-white/90 max-w-3xl">{subtitle}</p>}
        {children && <div className="mt-6">{children}</div>}
      </motion.div>
    </div>
  );
};

export default PageHero;
