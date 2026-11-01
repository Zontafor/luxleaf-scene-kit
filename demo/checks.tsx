import React from "react";
import { createRoot } from "react-dom/client";
import { SceneCanvas, SceneObject } from "../src/index";
import type { RootState } from "@react-three/fiber";
import { Mesh } from "three";
document.querySelector("#run")!.addEventListener("click", async () => {
  const output = document.querySelector("#result")!,
    checks: string[] = [];
  const check = (name: string, passed: boolean) => {
    if (!passed) throw new Error(name);
    checks.push("PASS " + name);
  };
  const host = document.createElement("div");
  host.style.cssText = "width:320px;height:240px";
  document.body.append(host);
  const root = createRoot(host);
  let state: RootState | undefined;
  const wait = () => new Promise((resolve) => setTimeout(resolve, 150));
  try {
    root.render(
      <SceneCanvas
        animate={false}
        orbit={false}
        onCreated={(s) => {
          state = s;
        }}
      >
        <SceneObject options={{ shape: "sphere", animate: false }} />
      </SceneCanvas>,
    );
    for (let i = 0; i < 20 && !state; i++) await wait();
    await wait();
    check(
      "React canvas creates a real renderer",
      !!state && host.querySelector("canvas") !== null,
    );
    const first = state!.scene.children.find((x) => x instanceof Mesh) as Mesh;
    check(
      "declarative scene creates sphere geometry",
      first?.geometry.type === "SphereGeometry",
    );
    check("paused canvas uses demand rendering", state!.frameloop === "demand");
    root.render(
      <SceneCanvas animate={false} orbit={false}>
        <SceneObject options={{ shape: "box", animate: false }} />
      </SceneCanvas>,
    );
    await wait();
    const second = state!.scene.children.find((x) => x instanceof Mesh) as Mesh;
    check(
      "React updates replace geometry",
      second?.geometry.type === "BoxGeometry",
    );
    check("GPU reports no error", state!.gl.getContext().getError() === 0);
    root.unmount();
    check("unmount removes canvas", host.querySelector("canvas") === null);
    output.textContent = checks.join("\n") + "\nALL PASSED: " + checks.length;
  } catch (error) {
    output.textContent =
      checks.join("\n") + "\nFAILED: " + (error as Error).message;
    root.unmount();
  } finally {
    host.remove();
  }
});
