import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  Canvas,
  useFrame,
  useThree,
  useLoader,
  type CanvasProps,
} from "@react-three/fiber";
import { Mesh } from "three";
import { OrbitControls as ThreeOrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { number, color, object, boolean, parseJSON } from "./validation.js";
export { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
export interface SceneOptions {
  color: string;
  shape: "sphere" | "box" | "torus";
  speed: number;
  roughness: number;
  metalness: number;
  animate: boolean;
}
export const defaults: SceneOptions = {
  color: "#b7dba7",
  shape: "torus",
  speed: 0.25,
  roughness: 0.3,
  metalness: 0.65,
  animate: true,
};
export function validate(value: unknown): SceneOptions {
  const v = {
    ...defaults,
    ...object(value, [
      "color",
      "shape",
      "speed",
      "roughness",
      "metalness",
      "animate",
    ]),
  };
  if (!["sphere", "box", "torus"].includes(v.shape as string))
    throw new Error("Invalid geometry");
  return {
    color: color(v.color),
    shape: v.shape as SceneOptions["shape"],
    speed: number(v.speed, "speed", 0, 2),
    roughness: number(v.roughness, "roughness", 0, 1),
    metalness: number(v.metalness, "metalness", 0, 1),
    animate: boolean(v.animate),
  };
}
export function serialize(options: SceneOptions) {
  return JSON.stringify(validate(options));
}
export function deserialize(text: string) {
  return validate(parseJSON(text));
}
function useMotion(requested: boolean) {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () =>
      setEnabled(requested && !query.matches && !document.hidden);
    update();
    query.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      query.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, [requested]);
  return enabled;
}
export function OrbitController() {
  const { camera, gl, invalidate } = useThree();
  useEffect(() => {
    const controls = new ThreeOrbitControls(camera, gl.domElement);
    controls.enableDamping = false;
    controls.enablePan = false;
    controls.minDistance = 2;
    controls.maxDistance = 10;
    const changed = () => invalidate();
    controls.addEventListener("change", changed);
    return () => {
      controls.removeEventListener("change", changed);
      controls.dispose();
    };
  }, [camera, gl, invalidate]);
  return null;
}
export function SceneObject({
  options = {},
  onSelect,
}: {
  options?: Partial<SceneOptions>;
  onSelect?: () => void;
}) {
  const o = validate(options),
    ref = useRef<Mesh>(null),
    motion = useMotion(o.animate);
  const [hover, setHover] = useState(false);
  useFrame((_, dt) => {
    if (motion && ref.current) {
      ref.current.rotation.y += Math.min(dt, 0.05) * o.speed;
      ref.current.rotation.x += Math.min(dt, 0.05) * o.speed * 0.3;
    }
  });
  return (
    <mesh
      ref={ref}
      scale={hover ? 1.08 : 1}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
      onClick={onSelect}
    >
      {o.shape === "sphere" ? (
        <sphereGeometry args={[1, 48, 32]} />
      ) : o.shape === "box" ? (
        <boxGeometry args={[1.6, 1.6, 1.6]} />
      ) : (
        <torusGeometry args={[0.9, 0.33, 32, 64]} />
      )}
      <meshStandardMaterial
        color={o.color}
        roughness={o.roughness}
        metalness={o.metalness}
      />
    </mesh>
  );
}
export function Model({ url }: { url: string }) {
  const gltf = useLoader(GLTFLoader, url);
  const scene = useMemo(() => gltf.scene.clone(true), [gltf]);
  return <primitive object={scene} dispose={null} />;
}
export function SceneCanvas({
  children,
  animate = true,
  orbit = true,
  ...props
}: CanvasProps & { animate?: boolean; orbit?: boolean }) {
  const active = useMotion(animate);
  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 45 }}
      dpr={[1, 2]}
      fallback={<div role="status">3D is unavailable on this device.</div>}
      {...props}
      frameloop={active ? "always" : "demand"}
    >
      <ambientLight intensity={1.2} />
      <directionalLight position={[3, 4, 5]} intensity={4} />
      <directionalLight
        position={[-4, -2, 1]}
        intensity={1.5}
        color="#e8ca84"
      />
      <Suspense fallback={null}>{children}</Suspense>
      {orbit && <OrbitController />}
    </Canvas>
  );
}
