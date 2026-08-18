"use client";

import { useEffect, useState } from "react";
import gsap from "gsap";

export function useCustomCursor(enabled: boolean = false) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) return;

    const moveCursor = (e: MouseEvent) => {
      // Use GSAP for smooth interpolation of cursor position
      gsap.to(position, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1, // Adjust for lag/smoothness
        ease: "power2.out",
        onUpdate: () => setPosition({ x: position.x, y: position.y })
      });
    };

    window.addEventListener("mousemove", moveCursor);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
    };
  }, [enabled, position]);

  return position;
}
