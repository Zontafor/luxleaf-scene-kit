import { readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
const manifest = JSON.parse(
  await readFile("foundations/manifest.json", "utf8"),
);
const roots = (await readdir("foundations", { withFileTypes: true })).filter(
  (x) => x.isDirectory(),
);
if (roots.length !== 1) throw Error("Expected one foundation tree");
let count = 0;
for (const [path, expected] of Object.entries(manifest.files)) {
  const bytes = await readFile("foundations/" + roots[0].name + "/" + path);
  if (createHash("sha256").update(bytes).digest("hex") !== expected)
    throw Error("Foundation changed: " + path);
  count++;
}
console.log(
  "Verified " + count + " preserved foundation files at " + manifest.revision,
);
