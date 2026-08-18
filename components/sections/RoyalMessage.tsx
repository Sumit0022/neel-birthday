"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles, Environment } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/ScrollTrigger";
import * as THREE from "three";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// -----------------------------------------------------
// 1. Procedural 3D Balloon
// -----------------------------------------------------
function Balloon({ 
  color = "#4a0404", 
  position = [0, 0, 0], 
  scale = 1, 
  speed = 1, 
  offset = 0 
}: { 
  color?: string, position?: [number, number, number], scale?: number, speed?: number, offset?: number 
}) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      // Gentle floating motion
      groupRef.current.position.y += Math.sin(state.clock.elapsedTime * speed + offset) * 0.003;
      // Slight swaying
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * (speed * 0.5) + offset) * 0.05;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * (speed * 0.3) + offset) * 0.05;
    }
  });

  const balloonMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.1,
    metalness: 0.3,
    envMapIntensity: 1.5,
    clearcoat: 0.8,
    clearcoatRoughness: 0.1
  }), [color]);

  return (
    <group ref={groupRef} position={new THREE.Vector3(...position)} scale={scale}>
      {/* Balloon Body - Elongated sphere */}
      <mesh material={balloonMaterial} scale={[1, 1.25, 1]}>
        <sphereGeometry args={[1, 32, 32]} />
      </mesh>
      
      {/* Balloon Knot */}
      <mesh material={balloonMaterial} position={[0, -1.2, 0]}>
        <coneGeometry args={[0.15, 0.25, 16]} />
      </mesh>
      
      {/* String */}
      <mesh position={[0, -2.7, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 3, 8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

// -----------------------------------------------------
// 2. 3D Scene Environment
// -----------------------------------------------------
function RoyalScene() {
  return (
    <>
      <ambientLight intensity={1.5} />
      <Environment preset="city" />
      
      <directionalLight position={[5, 10, 5]} color="#ffffff" intensity={2} />
      <directionalLight position={[-5, 10, -5]} color="#ff7b00" intensity={1} />

      {/* Scattered 3D Balloons - Pushed to the sides */}
      {/* Left Flank */}
      <Balloon color="#4a0404" position={[-7, -1, -3]} scale={1.2} speed={1.2} offset={0} />
      <Balloon color="#2A0001" position={[-8, 3, -5]} scale={1.5} speed={0.9} offset={5} />
      <Balloon color="#800000" position={[-6, -4, -7]} scale={1} speed={1} offset={4} />
      <Balloon color="#ffffff" position={[-9, 1, -8]} scale={1.8} speed={0.7} offset={6} />

      {/* Right Flank */}
      <Balloon color="#800000" position={[7, 2, -4]} scale={0.9} speed={0.8} offset={2} />
      <Balloon color="#ffffff" position={[6, -2, -2]} scale={0.8} speed={1.5} offset={1} />
      <Balloon color="#4a0404" position={[8, -1, -6]} scale={1.3} speed={1.1} offset={3} />
      <Balloon color="#2A0001" position={[9, 4, -7]} scale={1.1} speed={1.3} offset={2} />

      {/* Crisp White/Silver Parallax Particles to pop on Gold */}
      <Sparkles count={80} scale={15} size={3} speed={0.2} opacity={0.5} color="#ffffff" position={[0, 0, -2]} />
      <Sparkles count={120} scale={20} size={2} speed={0.1} opacity={0.3} color="#ffffff" position={[0, 0, -6]} />

      <EffectComposer>
        <Bloom luminanceThreshold={0.8} luminanceSmoothing={0.9} height={300} intensity={0.4} />
      </EffectComposer>
    </>
  );
}

// -----------------------------------------------------
// 3. UI Divider Accent
// -----------------------------------------------------
const SVGDivider = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center justify-center w-full my-8 ${className}`}>
    <div className="h-[1px] bg-gradient-to-r from-transparent via-[#4a0404]/50 to-transparent w-16 md:w-32"></div>
    <svg className="mx-3 w-4 h-4 text-[#4a0404]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" />
    </svg>
    <div className="h-[1px] bg-gradient-to-r from-transparent via-[#4a0404]/50 to-transparent w-16 md:w-32"></div>
  </div>
);

// -----------------------------------------------------
// 4. Main Component
// -----------------------------------------------------
export default function RoyalMessage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const bodyText = "You know, sometimes it’s surprising how quickly time passes. We don’t really talk as much anymore, but I still remember the bond we once shared and genuinely feel happy seeing how well you’re doing in life.\n\nGetting into Miranda House is a big achievement, and you truly deserve it. You’ve worked hard for it, and it shows. And seeing you happy and doing well in your personal life as well honestly makes me happy for you. You’re really lucky to have things falling into place so well, and I hope it continues this way for you.\n\nI just wish that you always stay this happy, keep growing, and achieve everything you want in life. You deserve all the good things coming your way.\n\nTake care, and once again, a very happy birthday! ✨";

  const textContainerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current || !textContainerRef.current) return;

    // Pin section and scroll text upwards
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "+=120%", // User scrolls for 1.2x screen height
      pin: true,
      scrub: 1, // Smooth scrub
      animation: gsap.fromTo(textContainerRef.current, 
        { y: "20vh" }, // Start slightly lower
        { y: "-40vh", ease: "none" } // Scroll up to reveal all text
      )
    });

  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="w-full h-screen relative bg-gradient-to-br from-[#fef3c7] via-[#fcd34d] to-[#d4af37] flex items-center justify-center overflow-hidden">
      
      {/* 3D Background Scene */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }} gl={{ antialias: true, alpha: true }} style={{ width: '100%', height: '100%' }}>
          <RoyalScene />
        </Canvas>
      </div>

      {/* Foreground Message Container (Moves up via GSAP scrub) */}
      <div 
        ref={textContainerRef}
        className="z-10 w-11/12 md:w-4/5 lg:w-3/4 max-w-[900px] mx-auto px-6 md:px-12 py-10 md:py-16 bg-white/70 backdrop-blur-md rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.15)] border border-white/50 flex flex-col items-center relative pointer-events-auto"
      >
        {/* Subtle Shimmering Texture Overlay */}
        <div 
          className="absolute inset-0 rounded-3xl opacity-20 mix-blend-overlay pointer-events-none animate-pulse duration-1000"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
        />
        
        <SVGDivider className="shrink-0 relative z-10 mb-6" />
        
        {/* Body Text */}
        <p className="text-[#4a0404] font-['Times_New_Roman',_Times,_serif] text-base md:text-lg lg:text-xl leading-[1.8] md:leading-[2] tracking-wide whitespace-pre-wrap text-left md:text-justify w-full min-h-[20rem] md:min-h-[16rem] relative z-10">
          {bodyText}
        </p>
        
        <SVGDivider className="shrink-0 relative z-10" />
      </div>

    </section>
  );
}
