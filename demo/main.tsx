import React, { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  SceneCanvas,
  SceneObject,
  defaults,
  validate,
  serialize,
  deserialize,
  type SceneOptions,
} from "../src/index";
import "./style.css";
function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function App() {
  const [options, setOptions] = useState(defaults),
    [message, setMessage] = useState("Ready for your ideas."),
    [draft, setDraft] = useState(""),
    [ready, setReady] = useState("ready");
  const renderer = useRef<unknown | null>(null);
  function change(p: Partial<SceneOptions>) {
    setOptions(validate({ ...options, ...p }));
  }
  return (
    <>
      <header>
        <a href="/advanced.html" style={{ color: "inherit" }}>
          Open full workbench →
        </a>
        <strong>
          LUXLEAF <small>VISUAL SYSTEMS</small>
        </strong>
        <span className="badge">SCENE-KIT / 01</span>
      </header>
      <main>
        <div className="intro">
          <div>
            <small>DESIGN ENGINEERING</small>
            <h1>Dimensional stories.</h1>
          </div>
          <p>
            A scene system for product moments. Real geometry, precise
            materials, and purposeful movement.
          </p>
        </div>
        <div className="workspace">
          <section className="preview" aria-label="Live visual preview">
            <SceneCanvas animate={options.animate}>
              <SceneObject
                options={options}
                onSelect={() => setMessage("Object selected")}
              />
            </SceneCanvas>
          </section>
          <aside className="controls" aria-label="Visual settings">
            <label>
              Shape
              <select
                value={options.shape}
                onChange={(e) =>
                  change({ shape: e.target.value as SceneOptions["shape"] })
                }
              >
                <option value="torus">Torus</option>
                <option value="sphere">Sphere</option>
                <option value="box">Box</option>
              </select>
            </label>
            <label>
              Color
              <input
                type="color"
                value={options.color}
                onChange={(e) => change({ color: e.target.value })}
              />
            </label>
            <label>
              Speed · {options.speed}
              <input
                aria-label="Speed"
                type="range"
                min={0}
                max={2}
                step={0.01}
                value={options.speed}
                onChange={(e) => change({ speed: Number(e.target.value) })}
              />
            </label>
            <label>
              Roughness · {options.roughness}
              <input
                aria-label="Roughness"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={options.roughness}
                onChange={(e) => change({ roughness: Number(e.target.value) })}
              />
            </label>
            <label>
              Metalness · {options.metalness}
              <input
                aria-label="Metalness"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={options.metalness}
                onChange={(e) => change({ metalness: Number(e.target.value) })}
              />
            </label>
            <button onClick={() => change({ animate: !options.animate })}>
              {options.animate ? "Pause motion" : "Play motion"}
            </button>
            <button onClick={() => setOptions(defaults)}>Reset settings</button>
          </aside>
        </div>
        <div className="notes">
          <div>
            <strong>Considered by default</strong>
            <p>
              Reduced-motion preferences and hidden tabs pause the animation.
            </p>
          </div>
          <div>
            <strong>Your configuration</strong>
            <p>
              Settings are validated before rendering. Save a preset for another
              surface.
            </p>
            <button
              onClick={() => {
                const data = serialize(options);
                setDraft(data);
                download(
                  new Blob([data], { type: "application/json" }),
                  "luxleaf-preset.json",
                );
                setMessage("Preset exported");
              }}
            >
              Export preset
            </button>
          </div>
          <div>
            <strong>Private by design</strong>
            <p>No analytics or uploads. The demo runs on this device.</p>
            <output role="status">
              {message} · renderer {ready}
            </output>
          </div>
        </div>
        <details>
          <summary>Import a preset</summary>
          <textarea
            aria-label="Preset JSON"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
            style={{ width: "100%" }}
          />
          <button
            onClick={() => {
              try {
                setOptions(deserialize(draft));
                setMessage("Preset imported");
              } catch (error) {
                setMessage((error as Error).message);
              }
            }}
          >
            Apply preset
          </button>
        </details>
      </main>
      <footer>
        Original LuxLeaf product · © 2026 Michelle L. Wu · Private development
        preview
      </footer>
    </>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
