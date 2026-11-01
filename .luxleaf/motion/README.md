# Scene Kit motion demonstration

Animated geometry, a live camera, metallic materials, lighting and cast shadows in the actual React Three Fiber renderer.

## Run

Use the repository's normal installation instructions first, then run from its root:

```sh
node node_modules/vite/bin/vite.js --config .luxleaf/motion/vite.config.mjs
```

Open http://localhost:4390/. **Pause motion** freezes the composition. **Record video** captures about ten seconds of the rendered canvas to a local WebM file. No screen, microphone or external upload is involved. Keep the preview visible while recording.

[MP4](../media/scene-kit-motion.mp4) · [Animated preview](../media/scene-kit-motion.gif) · [Capture record](../media/scene-kit-motion.json)

The capture record reports measured duration, dimensions, frame count, SHA-256 and the mean pixel difference between seconds 1 and 8. H.264 MP4 is encoded at 30 fps from the actual WebM recording; this is not a measured rendering-performance claim. The GIF is a shorter preview and is not promised to loop seamlessly.

## Scope

This composition is a focused demonstration, not coverage of every API or integration. All pinned original source files remain unchanged. LuxLeaf's composition and recording controls live under `.luxleaf/motion/`; the original renderer retains its license and attribution.

The scene demo uses three mesh geometries, a shadow-receiving plane and lights. Rotation is driven by `useFrame`. It does not demonstrate external asset loading or native hosts.
