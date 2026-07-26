"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

function Building({ hvacMode, chillerLoad }: { hvacMode: string, chillerLoad: number }) {
  const ref = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05 - 1.5;
      ref.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.5;
    }
  });

  const glowColor = useMemo(() => {
    if (hvacMode === "cooling") return new THREE.Color(0x00d2ff);
    if (hvacMode === "heating") return new THREE.Color(0xff3366);
    return new THREE.Color(0x222222);
  }, [hvacMode]);

  const glassMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.95,
      opacity: 1,
      metalness: 0.2,
      roughness: 0.05,
      ior: 1.5,
      thickness: 0.5,
      transparent: true,
    });
  }, []);

  const intensity = useMemo(() => {
    // Normalize chiller load (e.g., 0 to 30 kW) to an intensity scale (0.1 to 4.0)
    if (hvacMode === "off") return 0.1;
    return Math.min(Math.max(chillerLoad / 8, 0.5), 4.0);
  }, [chillerLoad, hvacMode]);

  const coreMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0x111111,
      emissive: glowColor,
      emissiveIntensity: intensity,
      roughness: 0.4,
    });
  }, [glowColor, intensity]);

  return (
    <group ref={ref}>
      {/* Base Foundation */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[4, 0.4, 4]} />
        <meshStandardMaterial color="#0a0a0c" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Inner Glowing Core */}
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 4, 16]} />
        <primitive object={coreMaterial} />
      </mesh>

      {/* Floors */}
      {[1, 2, 3, 4].map((floor) => (
        <group key={floor} position={[0, floor, 0]}>
          <mesh>
            <boxGeometry args={[3.1, 0.05, 3.1]} />
            <meshStandardMaterial color="#1a1a2e" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      ))}
      
      {/* Outer Glass Shell */}
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[3.2, 4.2, 3.2]} />
        <primitive object={glassMaterial} />
      </mesh>
      
      {/* Top HVAC Unit */}
      <mesh position={[0, 4.8, 0]}>
        <boxGeometry args={[1.5, 0.5, 1.5]} />
        <meshStandardMaterial color="#222" metalness={0.8} roughness={0.4} />
      </mesh>
      
      {/* Tech Ring */}
      <mesh ref={ringRef} position={[0, 2.5, 0]} rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[2.8, 0.02, 16, 100]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.3 * intensity} />
      </mesh>
    </group>
  );
}

export default function BuildingModel({ telemetry }: { telemetry: any }) {
  const mode = telemetry?.hvac_mode || "off";
  const chillerLoad = telemetry?.chiller_load_kw || 0;

  return (
    <div className="w-full h-full min-h-[400px]">
      <Canvas camera={{ position: [6, 3, 6], fov: 45 }}>
        <color attach="background" args={["transparent"]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Environment preset="night" />
        <Building hvacMode={mode} chillerLoad={chillerLoad} />
        <ContactShadows resolution={1024} scale={10} blur={2} opacity={0.4} far={10} position={[0, -1.5, 0]} />
        <OrbitControls autoRotate autoRotateSpeed={1} enablePan={false} maxPolarAngle={Math.PI / 1.9} minPolarAngle={Math.PI / 4} />
      </Canvas>
    </div>
  );
}
