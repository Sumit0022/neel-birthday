"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { Sparkles } from "@react-three/drei";
import { MathUtils } from "three";
import * as THREE from "three";

function Balloons() {
  const groupRef = useRef<THREE.Group>(null);
  
  const [balloons] = useState(() => 
    Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: MathUtils.randFloatSpread(25),
      y: MathUtils.randFloatSpread(20) - 15,
      z: MathUtils.randFloatSpread(15) - 5,
      color: ['#fef3c7', '#fcd34d', '#f59e0b', '#f43f5e', '#be123c', '#d4af37'][Math.floor(Math.random() * 6)],
      speed: MathUtils.randFloat(1, 3),
      offset: MathUtils.randFloat(0, 100),
      scale: MathUtils.randFloat(0.8, 1.5)
    }))
  );

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((balloon, i) => {
        const data = balloons[i];
        balloon.position.y += data.speed * 0.03;
        balloon.position.x += Math.sin(state.clock.elapsedTime + data.offset) * 0.01;
        
        if (balloon.position.y > 20) {
          balloon.position.y = -20;
        }
      });
    }
  });

  return (
    <group ref={groupRef}>
      {balloons.map((b) => (
        <mesh key={b.id} position={[b.x, b.y, b.z]} scale={b.scale}>
          {/* Simple balloon shape using a slightly stretched sphere */}
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color={b.color} roughness={0.1} metalness={0.1} />
        </mesh>
      ))}
    </group>
  );
}

export default function IntroScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  
  const text18Ref = useRef<HTMLDivElement>(null);
  const text19Ref = useRef<HTMLDivElement>(null);
  const filterRef = useRef<SVGFEDisplacementMapElement>(null);
  const bg3dRef = useRef<HTMLDivElement>(null);
  const stageCtextRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline();
    tlRef.current = tl;

    // Stage A: 0-5s suspense
    tl.to(text18Ref.current, {
      textShadow: "0px 0px 50px rgba(253,251,247,0.8)",
      duration: 2,
      yoyo: true,
      repeat: 1,
      ease: "sine.inOut"
    });

    // Stage B: Liquid morph at ~4s mark
    tl.addLabel("stageB", "+=0.5")
    .to(filterRef.current, {
      attr: { scale: 150 },
      duration: 1,
      ease: "power2.in",
    }, "stageB")
    .to(text18Ref.current, { opacity: 0, duration: 0.1 }, "stageB+=0.8")
    .to(text19Ref.current, { opacity: 1, duration: 0.1 }, "stageB+=0.8")
    .to(filterRef.current, {
      attr: { scale: 0 },
      duration: 1.5,
      ease: "power4.out",
    });

    // Trigger big transition to bright scene
    tl.to(particlesRef.current, {
      opacity: 0,
      duration: 0.5,
    }, "-=1.5")
    .to(containerRef.current, {
      backgroundColor: "#fef3c7", // fallback behind 3D
      duration: 1.5,
      ease: "power2.inOut",
    }, "-=1")
    .to(bg3dRef.current, {
      opacity: 1,
      duration: 1.5,
      ease: "power2.inOut",
    }, "-=1.5");
    
    // Blast away "19"
    tl.to(text19Ref.current, {
      opacity: 0,
      scale: 2,
      filter: "blur(20px)",
      duration: 1,
      ease: "power2.in",
    }, "-=1.2");

    // Stage C: Reveal final text
    tl.fromTo(stageCtextRef.current, 
      { opacity: 0, y: 50, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 1.5, ease: "back.out(1.5)" },
      "-=0.2"
    );

    // Show scroll hint
    tl.to(scrollHintRef.current, {
      opacity: 1,
      duration: 1,
    }, "+=0.5");

  }, { scope: containerRef });

  const handleSkip = () => {
    if (tlRef.current) {
      const stageBTime = tlRef.current.labels["stageB"];
      if (stageBTime !== undefined && tlRef.current.time() < stageBTime) {
        // Fast-forward to the transition start
        tlRef.current.seek("stageB").play();
      } else {
        // Skip to end if clicked again during transition
        tlRef.current.progress(1);
      }
    }
  };

  return (
    <div 
      ref={containerRef} 
      onClick={handleSkip}
      className="relative w-full h-full bg-theme-dark overflow-hidden flex items-center justify-center cursor-pointer select-none"
    >
      {/* Liquid Morph SVG Filter */}
      <svg className="hidden absolute">
        <defs>
          <filter id="liquid-morph" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" result="noise" />
            <feDisplacementMap ref={filterRef} in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* Stage A/B Text */}
      <div className="absolute z-20 flex items-center justify-center w-full h-full pointer-events-none" style={{ filter: "url(#liquid-morph)" }}>
        <h1 ref={text18Ref} className="absolute text-[25vw] font-serif font-bold text-theme-light leading-none mix-blend-screen">18</h1>
        <h1 ref={text19Ref} className="absolute text-[25vw] font-serif font-bold text-theme-light leading-none opacity-0 mix-blend-screen">19</h1>
      </div>

      {/* Ambient dark particles */}
      <div ref={particlesRef} className="absolute inset-0 z-10 pointer-events-none mix-blend-screen">
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
          <Sparkles count={60} scale={20} size={1.5} speed={0.3} opacity={0.2} color="#ffffff" />
        </Canvas>
      </div>

      {/* Stage B/C 3D Background */}
      <div ref={bg3dRef} className="absolute inset-0 z-0 opacity-0 pointer-events-none bg-gradient-to-b from-celebration-100 to-celebration-300">
        <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
          <ambientLight intensity={1.2} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
          <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#f43f5e" />
          <Balloons />
          <EffectComposer>
            <Bloom luminanceThreshold={0.6} luminanceSmoothing={0.9} height={300} intensity={1.5} />
          </EffectComposer>
        </Canvas>
      </div>

      {/* Stage C Text & Hint */}
      <div className="absolute z-30 flex flex-col items-center justify-center w-full h-full pointer-events-none">
        <div ref={stageCtextRef} className="flex flex-col items-center opacity-0 drop-shadow-2xl px-4 text-center">
          <p className="font-cursive text-2xl md:text-3xl lg:text-4xl text-royal-maroon mb-1 -ml-4 -rotate-2">
            wishing you a very
          </p>
          <h2 className="text-6xl md:text-8xl lg:text-9xl font-serif font-bold text-royal-maroon">
            Happy Birthday<br/>NEEL
          </h2>
        </div>
        
        <div ref={scrollHintRef} className="absolute bottom-12 opacity-0 flex flex-col items-center text-royal-maroon">
          <span className="text-xs tracking-[0.3em] uppercase mb-4 font-sans font-semibold">Scroll</span>
          <div className="w-[1px] h-16 bg-royal-maroon opacity-50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-royal-maroon animate-[scroll-indicator_1.5s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>
    </div>
  );
}
