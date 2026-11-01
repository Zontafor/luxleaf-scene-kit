import React, { useMemo, useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { AnimationMixer, Object3D, type AnimationClip } from "three";
import { selectClip } from "./assets.js";
export type Quality = "low" | "balanced" | "high";
export const qualityProfiles = Object.freeze({
  low: { dpr: 1, segments: 16 },
  balanced: { dpr: 1.5, segments: 32 },
  high: { dpr: 2, segments: 64 },
});
/** Hysteresis prevents oscillation after isolated slow frames. */
export class QualityController {
  private slow = 0;
  private fast = 0;
  value = 1.5;
  sample(seconds: number) {
    if (!Number.isFinite(seconds) || seconds <= 0) return this.value;
    if (seconds > 1 / 35) {
      this.slow++;
      this.fast = 0;
    } else if (seconds < 1 / 58) {
      this.fast++;
      this.slow = 0;
    } else {
      this.slow = this.fast = 0;
    }
    if (this.slow >= 30) {
      this.value = Math.max(1, this.value - 0.25);
      this.slow = 0;
    }
    if (this.fast >= 240) {
      this.value = Math.min(2, this.value + 0.25);
      this.fast = 0;
    }
    return this.value;
  }
}
export function AdaptiveQuality() {
  const controller = useMemo(() => new QualityController(), []);
  const setDpr = useThree((s) => s.setDpr);
  const last = useRef(1.5);
  useFrame((_, dt) => {
    const next = controller.sample(dt);
    if (next !== last.current) {
      last.current = next;
      setDpr(next);
    }
  });
  return null;
}
export function AnimationPlayer({
  root,
  clips,
  name,
  playing = true,
  speed = 1,
}: {
  root: Object3D;
  clips: AnimationClip[];
  name?: string;
  playing?: boolean;
  speed?: number;
}) {
  if (!Number.isFinite(speed) || Math.abs(speed) > 8)
    throw new Error("Invalid animation speed");
  const mixer = useMemo(() => new AnimationMixer(root), [root]);
  useEffect(() => {
    const clip = selectClip(clips, name);
    if (!clip) return;
    const action = mixer.clipAction(clip);
    action.play();
    return () => {
      action.stop();
      mixer.uncacheClip(clip);
    };
  }, [mixer, clips, name]);
  useEffect(
    () => () => {
      mixer.stopAllAction();
      mixer.uncacheRoot(root);
    },
    [mixer, root],
  );
  useFrame((_, dt) => {
    if (playing) mixer.update(Math.min(dt, 0.05) * speed);
  });
  return null;
}
export class SceneErrorBoundary extends React.Component<
  {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    onError?: (error: Error) => void;
    resetKey?: unknown;
  },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error) {
    this.props.onError?.(error);
  }
  componentDidUpdate(previous: Readonly<{ resetKey?: unknown }>) {
    if (previous.resetKey !== this.props.resetKey && this.state.failed)
      this.setState({ failed: false });
  }
  render() {
    return this.state.failed
      ? (this.props.fallback ?? (
          <div role="alert">The scene could not be loaded.</div>
        ))
      : this.props.children;
  }
}
export function captureScene(
  renderer: {
    domElement: HTMLCanvasElement;
    render: (scene: any, camera: any) => void;
  },
  scene: unknown,
  camera: unknown,
): Promise<Blob> {
  renderer.render(scene, camera);
  return new Promise((resolve, reject) =>
    renderer.domElement.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Image capture failed")),
      "image/png",
    ),
  );
}
