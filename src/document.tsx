import React from "react";
import { SceneObject, validate, type SceneOptions } from "./index.js";
import { object, number, parseJSON } from "./validation.js";
export type Vector3Tuple = [number, number, number];
export interface SceneNode {
  id: string;
  position: Vector3Tuple;
  rotation: Vector3Tuple;
  scale: Vector3Tuple;
  material: SceneOptions;
}
export interface SceneDocumentData {
  version: 1;
  nodes: SceneNode[];
}
function vector(
  value: unknown,
  fallback: Vector3Tuple,
  min: number,
  max: number,
): Vector3Tuple {
  if (value === undefined) return [...fallback];
  if (!Array.isArray(value) || value.length !== 3)
    throw new Error("Three coordinates required");
  return value.map((x) => number(x, "coordinate", min, max)) as Vector3Tuple;
}
export function validateDocument(input: unknown): SceneDocumentData {
  const v = object(input, ["version", "nodes"]);
  if (v.version !== 1 || !Array.isArray(v.nodes) || v.nodes.length > 256)
    throw new Error("Unsupported document or node count");
  const ids = new Set<string>();
  return {
    version: 1,
    nodes: v.nodes.map((raw) => {
      const n = object(raw, [
        "id",
        "position",
        "rotation",
        "scale",
        "material",
      ]);
      if (
        typeof n.id !== "string" ||
        !/^[a-zA-Z0-9_-]{1,64}$/.test(n.id) ||
        ids.has(n.id)
      )
        throw new Error("Invalid or duplicate node ID");
      ids.add(n.id);
      return {
        id: n.id,
        position: vector(n.position, [0, 0, 0], -10000, 10000),
        rotation: vector(n.rotation, [0, 0, 0], -1000, 1000),
        scale: vector(n.scale, [1, 1, 1], 0.001, 1000),
        material: validate(n.material ?? {}),
      };
    }),
  };
}
export function serializeDocument(value: SceneDocumentData) {
  return JSON.stringify(validateDocument(value));
}
export function parseDocument(text: string) {
  if (text.length > 256000) throw new Error("Document too large");
  return validateDocument(JSON.parse(text));
}
export function SceneDocument({
  document,
  onSelect,
}: {
  document: SceneDocumentData;
  onSelect?: (id: string) => void;
}) {
  return (
    <>
      {validateDocument(document).nodes.map((node) => (
        <group
          key={node.id}
          name={node.id}
          position={node.position}
          rotation={node.rotation}
          scale={node.scale}
        >
          <SceneObject
            options={node.material}
            onSelect={() => onSelect?.(node.id)}
          />
        </group>
      ))}
    </>
  );
}
