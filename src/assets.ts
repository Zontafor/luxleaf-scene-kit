import { AnimationClip, Object3D } from "three";
import { clone } from "three/addons/utils/SkeletonUtils.js";

export interface AssetLease<T> {
  value: Promise<T>;
  release(): void;
}
type Entry<T> = {
  value: Promise<T>;
  references: number;
  disposed: boolean;
  result?: T;
  last: number;
};
/** Reference-counted cache: in-flight requests deduplicate; only unleased entries can be evicted. */
export class AssetCache<T> {
  private entries = new Map<string, Entry<T>>();
  private clock = 0;
  private closed = false;
  constructor(
    private load: (key: string) => Promise<T>,
    private dispose: (value: T) => void,
    readonly capacity = 16,
  ) {
    if (!Number.isInteger(capacity) || capacity < 1)
      throw new Error("Positive integer capacity required");
  }
  acquire(key: string): AssetLease<T> {
    if (this.closed || !key) throw new Error("Cache closed or invalid key");
    let entry = this.entries.get(key);
    if (!entry) {
      entry = {
        value: Promise.resolve(undefined as T),
        references: 0,
        disposed: false,
        last: ++this.clock,
      };
      const current = entry;
      entry.value = Promise.resolve()
        .then(() => this.load(key))
        .then(
          (value) => {
            current.result = value;
            if (current.disposed) this.dispose(value);
            return value;
          },
          (error) => {
            if (this.entries.get(key) === current) this.entries.delete(key);
            throw error;
          },
        );
      this.entries.set(key, entry);
    }
    entry.references++;
    entry.last = ++this.clock;
    this.trim();
    let released = false;
    const selected = entry;
    return {
      value: selected.value,
      release: () => {
        if (released) return;
        released = true;
        selected.references--;
        this.trim();
      },
    };
  }
  private remove(key: string, entry: Entry<T>) {
    if (entry.references) throw new Error("Cannot evict a leased asset");
    this.entries.delete(key);
    entry.disposed = true;
    if (entry.result !== undefined) this.dispose(entry.result);
  }
  private trim() {
    for (const [key, entry] of [...this.entries].sort(
      (a, b) => a[1].last - b[1].last,
    )) {
      if (this.entries.size <= this.capacity) break;
      if (!entry.references) this.remove(key, entry);
    }
  }
  clear() {
    for (const [key, entry] of this.entries)
      if (!entry.references) this.remove(key, entry);
  }
  close() {
    if ([...this.entries.values()].some((e) => e.references))
      throw new Error("Release all assets before closing");
    this.clear();
    this.closed = true;
  }
  get size() {
    return this.entries.size;
  }
}
/** Skeleton-aware hierarchy copy. Geometry and materials remain shared with the source. */
export function cloneModel<T extends Object3D>(scene: T): T {
  return clone(scene) as T;
}
export function selectClip(clips: AnimationClip[], name?: string) {
  if (!name) return clips[0];
  const clip = clips.find((c) => c.name === name);
  if (!clip) throw new Error(`Unknown animation: ${name}`);
  return clip;
}
/** Validate container framing before passing a GLB to a loader. This is not a media sandbox. */
export function inspectGLB(bytes: ArrayBuffer) {
  if (bytes.byteLength < 20 || bytes.byteLength > 64 * 1024 * 1024)
    throw new Error("Invalid GLB size");
  const view = new DataView(bytes);
  if (
    view.getUint32(0, true) !== 0x46546c67 ||
    view.getUint32(4, true) !== 2 ||
    view.getUint32(8, true) !== bytes.byteLength
  )
    throw new Error("Invalid GLB header");
  let offset = 12;
  const chunks: { type: number; length: number }[] = [];
  while (offset < bytes.byteLength) {
    if (offset + 8 > bytes.byteLength) throw new Error("Truncated chunk");
    const length = view.getUint32(offset, true),
      type = view.getUint32(offset + 4, true);
    if (length % 4 || offset + 8 + length > bytes.byteLength)
      throw new Error("Invalid chunk length");
    chunks.push({ type, length });
    offset += 8 + length;
  }
  if (chunks[0]?.type !== 0x4e4f534a) throw new Error("JSON must be first");
  return { version: 2 as const, bytes: bytes.byteLength, chunks };
}

/** The local importer permits embedded data only; a GLB may otherwise reference network resources. */
export function assertEmbeddedGLB(bytes: ArrayBuffer) {
  const framing = inspectGLB(bytes);
  const json = JSON.parse(
    new TextDecoder()
      .decode(new Uint8Array(bytes, 20, framing.chunks[0].length))
      .trim(),
  );
  const visit = (value: unknown): void => {
    if (!value || typeof value !== "object") return;
    for (const [key, item] of Object.entries(value)) {
      if (
        key === "uri" &&
        (typeof item !== "string" || !item.startsWith("data:"))
      )
        throw new Error(
          "External resources are not allowed in local GLB imports",
        );
      visit(item);
    }
  };
  visit(json);
  return framing;
}
/** Dispose only a model's exclusively owned resources, never resources shared by another live clone. */
export function disposeOwnedModel(root: Object3D) {
  const resources = new Set<{ dispose(): void }>();
  root.traverse((object: any) => {
    if (object.geometry) resources.add(object.geometry);
    for (const material of object.material
      ? Array.isArray(object.material)
        ? object.material
        : [object.material]
      : []) {
      resources.add(material);
      for (const value of Object.values(material) as any[])
        if (value?.isTexture) resources.add(value);
    }
  });
  for (const resource of resources) resource.dispose();
}
