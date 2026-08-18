"use client";

import { motion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles, Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useRef } from "react";

// 3D Decor Elements
function GoldenElements() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Floating Torus Knots and Spheres */}
      <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
        <mesh position={[-6, 4, -4]} scale={0.5}>
          <torusKnotGeometry args={[1, 0.3, 100, 16]} />
          <meshStandardMaterial color="#fff" metalness={1} roughness={0.1} />
        </mesh>
      </Float>
      
      <Float speed={1.5} rotationIntensity={1} floatIntensity={1.5}>
        <mesh position={[4, -1, -3]} scale={0.7}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#ffffff" metalness={0.9} roughness={0.2} />
        </mesh>
      </Float>

      <Float speed={2.5} rotationIntensity={0.5} floatIntensity={2}>
        <mesh position={[-2, -3, -1]} scale={0.4}>
          <sphereGeometry args={[1, 32, 32]} />
          <MeshDistortMaterial color="#ffffff" distort={0.4} speed={2} metalness={0.8} roughness={0.1} />
        </mesh>
      </Float>

      <Float speed={1.2} rotationIntensity={2} floatIntensity={1.5}>
        <mesh position={[3, 3, -4]} scale={0.6}>
          <torusGeometry args={[1, 0.2, 16, 100]} />
          <meshStandardMaterial color="#fff" metalness={1} roughness={0.2} />
        </mesh>
      </Float>
    </group>
  );
}

export default function FinalWish() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-[#d4af37] via-[#fcd34d] to-[#f59e0b] flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* 3D Golden Background Elements */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={1} />
          <directionalLight position={[5, 5, 5]} intensity={2} color="#ffffff" />
          <directionalLight position={[-5, -5, -5]} intensity={1} color="#fcd34d" />
          <GoldenElements />
          <Sparkles count={200} scale={15} size={3} speed={0.4} opacity={0.6} color="#ffffff" />
        </Canvas>
      </div>

      {/* Main Content */}
      <div className="z-10 flex flex-col items-center justify-center text-center px-4 md:px-12 w-full max-w-5xl">
        
        {/* Main Header */}
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          viewport={{ once: true }}
          className="font-serif text-5xl md:text-7xl lg:text-[5.5rem] text-[#2A0001] font-bold tracking-tight mb-4 drop-shadow-[0_2px_4px_rgba(255,255,255,0.3)] leading-tight"
        >
          At last I just wish you the very best!
        </motion.h1>
        
        {/* Signature Element */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          viewport={{ once: true }}
          className="w-full flex justify-end mt-2 md:mt-4 pr-4 md:pr-16"
        >
          <span className="font-cursive text-3xl md:text-5xl lg:text-6xl text-[#4a0404] rotate-[-5deg] drop-shadow-sm">
            - Sumit Singh
          </span>
        </motion.div>

        {/* Replay Button */}
        <motion.button 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={scrollToTop}
          className="mt-20 px-8 py-4 rounded-full bg-[#2A0001] text-[#fcd34d] uppercase tracking-widest text-sm font-bold shadow-[0_4px_15px_rgba(42,0,1,0.4)] hover:bg-white hover:text-[#d4af37] transition-all duration-300"
        >
          Relive the Journey
        </motion.button>
      </div>
      
    </div>
  );
}
