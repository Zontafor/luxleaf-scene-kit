# LuxLeaf Scene Kit

Typed React scenes, deliberate lighting, orbit interaction and validated material presets, built on React Three Fiber and Three.js.

**Private v0.1.0 product release.** Original LuxLeaf code is proprietary to Michelle L. Wu. Licensed foundations retain their own rights. This is a functional initial product with an explicit supported scope; it is not a full replacement for the upstream ecosystem.

## Run the workbench

```sh
npm ci --ignore-scripts
npm run verify
npm run dev -- --port 4184
```

Use Node 22.12+ (Node 24 recommended). Open the local URL printed by Vite. The demo includes live settings, reset and preset import/export. GPU products also export PNG. Nothing is sent to a server by the demo. Vite binds to loopback by default.

## Use the private package

Build and create an installable archive:

```sh
npm run build
npm pack
# In an authorized consumer project:
npm install /absolute/path/to/luxleaf-scene-kit-0.1.0.tgz
```

ES modules and TypeScript declarations are included. This package is intentionally marked `private: true`; no public npm publication is configured. Use one compatible React installation in the consumer. Browser components must run on the client; construction of imperative renderers requires the DOM. A preset is data, not executable code.

```tsx
import { SceneCanvas, SceneObject } from '@luxleaf/scene-kit';

export function ProductScene() {
  return <div style={{ height: 420 }}>
    <SceneCanvas animate={false}>
      <SceneObject options={{ shape: 'torus', animate: false }} />
    </SceneCanvas>
  </div>;
}
```

## API

| Export | Contract |
|---|---|
| `SceneCanvas` | React Three Fiber Canvas props plus `animate` and `orbit`; defaults to a lit perspective scene, DPR 1–2, demand rendering when paused. |
| `SceneObject` | `options` and optional `onSelect`; sphere, box or torus with hover response and a standard material. |
| `OrbitController` | Mount inside a Fiber canvas; drag to orbit and scroll to zoom between distances 2 and 10. |
| `Model({url})` | Suspense-based GLTFLoader helper for static glTF/GLB scenes. Shared cached geometry/materials are retained. |
| `Canvas`, `useFrame`, `useThree`, `useLoader` | Re-exports from the licensed Fiber foundation for advanced composition. |
| `validate`, `serialize`, `deserialize`, `defaults` | Strict configuration boundary and JSON preset helpers. |

`SceneOptions`: color (six-digit hex), shape (`sphere`, `box`, `torus`), speed (0–2), roughness (0–1), metalness (0–1), animate (boolean). `SceneCanvas.animate` and the object setting should agree. Canvas pauses automatic frames for reduced motion and hidden documents. Orbit invalidates demand frames on interaction.

All numeric fields must be finite and in range. Unknown configuration keys are rejected, and JSON input is limited to 16 KiB. Presets use the v0.1 schema; there is no version-migration promise yet. Exported defaults should be treated as immutable.

## Quality and operations

`npm run verify` checks TypeScript, runs 6 unit tests and builds both library and demo. `/checks.html` exposes 6 actual browser integration assertions; open it in the local server and press **Run checks**. Browser checks are manual and are not represented as automated CI coverage. See [validation](docs/VALIDATION.md) for evidence and limits.

- [Architecture and lifecycle](docs/ARCHITECTURE.md)
- [Capability comparison and known gaps](docs/CAPABILITIES.md)
- [Private release procedure](docs/RELEASING.md)
- [Research and provenance](docs/PROVENANCE.md)
- [Third-party notices](THIRD_PARTY_NOTICES.md)
- [Security reporting and data handling](SECURITY.md)

The demo is a workbench for this package. Authentication, tenancy, persistence, payments and deployment infrastructure belong to the integrating application and are not supplied by this browser library.
