# Rebuild provenance — v0.2.0

The unmodified source tree is preserved under `foundations/react-three-fiber`. `foundations/manifest.json` records the pinned revision and SHA-256 of every preserved file. `npm run verify:foundation` detects drift. These files retain their original authorship and licenses. Changes used at runtime are outside that reference tree and documented in source/build scripts.

## Earlier research record

# Private research and provenance

The supplied screen recording identified `pmndrs/react-three-fiber`. Repository metadata and documentation were reviewed on 2026-11-01 at commit `d74622ea8ed717f7212d7e19d65ff3e325508389`.

Source: https://github.com/pmndrs/react-three-fiber/tree/d74622ea8ed717f7212d7e19d65ff3e325508389

Observed license: **MIT**.

Decision: Use React Three Fiber and Three.js as licensed runtime foundations. Preserve their notices. Original LuxLeaf work is the scene product layer, configuration contracts and demo.

The recording and unrelated personal files are not included in this repository. Research links are provenance, not ownership claims. Original LuxLeaf source and documentation carry Michelle L. Wu's proprietary license. That license does not replace dependency licenses; see the runtime inventory and preserved notices.

Design intent is functional similarity within the declared scope, not wholesale code copying. README claims and roadmap items were treated separately from implemented features. The capability matrix records deliberate omissions and unverified integrations.
