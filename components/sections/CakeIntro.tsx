"use client";

import { motion } from "framer-motion";

export default function CakeIntro() {
  return (
    <div className="w-full h-screen bg-[#050515] flex items-center justify-center overflow-hidden">
      <motion.h2 
        initial={{ opacity: 0, scale: 0.5, filter: "blur(10px)", y: 50 }}
        whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)", y: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        viewport={{ once: false, amount: 0.5 }}
        className="text-white font-serif italic text-4xl md:text-6xl tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
      >
        Let's cut the cake
      </motion.h2>
    </div>
  );
}
