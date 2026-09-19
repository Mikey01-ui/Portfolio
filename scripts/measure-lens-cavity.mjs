/**
 * Measures the matte-box cavity of the camera GLB so the portal plane can be
 * placed inside the hood without poking through the walls.
 *
 * Rasterizes every triangle into a (z, y) height map of the frontmost +X surface,
 * then reports the largest rectangle that is backed by geometry but sits in open
 * air at a given depth.
 *
 * Usage: node scripts/measure-lens-cavity.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

const MODEL_TARGET_HEIGHT = 1.62;
const GRID = 420;

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const glbPath = path.join(rootDir, "public/models/1930s_movie_camera.web.glb");

const COMPONENT = {
  5120: { array: Int8Array, size: 1 },
  5121: { array: Uint8Array, size: 1 },
  5122: { array: Int16Array, size: 2 },
  5123: { array: Uint16Array, size: 2 },
  5125: { array: Uint32Array, size: 4 },
  5126: { array: Float32Array, size: 4 },
};

const TYPE_COUNT = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };

function readGlb(file) {
  const buffer = fs.readFileSync(file);
  const jsonLength = buffer.readUInt32LE(12);
  const json = JSON.parse(buffer.subarray(20, 20 + jsonLength).toString("utf8"));
  const binStart = 20 + jsonLength + 8;
  const bin = buffer.subarray(binStart);
  return { json, bin };
}

async function decodeBufferViews(json, bin) {
  await MeshoptDecoder.ready;

  return json.bufferViews.map((view) => {
    const meshopt = view.extensions?.EXT_meshopt_compression;
    if (!meshopt) {
      const offset = view.byteOffset ?? 0;
      return {
        data: new Uint8Array(bin.buffer, bin.byteOffset + offset, view.byteLength),
        byteStride: view.byteStride,
      };
    }

    const source = new Uint8Array(
      bin.buffer,
      bin.byteOffset + (meshopt.byteOffset ?? 0),
      meshopt.byteLength,
    );
    const target = new Uint8Array(meshopt.count * meshopt.byteStride);
    MeshoptDecoder.decodeGltfBuffer(
      target,
      meshopt.count,
      meshopt.byteStride,
      source,
      meshopt.mode,
      meshopt.filter,
    );
    return { data: target, byteStride: meshopt.byteStride };
  });
}

function readAccessor(json, views, accessorIndex) {
  const accessor = json.accessors[accessorIndex];
  const view = views[accessor.bufferView];
  const comp = COMPONENT[accessor.componentType];
  const components = TYPE_COUNT[accessor.type];
  const stride = view.byteStride || comp.size * components;
  const base = accessor.byteOffset ?? 0;
  const out = new Float32Array(accessor.count * components);

  for (let i = 0; i < accessor.count; i += 1) {
    const offset = base + i * stride;
    const slice = new comp.array(
      view.data.buffer,
      view.data.byteOffset + offset,
      components,
    );
    for (let c = 0; c < components; c += 1) {
      let value = slice[c];
      if (accessor.normalized) {
        if (comp.array === Int16Array) value = Math.max(value / 32767, -1);
        else if (comp.array === Uint16Array) value /= 65535;
        else if (comp.array === Int8Array) value = Math.max(value / 127, -1);
        else if (comp.array === Uint8Array) value /= 255;
      }
      out[i * components + c] = value;
    }
  }

  return out;
}

function nodeMatrix(node) {
  const t = node.translation ?? [0, 0, 0];
  const s = node.scale ?? [1, 1, 1];
  const r = node.rotation ?? [0, 0, 0, 1];

  const [x, y, z, w] = r;
  const m = [
    (1 - 2 * (y * y + z * z)) * s[0],
    2 * (x * y + z * w) * s[0],
    2 * (x * z - y * w) * s[0],
    2 * (x * y - z * w) * s[1],
    (1 - 2 * (x * x + z * z)) * s[1],
    2 * (y * z + x * w) * s[1],
    2 * (x * z + y * w) * s[2],
    2 * (y * z - x * w) * s[2],
    (1 - 2 * (x * x + y * y)) * s[2],
  ];

  return { m, t };
}

function applyNode({ m, t }, px, py, pz) {
  return [
    m[0] * px + m[3] * py + m[6] * pz + t[0],
    m[1] * px + m[4] * py + m[7] * pz + t[1],
    m[2] * px + m[5] * py + m[8] * pz + t[2],
  ];
}

async function loadTriangles() {
  const { json, bin } = readGlb(glbPath);
  const views = await decodeBufferViews(json, bin);
  const positions = [];
  const indices = [];

  for (const node of json.nodes) {
    if (node.mesh === undefined) continue;
    const matrix = nodeMatrix(node);
    const vertexBase = positions.length / 3;

    for (const prim of json.meshes[node.mesh].primitives) {
      const pos = readAccessor(json, views, prim.attributes.POSITION);
      const idx = readAccessor(json, views, prim.indices);
      const localBase = positions.length / 3;

      for (let i = 0; i < pos.length; i += 3) {
        const [x, y, z] = applyNode(matrix, pos[i], pos[i + 1], pos[i + 2]);
        positions.push(x, y, z);
      }
      for (let i = 0; i < idx.length; i += 1) {
        indices.push(localBase + idx[i]);
      }
    }
    void vertexBase;
  }

  return { positions, indices };
}

/** Mirrors prepareModelForScene: uniform scale to target height, yaw PI, recenter. */
function normalize(positions) {
  const bounds = () => {
    const min = [Infinity, Infinity, Infinity];
    const max = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < positions.length; i += 3) {
      for (let a = 0; a < 3; a += 1) {
        min[a] = Math.min(min[a], positions[i + a]);
        max[a] = Math.max(max[a], positions[i + a]);
      }
    }
    return { min, max };
  };

  let { min, max } = bounds();
  const scale = MODEL_TARGET_HEIGHT / (max[1] - min[1]);

  for (let i = 0; i < positions.length; i += 3) {
    positions[i] = -positions[i] * scale;
    positions[i + 1] = positions[i + 1] * scale;
    positions[i + 2] = -positions[i + 2] * scale;
  }

  ({ min, max } = bounds());
  const center = [0, 1, 2].map((a) => (min[a] + max[a]) / 2);

  for (let i = 0; i < positions.length; i += 3) {
    positions[i] -= center[0];
    positions[i + 1] -= center[1];
    positions[i + 2] -= center[2];
  }

  ({ min, max } = bounds());
  return { min, max, size: [0, 1, 2].map((a) => max[a] - min[a]) };
}

/** Frontmost (max X) surface per (z, y) cell. */
function buildHeightMap(positions, indices, box) {
  const depth = new Float32Array(GRID * GRID).fill(-Infinity);
  const zMin = box.min[2];
  const yMin = box.min[1];
  const zStep = (box.max[2] - zMin) / GRID;
  const yStep = (box.max[1] - yMin) / GRID;

  for (let t = 0; t < indices.length; t += 3) {
    const a = indices[t] * 3;
    const b = indices[t + 1] * 3;
    const c = indices[t + 2] * 3;

    const az = positions[a + 2];
    const ay = positions[a + 1];
    const bz = positions[b + 2];
    const by = positions[b + 1];
    const cz = positions[c + 2];
    const cy = positions[c + 1];

    const zLo = Math.max(0, Math.floor((Math.min(az, bz, cz) - zMin) / zStep));
    const zHi = Math.min(GRID - 1, Math.ceil((Math.max(az, bz, cz) - zMin) / zStep));
    const yLo = Math.max(0, Math.floor((Math.min(ay, by, cy) - yMin) / yStep));
    const yHi = Math.min(GRID - 1, Math.ceil((Math.max(ay, by, cy) - yMin) / yStep));

    const area = (bz - az) * (cy - ay) - (cz - az) * (by - ay);
    if (Math.abs(area) < 1e-12) continue;

    for (let zi = zLo; zi <= zHi; zi += 1) {
      const pz = zMin + (zi + 0.5) * zStep;
      for (let yi = yLo; yi <= yHi; yi += 1) {
        const py = yMin + (yi + 0.5) * yStep;

        const w0 = ((bz - pz) * (cy - py) - (cz - pz) * (by - py)) / area;
        const w1 = ((cz - pz) * (ay - py) - (az - pz) * (cy - py)) / area;
        const w2 = 1 - w0 - w1;
        if (w0 < -0.002 || w1 < -0.002 || w2 < -0.002) continue;

        const x = w0 * positions[a] + w1 * positions[b] + w2 * positions[c];
        const cell = yi * GRID + zi;
        if (x > depth[cell]) depth[cell] = x;
      }
    }
  }

  return depth;
}

/** Largest all-true rectangle that contains the seed cell (hood centre). */
function largestRectangleAt(mask, seedY, seedZ) {
  if (!mask[seedY * GRID + seedZ]) return null;

  const runAt = (yi) => {
    if (!mask[yi * GRID + seedZ]) return null;
    let lo = seedZ;
    let hi = seedZ;
    while (lo > 0 && mask[yi * GRID + lo - 1]) lo -= 1;
    while (hi < GRID - 1 && mask[yi * GRID + hi + 1]) hi += 1;
    return { lo, hi };
  };

  let best = null;

  for (let top = seedY; top >= 0; top -= 1) {
    const topRun = runAt(top);
    if (!topRun) break;

    let lo = topRun.lo;
    let hi = topRun.hi;

    for (let bottom = seedY; bottom < GRID; bottom += 1) {
      const run = runAt(bottom);
      if (!run) break;
      if (bottom > seedY) {
        lo = Math.max(lo, run.lo);
        hi = Math.min(hi, run.hi);
      }

      for (let inner = top; inner <= seedY; inner += 1) {
        const r = runAt(inner);
        if (!r) break;
        lo = Math.max(lo, r.lo);
        hi = Math.min(hi, r.hi);
      }

      if (hi < lo) break;
      const area = (hi - lo + 1) * (bottom - top + 1);
      if (!best || area > best.area) {
        best = { area, yTop: top, yBottom: bottom, zStart: lo, zEnd: hi };
      }
    }
  }

  return best;
}

const { positions, indices } = await loadTriangles();
const box = normalize(positions);
const depth = buildHeightMap(positions, indices, box);

console.log("bbox size", box.size.map((v) => v.toFixed(4)).join(" x "));
console.log("bbox min", box.min.map((v) => v.toFixed(4)).join(", "));
console.log("bbox max", box.max.map((v) => v.toFixed(4)).join(", "));
console.log("");
const zStep = (box.max[2] - box.min[2]) / GRID;
const yStep = (box.max[1] - box.min[1]) / GRID;

/** Deepest open column inside the hood footprint — seeds the cavity search. */
function findHoodSeed() {
  let best = { x: Infinity, yi: 0, zi: 0 };
  for (let yi = 0; yi < GRID; yi += 1) {
    for (let zi = 0; zi < GRID; zi += 1) {
      const d = depth[yi * GRID + zi];
      if (d === -Infinity) continue;
      const y = box.min[1] + (yi + 0.5) * yStep;
      if (y > 0.35 || y < -0.75) continue;
      if (d < best.x) best = { x: d, yi, zi };
    }
  }
  return best;
}

const seed = findHoodSeed();
console.log(
  "hood seed: backWallX",
  seed.x.toFixed(4),
  "at y",
  (box.min[1] + (seed.yi + 0.5) * yStep).toFixed(4),
  "z",
  (box.min[2] + (seed.zi + 0.5) * zStep).toFixed(4),
);
console.log("");
console.log("depthFrac  planeX    width    height   centerY   centerZ");

for (const frac of [0.06, 0.08, 0.1, 0.12, 0.14, 0.16, 0.18, 0.19, 0.2, 0.21]) {
  const planeX = box.max[0] - box.size[0] * frac;
  const mask = new Uint8Array(GRID * GRID);

  for (let i = 0; i < mask.length; i += 1) {
    mask[i] = depth[i] > -Infinity && depth[i] < planeX ? 1 : 0;
  }

  const rect = largestRectangleAt(mask, seed.yi, seed.zi);
  if (!rect) {
    console.log(`${frac.toFixed(2)}       ${planeX.toFixed(4)}   (blocked)`);
    continue;
  }

  const width = (rect.zEnd - rect.zStart + 1) * zStep;
  const height = (rect.yBottom - rect.yTop + 1) * yStep;
  const centerZ = box.min[2] + ((rect.zStart + rect.zEnd + 1) / 2) * zStep;
  const centerY = box.min[1] + ((rect.yTop + rect.yBottom + 1) / 2) * yStep;

  console.log(
    `${frac.toFixed(2)}       ${planeX.toFixed(4)}   ${width.toFixed(4)}   ` +
      `${height.toFixed(4)}   ${centerY.toFixed(4)}   ${centerZ.toFixed(4)}`,
  );
}
