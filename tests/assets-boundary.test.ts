import test from "node:test";
import assert from "node:assert/strict";
import { assertEmbeddedGLB, disposeOwnedModel } from "../src/assets.js";
import { Group, Mesh, BoxGeometry, MeshStandardMaterial } from "three";
function glb(json: unknown) {
  let text = JSON.stringify(json);
  text += " ".repeat((4 - (text.length % 4)) % 4);
  const bytes = new ArrayBuffer(20 + text.length),
    view = new DataView(bytes);
  [0x46546c67, 2, bytes.byteLength, text.length, 0x4e4f534a].forEach((x, i) =>
    view.setUint32(i * 4, x, true),
  );
  new Uint8Array(bytes, 20).set(new TextEncoder().encode(text));
  return bytes;
}
test("local GLB import rejects nested remote resources before loading", () => {
  assert.throws(
    () =>
      assertEmbeddedGLB(
        glb({ images: [{ uri: "https://example.com/logo.png" }] }),
      ),
    /External/,
  );
  assert.throws(
    () => assertEmbeddedGLB(glb({ buffers: [{ uri: "file.bin" }] })),
    /External/,
  );
  assert.doesNotThrow(() =>
    assertEmbeddedGLB(
      glb({
        asset: { version: "2.0" },
        images: [{ uri: "data:image/png;base64,AA==" }],
      }),
    ),
  );
});
test("exclusive model disposal deduplicates shared geometry and materials", () => {
  const root = new Group(),
    geometry = new BoxGeometry(),
    material = new MeshStandardMaterial();
  let geometries = 0,
    materials = 0;
  geometry.addEventListener("dispose", () => geometries++);
  material.addEventListener("dispose", () => materials++);
  root.add(new Mesh(geometry, material), new Mesh(geometry, material));
  disposeOwnedModel(root);
  assert.equal(geometries, 1);
  assert.equal(materials, 1);
});
