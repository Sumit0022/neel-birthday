"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/ScrollTrigger";

const photosData = [
  { id: 1, src: "/memories/photo3.jpg", t: 0.22, offsetY: -160 },
  { id: 2, src: "/memories/photo2.jpg", t: 0.5, offsetY: 180 },
  { id: 3, src: "/memories/photo1.jpg", t: 0.78, offsetY: -150 },
];

const getBezierPoint = (t: number, p0: number, p1: number, p2: number, p3: number) => {
  const cT = 1 - t;
  return cT * cT * cT * p0 + 3 * cT * cT * t * p1 + 3 * cT * t * t * p2 + t * t * t * p3;
};

export default function MessageLine() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  
  const pinsRef = useRef<(SVGCircleElement | null)[]>([]);
  const photoRefs = useRef<(HTMLDivElement | null)[]>([]);
  const linesRef = useRef<(SVGLineElement | null)[]>([]);
  
  const scrollYRef = useRef(0);

  useGSAP(() => {
    // Parallax tracker
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        scrollYRef.current = (self.progress - 0.5) * 300;
      }
    });

    // Text slide in
    gsap.fromTo(textRef.current, 
      { x: -100, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 70%",
          end: "top 30%",
          scrub: 1,
        }
      }
    );

    // SVG path draw
    const length = 3000;
    gsap.set(pathRef.current, { strokeDasharray: length, strokeDashoffset: length });
    gsap.to(pathRef.current, {
      strokeDashoffset: 0,
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 75%",
        end: "center center",
        scrub: 1,
      }
    });

  }, { scope: containerRef });

  useEffect(() => {
    let frame: number;
    const start = Date.now();

    const animate = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      const time = (Date.now() - start) / 1000;

      // Base points for the bezier curve
      const p0 = { x: -100, y: h * 0.4 };
      const p1 = { x: w * 0.3, y: h * 0.7 + Math.sin(time * 1.5) * 40 };
      const p2 = { x: w * 0.6, y: h * 0.3 + Math.cos(time * 1.2) * 40 };
      const p3 = { x: w + 100, y: h * 0.6 };

      const d = `M ${p0.x},${p0.y} C ${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`;
      if (pathRef.current) pathRef.current.setAttribute("d", d);

      // Update pins, lines, and photos
      photosData.forEach((photo, i) => {
        const bx = getBezierPoint(photo.t, p0.x, p1.x, p2.x, p3.x);
        const by = getBezierPoint(photo.t, p0.y, p1.y, p2.y, p3.y);
        
        if (pinsRef.current[i]) {
          pinsRef.current[i]!.setAttribute("cx", bx.toString());
          pinsRef.current[i]!.setAttribute("cy", by.toString());
        }

        // Apply distinct parallax multiplier per photo for organic feel
        const parallax = scrollYRef.current * (i % 2 === 0 ? 0.7 : -0.9); 
        
        // Adjust for mobile screens: stack them tighter vertically if needed
        const isMobile = w < 768;
        const responsiveOffsetY = isMobile ? photo.offsetY * 0.7 : photo.offsetY;
        
        const photoY = by + responsiveOffsetY + parallax;
        const photoX = bx;

        if (photoRefs.current[i]) {
          photoRefs.current[i]!.style.transform = `translate(${photoX}px, ${photoY}px)`;
        }

        if (linesRef.current[i]) {
          linesRef.current[i]!.setAttribute("x1", bx.toString());
          linesRef.current[i]!.setAttribute("y1", by.toString());
          linesRef.current[i]!.setAttribute("x2", photoX.toString());
          linesRef.current[i]!.setAttribute("y2", photoY.toString());
        }
      });

      frame = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative overflow-hidden bg-gradient-to-b from-celebration-300 to-theme-light"
    >
      {/* Title Text */}
      <div className="absolute top-16 left-6 md:top-24 md:left-24 z-30 pointer-events-none">
        <h2 ref={textRef} className="text-4xl md:text-6xl font-serif font-bold text-royal-maroon tracking-wide opacity-0">
          A Journey of <br />
          <span className="font-cursive text-5xl md:text-7xl text-royal-gold drop-shadow-sm block mt-2">Beautiful Moments</span>
        </h2>
      </div>

      {/* Dynamic SVG Layer */}
      <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none">
        {/* The curvy main path */}
        <path 
          ref={pathRef}
          fill="none" 
          stroke="var(--tw-color-royal-gold, #d4af37)" 
          strokeWidth="3"
          strokeLinecap="round"
          className="opacity-70"
        />
        
        {/* Connector lines and pins */}
        {photosData.map((photo, i) => (
          <g key={`pin-${photo.id}`}>
            <line 
              ref={el => { linesRef.current[i] = el; }}
              stroke="var(--tw-color-royal-gold, #d4af37)"
              strokeWidth="2"
              strokeDasharray="4 4"
              className="opacity-50"
            />
            <circle 
              ref={el => { pinsRef.current[i] = el; }}
              r="6" 
              fill="var(--tw-color-theme-light, #fdfbf7)" 
              stroke="var(--tw-color-royal-gold, #d4af37)" 
              strokeWidth="3"
            />
          </g>
        ))}
      </svg>

      {/* Interactive Photos */}
      {photosData.map((photo, i) => (
        <div 
          key={`photo-${photo.id}`}
          ref={el => { photoRefs.current[i] = el; }}
          className="absolute top-0 left-0 z-20 pointer-events-auto"
        >
          <div className="w-40 h-56 md:w-56 md:h-72 bg-theme-light p-2 md:p-3 rounded-2xl shadow-xl group hover:scale-105 hover:shadow-2xl transition-all duration-500 ease-out cursor-pointer -translate-x-1/2 -translate-y-1/2 border border-black/5">
            <div className="w-full h-full relative overflow-hidden rounded-xl bg-gray-200">
              <img 
                src={photo.src} 
                className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700 ease-in-out" 
                alt="Memory" 
              />
              <div className="absolute inset-0 bg-royal-maroon mix-blend-overlay opacity-20 group-hover:opacity-0 transition-opacity duration-700" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
