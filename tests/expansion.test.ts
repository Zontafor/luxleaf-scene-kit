(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import * as foundation from "@react-three/fiber";
import * as exposed from "../src/fiber.js";
import { create } from "../src/testing.js";
import {
  AssetCache,
  inspectGLB,
  cloneModel,
  validateDocument,
  serializeDocument,
  parseDocument,
  QualityController,
  selectClip,
} from "../src/index.js";
import {
  Group,
  Mesh,
  BoxGeometry,
  MeshBasicMaterial,
  AnimationClip,
} from "three";
import { rules } from "../src/eslint.js";
test("entire web foundation API is exposed without substitutions", () => {
  for (const key of Object.keys(foundation).filter(
    (k) => k !== "default" && k !== "__esModule",
  ))
    assert.equal((exposed as any)[key], (foundation as any)[key], key);
});
test("real foundation test renderer creates, updates, fires events and unmounts a scene", async () => {
  // Three.js owns a browser animation scheduler even in the foundation test renderer.
  (globalThis as any).self = {requestAnimationFrame:(callback:any)=>setTimeout(callback,16),cancelAnimationFrame:(id:any)=>clearTimeout(id)};
  let clicks = 0;
  const renderer = await create(
    React.createElement(
      "mesh",
      { onClick: () => clicks++ },
      React.createElement("boxGeometry"),
      React.createElement("meshBasicMaterial", { color: "red" }),
    ),
  );
  assert.equal(renderer.scene.children[0].type, "Mesh");
  await renderer.fireEvent(renderer.scene.children[0], "click");
  assert.equal(clicks, 1);
  await renderer.update(
    React.createElement("mesh", null, React.createElement("sphereGeometry")),
  );
  assert.equal(
    (renderer.scene.children[0].instance as Mesh).geometry.type,
    "SphereGeometry",
  );
  await renderer.unmount();
});
test("asset leases deduplicate and dispose only after release", async () => {
  let loads = 0;
  const disposed: string[] = [];
  const cache = new AssetCache(
    async (k) => {
      loads++;
      return k;
    },
    (v) => disposed.push(v),
    1,
  );
  const a = cache.acquire("a"),
    same = cache.acquire("a");
  assert.equal(await a.value, "a");
  await same.value;
  assert.equal(loads, 1);
  const b = cache.acquire("b");
  await b.value;
  a.release();
  assert.deepEqual(disposed, []);
  same.release();
  assert.deepEqual(disposed, ["a"]);
  assert.throws(() => cache.close());
  b.release();
  cache.close();
  assert.deepEqual(disposed, ["a", "b"]);
  assert.throws(() => cache.acquire("c"));
});
test("failed assets can be retried and pending evictions release eventual values", async () => {
  let calls = 0;
  const cache = new AssetCache(
    async () => {
      if (!calls++) throw Error("network");
      return 7;
    },
    () => {},
    1,
  );
  const failed = cache.acquire("a");
  await assert.rejects(failed.value);
  failed.release();
  const retry = cache.acquire("a");
  assert.equal(await retry.value, 7);
  retry.release();
  cache.close();
});
test("scene document round-trips and rejects duplicate IDs and executable fields", () => {
  const doc = validateDocument({ version: 1, nodes: [{ id: "one" }] });
  assert.deepEqual(parseDocument(serializeDocument(doc)), doc);
  assert.throws(() =>
    validateDocument({ version: 1, nodes: [{ id: "a" }, { id: "a" }] }),
  );
  assert.throws(() =>
    validateDocument({ version: 1, nodes: [{ id: "a", onClick: "eval()" }] }),
  );
  assert.throws(() =>
    validateDocument({ version: 1, nodes: [{ id: "a", scale: [0, 1, 1] }] }),
  );
});
test("model clones retain shared resources and distinct transforms", () => {
  const original = new Group(),
    mesh = new Mesh(new BoxGeometry(), new MeshBasicMaterial());
  original.add(mesh);
  const copy = cloneModel(original);
  assert.notEqual(copy, original);
  assert.notEqual(copy.children[0], mesh);
  assert.equal((copy.children[0] as Mesh).geometry, mesh.geometry);
  copy.position.x = 7;
  assert.equal(original.position.x, 0);
});
test("animation selection fails explicitly for unknown clips", () => {
  const clip = new AnimationClip("walk", 1, []);
  assert.equal(selectClip([clip], "walk"), clip);
  assert.throws(() => selectClip([clip], "missing"));
});
test("quality hysteresis responds to sustained load rather than isolated frames", () => {
  const q = new QualityController();
  q.sample(0.1);
  assert.equal(q.value, 1.5);
  for (let i = 0; i < 29; i++) q.sample(0.1);
  assert.equal(q.value, 1.25);
  for (let i = 0; i < 240; i++) q.sample(0.01);
  assert.equal(q.value, 1.5);
  q.sample(NaN);
  assert.equal(q.value, 1.5);
});
test("GLB framing rejects truncation and unsupported versions", () => {
  const buffer = new ArrayBuffer(24),
    v = new DataView(buffer);
  [0x46546c67, 2, 24, 4, 0x4e4f534a, 0x20207d7b].forEach((n, i) =>
    v.setUint32(i * 4, n, true),
  );
  assert.equal(inspectGLB(buffer).chunks.length, 1);
  v.setUint32(12, 8, true);
  assert.throws(() => inspectGLB(buffer));
});
test("both lint rules produce findings without shipping obsolete ESLint", () => {
  for (const rule of Object.values(rules)) {
    const reports: any[] = [];
    const visitors = rule.create({ report: (x) => reports.push(x) });
    Object.values(visitors)[0]({});
    assert.equal(reports.length, 1);
  }
});
