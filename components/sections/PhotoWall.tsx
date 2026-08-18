"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const paperTextureUrl = "data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E";

const photos = [
  { id: 1, src: "/memories/wall1.jpg", caption: "Eyes Say Everything", className: "top-[2%] left-[2%] md:top-[8%] md:left-[4%]", rotate: -4 },
  { id: 2, src: "/memories/wall2.jpg", caption: "Softly Unbothered", className: "top-[12%] left-[20%] md:top-[12%] md:left-[28%]", rotate: 3 },
  { id: 3, src: "/memories/wall3.jpg", caption: "Desi Elegance ✨", className: "top-[22%] left-[5%] md:top-[6%] md:left-[52%]", rotate: -6 },
  { id: 4, src: "/memories/wall4.jpg", caption: "Quietly Unfiltered", className: "top-[32%] left-[25%] md:top-[14%] md:left-[76%]", rotate: 5 },
  { id: 5, src: "/memories/wall5.jpg", caption: "Pretty As Always", className: "top-[42%] left-[5%] md:top-[52%] md:left-[8%]", rotate: 2 },
  { id: 6, src: "/memories/wall6.jpg", caption: "Beauty In Her Element ✨", className: "top-[52%] left-[20%] md:top-[48%] md:left-[32%]", rotate: -5 },
  { id: 7, src: "/memories/wall7.jpg", caption: "Gracefully Mesmerizing ✨", className: "top-[62%] left-[5%] md:top-[56%] md:left-[56%]", rotate: 4 },
  { id: 8, src: "/memories/wall8.jpg", caption: "Dangerously Beautiful 🖤✨", className: "top-[72%] left-[25%] md:top-[46%] md:left-[80%]", rotate: -3 },
];

function PhotoCard({ 
  photo, 
  constraintsRef, 
  globalZIndex, 
  setGlobalZIndex 
}: { 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  photo: any; 
  constraintsRef: React.RefObject<HTMLDivElement>;
  globalZIndex: number;
  setGlobalZIndex: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [localZ, setLocalZ] = useState(photo.id);
  
  // Motion values for 3D tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 300, damping: 30 });
  const springY = useSpring(y, { stiffness: 300, damping: 30 });

  // Map mouse position to rotation degrees
  const rotateX = useTransform(springY, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(springX, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handlePointerLeave = () => {
    x.set(0);
    y.set(0);
  };

  const bringToFront = () => {
    setGlobalZIndex((prev) => prev + 1);
    setLocalZ(globalZIndex + 1);
  };

  return (
    <motion.div
      drag
      dragConstraints={constraintsRef}
      onDragStart={bringToFront}
      onPointerDown={bringToFront}
      whileDrag={{ scale: 1.08, cursor: "grabbing" }}
      initial={{ rotate: photo.rotate, opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1, transition: { duration: 0.6, delay: photo.id * 0.1 } }}
      viewport={{ once: true, margin: "-50px" }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        rotateX,
        rotateY,
        zIndex: localZ,
        perspective: 1000,
      }}
      className={`absolute ${photo.className} cursor-grab`}
    >
      {/* The Polaroid Card */}
      <div 
        className="bg-[#f9f8f3] p-2 pb-10 md:p-3 md:pb-12 rounded-sm flex flex-col items-center pointer-events-none w-32 md:w-48 lg:w-56 shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_25px_50px_rgba(0,0,0,0.25)] transition-shadow duration-300"
        style={{
          backgroundImage: `url("${paperTextureUrl}")`,
          backgroundBlendMode: "multiply",
        }}
      >
        {/* Dynamic Image Wrapper - height is auto to respect dynamic aspect ratio */}
        <div className="w-full relative rounded-sm shadow-inner overflow-hidden border border-black/10">
          <img 
            src={photo.src} 
            alt={photo.caption} 
            className="w-full h-auto object-cover filter contrast-110 sepia-[0.15]"
            draggable={false}
          />
        </div>
        <div className="absolute bottom-2 md:bottom-3 w-full flex justify-center">
          <p className="font-handwriting text-2xl md:text-3xl lg:text-4xl text-gray-800 tracking-tight leading-none opacity-90 transform -rotate-2">
            {photo.caption}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function PhotoWall() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [globalZIndex, setGlobalZIndex] = useState(10);
  const [hasInteracted, setHasInteracted] = useState(false);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative overflow-hidden bg-gradient-to-b from-theme-light to-[#f0ece1]"
      onPointerDown={() => setHasInteracted(true)}
    >
      {/* Background Texture Overlay to simulate a wall */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply"
        style={{ backgroundImage: `url("${paperTextureUrl}")` }}
      />
      
      {/* Instructional Hint */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 1 }}
        animate={{ opacity: hasInteracted ? 0 : 1 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none"
      >
        <div className="bg-black/60 backdrop-blur-sm text-white px-6 py-3 rounded-full font-sans text-sm md:text-base tracking-wide flex items-center gap-2 shadow-xl">
          <span>psst, you can move these around</span>
          <span className="text-xl">👋</span>
        </div>
      </motion.div>

      {/* Render Photos */}
      {photos.map((photo) => (
        <PhotoCard 
          key={photo.id}
          photo={photo}
          constraintsRef={containerRef}
          globalZIndex={globalZIndex}
          setGlobalZIndex={setGlobalZIndex}
        />
      ))}
    </div>
  );
}
