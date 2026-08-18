"use client";

import { ReactNode, useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

export default function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    // 1. Force scroll to top on refresh
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // Register ScrollTrigger with GSAP
    gsap.registerPlugin(ScrollTrigger);

    // Initialize Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // standard Apple-like ease
      smoothWheel: true,
      wheelMultiplier: 1,
    });

    // Synchronize Lenis with GSAP ScrollTrigger
    let isSnapping = false;
    let snapTimeout: NodeJS.Timeout;

    lenis.on("scroll", () => {
      ScrollTrigger.update();

      // 2. Custom Snapping Logic (if section > 85% visible)
      clearTimeout(snapTimeout);
      snapTimeout = setTimeout(() => {
        if (isSnapping) return;
        
        const sections = document.querySelectorAll('section');
        const viewportHeight = window.innerHeight;
        
        sections.forEach(section => {
          const rect = section.getBoundingClientRect();
          // Calculate how much of the section is visible in the viewport
          const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
          const visiblePercentage = visibleHeight / viewportHeight;
          
          // If more than 60% but not 100% aligned, snap it into full view
          if (visiblePercentage > 0.60 && visiblePercentage < 0.99) {
            isSnapping = true;
            lenis.scrollTo(section, {
              duration: 0.8,
              onComplete: () => { isSnapping = false; }
            });
          }
        });
      }, 2000); // Fire after waiting 2 seconds of no scrolling
    });

    // Provide GSAP ticker with Lenis raf
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    // Disable GSAP lag smoothing to avoid conflicts with Lenis
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove((time) => {
        lenis.raf(time * 1000);
      });
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
