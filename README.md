# LuxLeaf Scene Kit

React scene composition, complete Fiber entry points, owned asset lifecycles and portable scene documents.

Version **0.2.0** expands the initial workbench into a broader package. Original LuxLeaf additions are proprietary to **Michelle L. Wu**. The included licensed foundations retain their own licenses and attribution. Public source visibility does not grant a license to LuxLeaf's proprietary additions.

## Workbench

```sh
npm ci --ignore-scripts
npm run verify
npm run verify:package
npm run dev
```

Use Node 24+. Open `/advanced.html` for the expanded studio, `/` for the compact demonstration, and `/checks-expanded.html` for real browser acceptance checks. These pages run locally. Consumer applications must supply authentication, tenancy and deployment controls appropriate to their use.

## Install

The scoped package is `@zontafor/luxleaf-scene-kit`. GitHub Packages requires registry authentication even for public npm packages. Configure your own GitHub credential outside source control, then:

```sh
npm install @zontafor/luxleaf-scene-kit@0.2.0 --registry=https://npm.pkg.github.com
```

GitHub Release `.tgz` attachments provide a separate installable archive. A release attachment alone is not proof of registry publication. See [release procedure](docs/RELEASING.md) for verification commands and the distinction between repository and package visibility.

## Package entry points

| Import suffix | Distributed implementation |
|---|---|
| `.` | `./dist/index.js` |
| `./fiber` | `./dist/fiber.js` |
| `./native` | `./dist/native.js` |
| `./testing` | `./dist/testing.js` |
| `./eslint` | `./dist/eslint.js` |

## Implemented scope

### Rendering ecosystem

The complete Fiber API is available at `/fiber`; `/native` and `/testing` expose the corresponding foundation entry points. The unmodified 228-file reference tree preserves its core, reconciler, hooks, native implementation, test renderer, lint rules, tests, examples and docs.

### LuxLeaf scene tools

Versioned scene documents, strict transforms/material validation, skeleton-aware model cloning, reference-counted asset cache, animation playback, adaptive DPR, error boundaries and PNG capture.

### Developer workbench

Local embedded GLB import, scene JSON editor, animation controls, model replacement resource disposal and a real rendering acceptance page.

### Remaining host verification

React Native/Expo device builds, host bundler combinations, complete upstream test suite, and a broad browser/GPU performance matrix are not certified.

## Verification

The current suite includes **18 unit/integration tests**. The expanded browser page contains **6 assertions**, run separately from headless CI. These counts describe specific checks, not proof of exact feature, pixel or performance parity with another product. See [validation](docs/VALIDATION.md) for evidence and known limits.

The repository includes source, tests, runnable examples, build configuration, architecture notes, dependency notices and release workflows. The npm archive includes source and examples alongside JavaScript and declarations. It intentionally excludes installed dependencies, credentials and local user media.

- [Capability matrix](docs/CAPABILITIES.md)
- [Architecture and lifecycle](docs/ARCHITECTURE.md)
- [Provenance](docs/PROVENANCE.md)
- [Third-party notices](THIRD_PARTY_NOTICES.md)
- [Security and supported deployment](SECURITY.md)
