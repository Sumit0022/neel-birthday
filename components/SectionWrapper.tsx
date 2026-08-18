"use client";

import { ReactNode, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/ScrollTrigger";

// Ensure ScrollTrigger is registered
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function SectionWrapper({ 
  children, 
  className = "" 
}: { 
  children: ReactNode; 
  className?: string 
}) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;
    
    // A subtle fade and slight upward motion for consistent entrance
    gsap.fromTo(
      sectionRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      }
    );
  }, { scope: sectionRef });

  return (
    <section 
      ref={sectionRef} 
      className={`h-screen w-full relative flex items-center justify-center overflow-hidden ${className}`}
    >
      {children}
    </section>
  );
}
