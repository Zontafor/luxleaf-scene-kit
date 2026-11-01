import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { defaults, validate, serialize, deserialize } from "../src/index";
test("module imports without a browser and defaults round-trip", () =>
  assert.deepEqual(deserialize(serialize(defaults)), defaults));
test("unknown preset fields and executable payloads rejected", () => {
  assert.throws(() => deserialize('{"onClick":"alert(1)"}'));
  assert.throws(() => deserialize('{"__proto__":{"polluted":true}}'));
  assert.equal(({} as Record<string, unknown>).polluted, undefined);
});
test("nonfinite and out-of-range values rejected", () => {
  for (const value of [NaN, Infinity, -1, 100000, "1", null])
    assert.throws(() => validate({ speed: value }));
});
test("configuration size is bounded and malformed input rejected", () => {
  assert.throws(() => deserialize("x".repeat(16385)));
  assert.throws(() => deserialize("{"));
  assert.throws(() => validate([]));
});
test("HTML and malformed colors rejected", () => {
  const key: string = "color";
  assert.throws(() =>
    validate({
      [key]: key === "colors" ? ["#123456", "<script>", "#abcdef"] : "<script>",
    }),
  );
});
test("validated settings detach from input mutation", () => {
  const source = JSON.parse(serialize(defaults));
  const result = validate(source);
  source.speed = 999;
  assert.deepEqual(result, defaults);
});
