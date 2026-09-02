"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Particles() {
  const mesh = useRef<THREE.Points>(null);
  const mouse = useRef({ x: 0, y: 0 });

  const count = 800;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      arr[i] = (Math.random() - 0.5) * 20;
    }
    return arr;
  }, []);

  const sizes = useMemo(() => {
    const arr = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      arr[i] = Math.random() * 2;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.rotation.y = state.clock.elapsedTime * 0.02;
    mesh.current.rotation.x = state.clock.elapsedTime * 0.01;
    
    const material = mesh.current.material as THREE.ShaderMaterial;
    if (material.uniforms) {
      material.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color("#6366f1") },
      },
      vertexShader: `
        attribute float size;
        uniform float uTime;
        varying float vAlpha;
        void main() {
          vec3 pos = position;
          pos.y += sin(uTime * 0.5 + position.x) * 0.2;
          pos.x += cos(uTime * 0.3 + position.y) * 0.1;
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (200.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
          vAlpha = 0.6 + 0.4 * sin(uTime + position.x);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying float vAlpha;
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float glow = 1.0 - (dist * 2.0);
          glow = pow(glow, 1.5);
          gl_FragColor = vec4(uColor, glow * vAlpha * 0.6);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  return (
    <points ref={mesh} material={shaderMaterial}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
    </points>
  );
}

function FloatingShapes() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = state.clock.elapsedTime * 0.05;
    group.current.children.forEach((child, i) => {
      child.position.y = Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.3;
      child.rotation.x = state.clock.elapsedTime * 0.1 + i;
      child.rotation.z = state.clock.elapsedTime * 0.05 + i;
    });
  });

  return (
    <group ref={group}>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          position={[
            Math.cos((i * Math.PI * 2) / 3) * 3,
            0,
            Math.sin((i * Math.PI * 2) / 3) * 3,
          ]}
        >
          <icosahedronGeometry args={[0.4, 0]} />
          <meshStandardMaterial
            color={i === 0 ? "#6366f1" : i === 1 ? "#8b5cf6" : "#ec4899"}
            roughness={0.2}
            metalness={0.8}
            transparent
            opacity={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function ThreeBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Particles />
        <FloatingShapes />
      </Canvas>
    </div>
  );
}