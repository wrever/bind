"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState, useEffect } from "react";
import type { Group, Mesh } from "three";
import * as THREE from "three";

/** Bind-tuned voxel arc behind the centered hero (inspired by 21st Voxel Wall). */
export function HeroVoxelBackground() {
  const [mounted, setMounted] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  if (!mounted) {
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[var(--color-bg)]"
      />
    );
  }

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.2, 7.2], fov: 42, near: 0.1, far: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        style={{ width: "100%", height: "100%" }}
      >
        <color attach="background" args={["#0E100D"]} />
        <fog attach="fog" args={["#0E100D", 8, 18]} />
        <ambientLight intensity={0.35} />
        <directionalLight
          position={[2, 4, 3]}
          intensity={1.1}
          color="#F5F4F0"
        />
        <pointLight position={[0, -0.5, 2]} intensity={1.4} color="#F54307" />
        <VoxelArc reduceMotion={reduceMotion} />
      </Canvas>
      {/* Soft vignette so copy stays readable */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(14,16,13,0.55)_55%,rgba(14,16,13,0.92)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(to_top,var(--color-bg),transparent)]" />
    </div>
  );
}

function VoxelArc({ reduceMotion }: { reduceMotion: boolean }) {
  const group = useRef<Group>(null);
  const voxels = useMemo(() => buildArcVoxels(), []);

  useFrame((state) => {
    if (!group.current || reduceMotion) return;
    const t = state.clock.elapsedTime;
    group.current.rotation.y = Math.sin(t * 0.12) * 0.08;
    group.current.position.y = Math.sin(t * 0.35) * 0.06;
    const mx = state.pointer.x * 0.25;
    const my = state.pointer.y * 0.12;
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      -my * 0.15,
      0.04,
    );
    group.current.rotation.z = THREE.MathUtils.lerp(
      group.current.rotation.z,
      mx * 0.05,
      0.04,
    );
  });

  return (
    <group ref={group} position={[0, -0.8, 0]}>
      {voxels.map(({ key, ...v }) => (
        <Voxel key={key} {...v} reduceMotion={reduceMotion} />
      ))}
    </group>
  );
}

type VoxelDef = {
  key: string;
  position: [number, number, number];
  scale: number;
  accent: boolean;
  phase: number;
};

function Voxel({
  position,
  scale,
  accent,
  phase,
  reduceMotion,
}: VoxelDef & { reduceMotion: boolean }) {
  const mesh = useRef<Mesh>(null);
  useFrame((state) => {
    if (!mesh.current || reduceMotion) return;
    const t = state.clock.elapsedTime;
    mesh.current.position.y =
      position[1] + Math.sin(t * 0.9 + phase) * 0.04;
  });

  return (
    <mesh ref={mesh} position={position} scale={scale}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={accent ? "#F54307" : "#2A2926"}
        roughness={accent ? 0.45 : 0.85}
        metalness={accent ? 0.2 : 0.05}
        emissive={accent ? "#F54307" : "#000000"}
        emissiveIntensity={accent ? 0.25 : 0}
      />
    </mesh>
  );
}

function buildArcVoxels(): VoxelDef[] {
  const out: VoxelDef[] = [];
  const cols = 18;
  const rows = 5;
  for (let i = 0; i < cols; i++) {
    const u = i / (cols - 1);
    const angle = Math.PI * (0.15 + u * 0.7);
    const radius = 4.2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius - 3.2;
    for (let j = 0; j < rows; j++) {
      const y = j * 0.55 - 0.4 + Math.sin(u * Math.PI) * 0.35;
      const accent =
        (i + j) % 7 === 0 || (j === 2 && (i === 4 || i === 13));
      out.push({
        key: `${i}-${j}`,
        position: [x + (j % 2) * 0.05, y, z + j * 0.08],
        scale: 0.42 + (accent ? 0.06 : 0),
        accent,
        phase: i * 0.35 + j * 0.5,
      });
    }
  }
  return out;
}
