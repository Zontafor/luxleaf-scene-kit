import React from "react";
import { createRoot } from "react-dom/client";
import {
  SceneCanvas,
  SceneDocument,
  validateDocument,
  captureScene,
  inspectGLB,
  cloneModel,
} from "../src/index";
import type { RootState } from "@react-three/fiber";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
const output = document.querySelector("#result")!;
const lines: string[] = [];
function check(name: string, value: unknown) {
  if (!value) throw new Error(name);
  lines.push("PASS " + name);
  output.textContent = lines.join("\n");
}
const wait = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));
document.querySelector("#run")!.addEventListener("click", async () => {
  lines.length = 0;
  try {
    await run();
    output.textContent = lines.join("\n") + "\nALL PASSED: " + lines.length;
  } catch (error) {
    output.textContent = lines.join("\n") + "\nFAILED: " + String(error);
  }
});
async function run() {
  const host = document.createElement("div");
  host.style.cssText = "width:320px;height:240px";
  document.body.append(host);
  const root = createRoot(host);
  let state: RootState | undefined;
  try {
    const documentData = validateDocument({
      version: 1,
      nodes: [
        { id: "left", position: [-1, 0, 0] },
        { id: "right", position: [1, 0, 0] },
      ],
    });
    root.render(
      <SceneCanvas
        animate={false}
        onCreated={(s) => {
          state = s;
        }}
      >
        <SceneDocument document={documentData} />
      </SceneCanvas>,
    );
    for (let i = 0; i < 30 && !state; i++) await wait();
    await wait();
    check(
      "document creates named scene nodes",
      !!state?.scene.getObjectByName("left") &&
        !!state?.scene.getObjectByName("right"),
    );
    const png = await captureScene(state!.gl, state!.scene, state!.camera);
    check(
      "scene capture produces PNG bytes",
      png.type === "image/png" && png.size > 100,
    );
    const gltf = {
      asset: { version: "2.0" },
      scene: 0,
      scenes: [{ nodes: [0] }],
      nodes: [{ name: "local-node" }],
    };
    let json = new TextEncoder().encode(JSON.stringify(gltf));
    const length = Math.ceil(json.length / 4) * 4,
      bytes = new ArrayBuffer(20 + length),
      v = new DataView(bytes);
    v.setUint32(0, 0x46546c67, true);
    v.setUint32(4, 2, true);
    v.setUint32(8, bytes.byteLength, true);
    v.setUint32(12, length, true);
    v.setUint32(16, 0x4e4f534a, true);
    new Uint8Array(bytes, 20).fill(32);
    new Uint8Array(bytes, 20, json.length).set(json);
    check(
      "generated GLB passes framing validation",
      inspectGLB(bytes).chunks.length === 1,
    );
    const loaded = await new GLTFLoader().parseAsync(bytes, "");
    check(
      "real loader parses a local GLB without remote assets",
      !!loaded.scene.getObjectByName("local-node"),
    );
    const copy = cloneModel(loaded.scene);
    check(
      "loader result clones into an independent scene hierarchy",
      copy !== loaded.scene && copy.children[0] !== loaded.scene.children[0],
    );
    root.unmount();
    check("document renderer cleans up canvas", !host.querySelector("canvas"));
  } finally {
    root.unmount();
    host.remove();
  }
}
