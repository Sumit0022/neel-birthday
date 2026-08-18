"use client";

import { useState, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Sparkles, Float } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ... existing geometry and decorators ...
import { Fireworks } from "@fireworks-js/react";

// -- Geometry Constants --
const CAKE_RADIUS = 2.2;
const SPONGE_H = 0.55;
const FILLING_H = 0.15;
const TOTAL_H = SPONGE_H * 2 + FILLING_H;
// Slice faces the camera (Math.PI * 1.5 is pointing at +Z in our setup)
const START_ANGLE = Math.PI * 1.35;
const END_ANGLE = Math.PI * 1.65;
const SLICE_ANGLE = END_ANGLE - START_ANGLE;

// -- Materials --
const COLOR_SPONGE = "#1f0904"; // Dark chocolate sponge
const COLOR_FILLING = "#3a1c11"; // Mocha cream filling
const COLOR_GANACHE = "#110502"; // Glossy dark chocolate top
const COLOR_STAND = "#FDE68A"; // Bright Gold

const createWedge = (startA: number, endA: number, radius: number) => {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.absarc(0, 0, radius, startA, endA, false);
  shape.lineTo(0, 0);
  return shape;
};

const getExtrude = (depth: number) => ({
  depth,
  bevelEnabled: false, 
  curveSegments: 64,
});

const getTopExtrude = (depth: number) => ({
  depth,
  bevelEnabled: true,
  bevelThickness: 0.1,
  bevelSize: 0.1,
  bevelSegments: 4,
  curveSegments: 64,
});

function CakeDecorations({ isSlice }: { isSlice: boolean }) {
  const elements = [];
  
  // 1. Truffles around the edge
  const numTruffles = 12;
  for (let i = 0; i < numTruffles; i++) {
    const angle = (i / numTruffles) * Math.PI * 2;
    const inSlice = angle >= START_ANGLE + 0.1 && angle <= END_ANGLE - 0.1;
    
    if (isSlice ? inSlice : !inSlice) {
      const r = CAKE_RADIUS - 0.35;
      elements.push(
        <group key={`truffle-${i}`} position={[Math.cos(angle) * r, Math.sin(angle) * r, TOTAL_H + 0.23]}>
          <mesh castShadow>
            <sphereGeometry args={[0.22, 32, 32]} />
            <meshStandardMaterial color="#1a0b06" roughness={0.8} />
          </mesh>
          <mesh castShadow position={[0, 0, 0.18]} rotation={[Math.random(), Math.random(), 0]}>
            <dodecahedronGeometry args={[0.08]} />
            <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.1} />
          </mesh>
        </group>
      );
    }
  }

  // 2. Golden Macarons (Inner Circle)
  const numMacarons = 4;
  for (let i = 0; i < numMacarons; i++) {
    const angle = (i / numMacarons) * Math.PI * 2 + 0.5;
    const inSlice = angle >= START_ANGLE + 0.1 && angle <= END_ANGLE - 0.1;
    
    if (isSlice ? inSlice : !inSlice) {
      const r = CAKE_RADIUS - 1.2; // closer to center
      elements.push(
        <group key={`macaron-${i}`} position={[Math.cos(angle) * r, Math.sin(angle) * r, TOTAL_H + 0.25]} rotation={[Math.PI/2, Math.random() * Math.PI, 0]}>
          {/* Bottom shell */}
          <mesh castShadow position={[0, -0.08, 0]}>
            <cylinderGeometry args={[0.25, 0.25, 0.1, 32]} />
            <meshStandardMaterial color="#d4af37" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Filling */}
          <mesh castShadow position={[0, 0, 0]}>
            <cylinderGeometry args={[0.23, 0.23, 0.1, 32]} />
            <meshStandardMaterial color="#1a0b06" roughness={0.9} />
          </mesh>
          {/* Top shell */}
          <mesh castShadow position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.25, 0.25, 0.1, 32]} />
            <meshStandardMaterial color="#d4af37" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      );
    }
  }

  // 3. Scattered Edible Gold Leaf
  const numLeaves = 25;
  for (let i = 0; i < numLeaves; i++) {
    // Deterministic random for consistent rendering
    const pseudoRandom = (Math.sin(i * 123.456) + 1) / 2;
    const angle = pseudoRandom * Math.PI * 2;
    const r = (Math.cos(i * 987.654) * 0.4 + 0.5) * (CAKE_RADIUS - 0.5);
    
    const inSlice = angle >= START_ANGLE && angle <= END_ANGLE;
    if (isSlice ? inSlice : !inSlice) {
      elements.push(
        <mesh 
          key={`leaf-${i}`} 
          position={[Math.cos(angle) * r, Math.sin(angle) * r, TOTAL_H + 0.16]} 
          rotation={[pseudoRandom * Math.PI, pseudoRandom * 2, pseudoRandom * 3]}
          castShadow
        >
          <tetrahedronGeometry args={[0.07]} />
          <meshStandardMaterial color="#fcd34d" metalness={1} roughness={0.1} />
        </mesh>
      );
    }
  }

  return <>{elements}</>;
}

function CakeSection({ startA, endA, isSlice, cutStep }: { startA: number, endA: number, isSlice?: boolean, cutStep: number }) {
  const groupRef = useRef<THREE.Group>(null);
  
  const mainWedge = createWedge(startA, endA, CAKE_RADIUS);
  const topWedge = createWedge(startA, endA, CAKE_RADIUS + 0.05); // Frosting drips slightly over

  // Animation for slice
  useFrame((state, delta) => {
    if (isSlice && groupRef.current) {
      if (cutStep >= 2) {
        // Slide slice smoothly forward on the stand without falling off or dipping down
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, -0.8, delta * 4);
        groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, 0, delta * 4);
        groupRef.current.rotation.x = -Math.PI / 2; // Keep flat
      } else if (cutStep === 1) {
        // Slightly separate to show cut mark
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, -0.1, delta * 8);
        groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, 0, delta * 8);
        groupRef.current.rotation.x = -Math.PI / 2;
      } else {
        // Reset to original
        groupRef.current.position.set(0,0,0);
        groupRef.current.rotation.set(-Math.PI / 2, 0, 0);
      }
    }
  });

  return (
    <group ref={groupRef} rotation={[-Math.PI / 2, 0, 0]}>
      {/* 1. Base Sponge (Dark Truffle) */}
      <mesh position={[0, 0, 0]}>
        <extrudeGeometry args={[mainWedge, getExtrude(SPONGE_H)]} />
        {/* Rough texture for sponge */}
        <meshStandardMaterial color={COLOR_SPONGE} roughness={1} metalness={0.1} />
      </mesh>
      
      {/* 2. Mocha Cream Filling */}
      <mesh position={[0, 0, SPONGE_H]}>
        <extrudeGeometry args={[mainWedge, getExtrude(FILLING_H)]} />
        <meshStandardMaterial color={COLOR_FILLING} roughness={0.7} />
      </mesh>
      
      {/* 3. Top Sponge */}
      <mesh position={[0, 0, SPONGE_H + FILLING_H]}>
        <extrudeGeometry args={[mainWedge, getExtrude(SPONGE_H)]} />
        <meshStandardMaterial color={COLOR_SPONGE} roughness={1} metalness={0.1} />
      </mesh>

      {/* 4. Top Frosting (Dark Chocolate Ganache) */}
      <mesh position={[0, 0, TOTAL_H]}>
        <extrudeGeometry args={[topWedge, getTopExtrude(0.15)]} />
        <meshStandardMaterial color={COLOR_GANACHE} roughness={0.2} metalness={0.3} />
      </mesh>
      
      {/* 5. 3D Creative Decorations (Truffles, Macarons, Gold Leaf) */}
      <CakeDecorations isSlice={!!isSlice} />
      
      {/* Candles */}
      {isSlice ? (
        <group position={[0, -CAKE_RADIUS * 0.6, TOTAL_H + 0.15]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.8]} />
            <meshStandardMaterial color="#fcd34d" metalness={0.6} roughness={0.2} />
          </mesh>
          <pointLight color="#ffaa00" intensity={1} distance={3} position={[0, 0.9, 0]} />
          <Sparkles count={12} scale={0.5} size={3} speed={0.8} opacity={1} color="#ffdd00" position={[0, 0.9, 0]} />
        </group>
      ) : (
        <>
          <group position={[-CAKE_RADIUS * 0.5, CAKE_RADIUS * 0.3, TOTAL_H + 0.15]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh position={[0, 0.4, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.8]} />
              <meshStandardMaterial color="#fcd34d" metalness={0.6} />
            </mesh>
            <pointLight color="#ffaa00" intensity={1} distance={3} position={[0, 0.9, 0]} />
            <Sparkles count={12} scale={0.5} size={3} speed={0.8} opacity={1} color="#ffdd00" position={[0, 0.9, 0]} />
          </group>
          <group position={[CAKE_RADIUS * 0.6, CAKE_RADIUS * 0.2, TOTAL_H + 0.15]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh position={[0, 0.4, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.8]} />
              <meshStandardMaterial color="#fcd34d" metalness={0.6} />
            </mesh>
            <pointLight color="#ffaa00" intensity={1} distance={3} position={[0, 0.9, 0]} />
            <Sparkles count={12} scale={0.5} size={3} speed={0.8} opacity={1} color="#ffdd00" position={[0, 0.9, 0]} />
          </group>
        </>
      )}
    </group>
  );
}

function MagicRing() {
  const ringRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.005; // Slow rotation
      ringRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.15 - 0.2; // Gentle floating
      ringRef.current.rotation.x = Math.PI / 2 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05; // Slight wobble
    }
  });

  return (
    <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[CAKE_RADIUS + 0.8, 0.015, 16, 100]} />
      <meshStandardMaterial color="#fcd34d" metalness={1} roughness={0} emissive="#fcd34d" emissiveIntensity={0.8} />
    </mesh>
  );
}

function CakeScene({ cutStep, onCut }: { cutStep: number; onCut: () => void }) {
  return (
    <group position={[0, -1, 0]} onClick={onCut}>
      {/* Live Magical Ring */}
      <MagicRing />
      
      {/* Cake Stand */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[CAKE_RADIUS + 0.4, CAKE_RADIUS + 0.7, 0.4, 64]} />
        <meshStandardMaterial color={COLOR_STAND} metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Full Cake if uncut, otherwise Main + Slice */}
      {cutStep === 0 ? (
        <CakeSection startA={0} endA={Math.PI * 2} cutStep={cutStep} />
      ) : (
        <>
          <CakeSection startA={END_ANGLE} endA={Math.PI * 2 + START_ANGLE} cutStep={cutStep} />
          <CakeSection startA={START_ANGLE} endA={END_ANGLE} isSlice cutStep={cutStep} />
        </>
      )}
    </group>
  );
}

// Dark Sky Overlay with CSS Stars and Fireworks-js
const DarkSkyOverlay = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1.5 } }}
      className="absolute inset-0 z-50 bg-[#050515] pointer-events-none overflow-hidden"
    >
      <Fireworks
        options={{
          hue: { min: 0, max: 360 },
          delay: { min: 15, max: 30 },
          rocketsPoint: { min: 50, max: 50 },
          opacity: 0.5,
          acceleration: 1.05,
          friction: 0.97,
          gravity: 1.5,
          particles: 150,
          explosion: 6,
          intensity: 40,
          traceLength: 3,
          traceSpeed: 10,
        }}
        style={{
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          position: 'absolute'
        }}
      />
      {Array.from({ length: 60 }).map((_, i) => (
        <div 
        key={i}
        className="absolute w-[2px] h-[2px] bg-white rounded-full opacity-70"
        style={{
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          animation: `twinkle ${Math.random() * 3 + 1}s infinite alternate`
        }}
      />
    ))}
    <style dangerouslySetInnerHTML={{__html: `
      @keyframes twinkle { 0% { opacity: 0.1; transform: scale(0.5); } 100% { opacity: 1; transform: scale(1.5); } }
    `}} />
  </motion.div>
  );
};

export default function CakeCutting() {
  const [cutStep, setCutStep] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  const isInView = useInView(containerRef, { once: true, amount: 0.5 });

  useEffect(() => {
    if (isInView) {
      // Show the 'Click to cut the cake' hint shortly after the section snaps into view
      const timer = setTimeout(() => {
        setIntroDone(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isInView]);

  useEffect(() => {
    setIsMobile(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  useEffect(() => {
    setIsMobile(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  // Custom Knife Cursor Logic
  useEffect(() => {
    if (isMobile || !containerRef.current || !cursorRef.current) return;

    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    let frame: number;

    const onMouseMove = (e: MouseEvent) => {
      const rect = containerRef.current!.getBoundingClientRect();
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;
      
      const deltaX = targetX - currentX;
      gsap.to(cursorRef.current, {
        rotate: deltaX > 0 ? 15 : deltaX < 0 ? -15 : 0,
        duration: 0.3
      });
    };

    const animate = () => {
      currentX += (targetX - currentX) * 0.15;
      currentY += (targetY - currentY) * 0.15;
      
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${currentX}px, ${currentY}px)`;
      }
      frame = requestAnimationFrame(animate);
    };

    const container = containerRef.current;
    container.addEventListener("mousemove", onMouseMove);
    frame = requestAnimationFrame(animate);

    return () => {
      container.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(frame);
    };
  }, [isMobile]);

  const handleCakeClick = () => {
    if (cutStep === 0) {
      setCutStep(1);
    } else if (cutStep === 1) {
      setCutStep(2);
      
      // Play Fireworks Audio
      const audio = new Audio("https://cdn.pixabay.com/download/audio/2022/01/18/audio_03d291880d.mp3?filename=firework-show-short-64657.mp3");
      audio.volume = 0.6;
      audio.play().catch(e => console.log("Audio autoplay blocked", e));

      // Transition to final scroll hint after 4.5s
      setTimeout(() => {
        setCutStep(3);
      }, 4500);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`w-full h-screen relative overflow-hidden bg-gradient-to-b from-theme-light via-[#fef3c7] to-[#d4af37] transition-colors duration-1000 ${cutStep === 2 ? '!from-[#050515] !via-[#050515] !to-[#100010]' : ''} ${!isMobile ? 'cursor-none' : ''}`}
    >
      {/* Dark Sky Fireworks Background Overlay */}
      <AnimatePresence>
        {cutStep === 2 && <DarkSkyOverlay />}
      </AnimatePresence>

      {/* 3D Scene */}
      <motion.div 
        initial={{ y: "20vh", scale: 0.8, opacity: 0 }}
        whileInView={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        viewport={{ once: false, amount: 0.3 }}
        className="absolute inset-0 z-20 pointer-events-none"
      >
        <Canvas camera={{ position: [0, 6, 12], fov: 40 }} className="pointer-events-auto">
          <ambientLight intensity={0.6} />
          {/* Main front light */}
          <spotLight position={[5, 10, 10]} intensity={1.5} angle={0.4} penumbra={1} castShadow color="#FFFDF8" />
          {/* Warm fill light */}
          <spotLight position={[-10, 8, -5]} intensity={1} angle={0.5} penumbra={0.5} color="#fef3c7" />
          <Environment preset="city" />
          
          <Float speed={1.5} rotationIntensity={0.15} floatIntensity={0.2}>
            <group position={[0, 1.2, 0]}>
              <CakeScene cutStep={cutStep} onCut={handleCakeClick} />
            </group>
          </Float>
          
          {/* Ambient Sparkles */}
          <Sparkles count={50} scale={10} size={2} speed={0.3} opacity={0.5} color="#fef3c7" />
        </Canvas>
      </motion.div>

      {/* Hints & Overlays */}
      <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-end items-center pb-10">
        <AnimatePresence mode="wait">
          {cutStep === 0 && introDone && (
            <motion.p 
              key="step0"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-[#5B0404] font-sans tracking-widest uppercase text-base font-bold drop-shadow-[0_0_10px_rgba(255,255,255,1)]"
            >
              Click to cut the cake
            </motion.p>
          )}
          {cutStep === 1 && (
            <motion.p 
              key="step1"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-[#5B0404] font-sans tracking-widest uppercase text-base font-bold drop-shadow-[0_0_10px_rgba(255,255,255,1)]"
            >
              One more cut...
            </motion.p>
          )}
          {cutStep === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-2"
            >
              <span className="text-[#5B0404] font-sans tracking-widest uppercase text-base font-bold drop-shadow-[0_0_10px_rgba(255,255,255,1)]">Keep scrolling</span>
              <span className="text-[#5B0404] animate-bounce text-2xl drop-shadow-[0_0_10px_rgba(255,255,255,1)]">↓</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Custom Knife Cursor (Desktop Only) */}
      {!isMobile && (
        <div 
          ref={cursorRef}
          className="absolute top-0 left-0 pointer-events-none z-50 text-4xl drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
          style={{ willChange: "transform", marginTop: "-20px", marginLeft: "-20px" }}
        >
          🔪
        </div>
      )}
    </div>
  );
}
