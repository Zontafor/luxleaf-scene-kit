import React, { useState, useRef, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  SceneCanvas,
  SceneDocument,
  validateDocument,
  serializeDocument,
  parseDocument,
  AdaptiveQuality,
  SceneErrorBoundary,
  assertEmbeddedGLB,
  disposeOwnedModel,
  cloneModel,
  AnimationPlayer,
  captureScene,
} from "../src/index";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import type { GLTF } from "three/addons/loaders/GLTFLoader.js";
import type { RootState } from "@react-three/fiber";
import "./style.css";
const initial = validateDocument({
  version: 1,
  nodes: [
    {
      id: "leaf",
      position: [-1.2, 0, 0],
      material: { shape: "torus", color: "#b7dba7", animate: false },
    },
    {
      id: "seed",
      position: [1.2, 0, 0],
      scale: [0.7, 0.7, 0.7],
      material: { shape: "sphere", color: "#e4c477", animate: false },
    },
  ],
});
function App() {
  const [doc, setDoc] = useState(initial),
    [draft, edit] = useState(serializeDocument(initial)),
    [model, setModel] = useState<GLTF | null>(null),
    [status, message] = useState(
      "Orbit, zoom, select a mesh, or import a local GLB.",
    ),
    [motion, animate] = useState(false);
  const state = useRef<RootState | null>(null);
  useEffect(
    () => () => {
      if (model) disposeOwnedModel(model.scene);
    },
    [model],
  );
  return (
    <>
      <header>
        <strong>LUXLEAF SCENE WORKBENCH</strong>
      </header>
      <main>
        <h1>Scenes with structure.</h1>
        <p>
          Declarative composition, model animation, adaptive quality, portable
          documents and real scene export.
        </p>
        <div className="workspace">
          <section className="preview">
            <SceneErrorBoundary
              resetKey={model}
              onError={(e) => message(e.message)}
            >
              <SceneCanvas
                animate={motion}
                camera={{ position: [0, 0, 7] }}
                onCreated={(s) => {
                  state.current = s;
                }}
              >
                <AdaptiveQuality />
                {model ? (
                  <>
                    <primitive object={model.scene} dispose={null} />
                    <AnimationPlayer
                      root={model.scene}
                      clips={model.animations}
                      playing={motion}
                    />
                  </>
                ) : (
                  <SceneDocument
                    document={doc}
                    onSelect={(id) => message("Selected " + id)}
                  />
                )}
              </SceneCanvas>
            </SceneErrorBoundary>
          </section>
          <aside className="controls">
            <button onClick={() => animate(!motion)}>
              {motion ? "Pause animation" : "Play animation"}
            </button>
            <label>
              Local GLB
              <input
                type="file"
                accept=".glb"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const bytes = await file.arrayBuffer();
                    assertEmbeddedGLB(bytes);
                    const loaded = await new GLTFLoader().parseAsync(bytes, "");
                    loaded.scene = cloneModel(loaded.scene);
                    setModel(loaded);
                    message(
                      "Local GLB loaded • " +
                        loaded.animations.length +
                        " animation clips",
                    );
                  } catch (error) {
                    message(String(error));
                  }
                }}
              />
            </label>
            <button
              onClick={() => {
                setModel(null);
                setDoc(initial);
                edit(serializeDocument(initial));
              }}
            >
              Reset scene
            </button>
            <button
              onClick={async () => {
                if (!state.current) return;
                const s = state.current,
                  blob = await captureScene(s.gl, s.scene, s.camera),
                  url = URL.createObjectURL(blob),
                  a = document.createElement("a");
                a.href = url;
                a.download = "luxleaf-scene.png";
                a.click();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
              }}
            >
              Export PNG
            </button>
          </aside>
        </div>
        <p role="status">{status}</p>
        <label>
          Scene document
          <textarea
            rows={8}
            value={draft}
            onChange={(e) => edit(e.target.value)}
          />
        </label>
        <button
          onClick={() => {
            try {
              setDoc(parseDocument(draft));
              setModel(null);
              message("Scene document applied");
            } catch (e) {
              message(String(e));
            }
          }}
        >
          Apply scene document
        </button>{" "}
        <a href="/checks-expanded.html">Run scene acceptance checks</a>
      </main>
    </>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
