"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

const MODEL_URL = "/modelo/source/dead-monkey-walk.glb";

function Monkey({ onFinish }: { onFinish: () => void }) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(MODEL_URL);
  const { actions, names } = useAnimations(animations, group);

  useEffect(() => {
    if (names.length > 0 && actions[names[0]]) {
      const action = actions[names[0]]!;
      action.reset().fadeIn(0.2).play();
      action.setLoop(THREE.LoopRepeat, Infinity);
    }
    return () => {
      if (names[0] && actions[names[0]]) actions[names[0]]?.fadeOut(0.2);
    };
  }, [actions, names]);

  useFrame((_state, delta) => {
    if (!group.current) return;
    group.current.position.x -= delta * 4.2;
    if (group.current.position.x < -14) {
      onFinish();
    }
  });

  return (
    <group
      ref={group}
      position={[14, -3.2, 0]}
      rotation={[0, Math.PI * 1.5, 0]}
      scale={0.25}
    >
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload(MODEL_URL);

export default function MonkeyWalker() {
  const [show, setShow] = useState(false);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem("monkey_walked")) return;
    } catch {
      return;
    }
    setShow(true);
  }, []);

  const finish = () => {
    try {
      sessionStorage.setItem("monkey_walked", "1");
    } catch {}
    setShow(false);
  };

  if (!show || errored) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
        onError={() => setErrored(true)}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[5, 6, 5]} intensity={1.1} color="#ffffff" />
        <pointLight position={[-4, 2, 3]} color="#FF8800" intensity={3} distance={12} />
        <pointLight position={[4, 1, 2]} color="#FF2A2A" intensity={2} distance={10} />
        <Suspense fallback={null}>
          <Monkey onFinish={finish} />
        </Suspense>
      </Canvas>
    </div>
  );
}
