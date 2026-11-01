# Supported scope and comparison

This is a LuxLeaf product, not a renamed fork or drop-in upstream replacement. Similarity in purpose does not imply API, visual, performance or ecosystem parity.

| Capability | Implementation and evidence |
|---|---|
| Declarative React 3D | Licensed Fiber/Three foundations, verified renderer creation and geometry replacement. |
| Materials, lighting and primitive scenes | Original LuxLeaf defaults, live demo, contract tests. |
| Orbit and pointer interaction | Foundation controls with LuxLeaf lifecycle; visible demo supports drag, zoom and selection. |
| Arbitrary scene composition | Fiber APIs re-exported; inherited foundation surface is not exhaustively retested here. |
| GLTF/GLB loading | Static `Model` helper implemented; remote assets, compression decoders and animations not validated in this release. |
| Native React renderer, XR and advanced animation | Not provided as LuxLeaf features. |
| Complete Fiber compatibility replacement | Not attempted: Fiber is an explicit runtime dependency. |

## Release acceptance

A v0.1 release requires passing type checks, unit tests, production build, package-content review, a fresh package consumer import and the documented browser checks. The private repository must contain source, demo, lockfile, CI, notices and architecture documentation. A release tag must point to the reviewed source commit.

## Before a broader production rollout

Validate the host application's accessibility and authorization independently. Test the actual target Chrome, Safari, Firefox, mobile and GPU fleet. Establish measured frame-time and memory budgets under intended concurrency. Add browser checks to the organization's browser CI infrastructure. No load/SLA, cross-browser certification, independent security audit or exact upstream parity is claimed by this initial release.
