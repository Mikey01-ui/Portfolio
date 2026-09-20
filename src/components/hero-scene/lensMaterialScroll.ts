import { MeshStandardMaterial } from "three";

type LensMaterialEntry = {
  material: MeshStandardMaterial;
  baseEnv: number;
  baseRoughness: number;
  baseOpacity: number;
  isGlass: boolean;
  isMetal: boolean;
};

const entries: LensMaterialEntry[] = [];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function smoothStep(t: number): number {
  const clamped = Math.min(1, Math.max(0, t));
  return clamped * clamped * (3 - 2 * clamped);
}

export function clearLensMaterialScrollEntries(): void {
  entries.length = 0;
}

export function registerLensMaterialScrollEntry(
  material: MeshStandardMaterial,
  options: { isGlass: boolean; isMetal?: boolean },
): void {
  entries.push({
    material,
    baseEnv: material.envMapIntensity,
    baseRoughness: material.roughness,
    baseOpacity: material.opacity,
    isGlass: options.isGlass,
    isMetal: options.isMetal ?? false,
  });
}

/** Reflections climb as the lens becomes the dominant element. */
export function applyLensMaterialScrollBoost(progress: number): void {
  const t = smoothStep(progress);

  for (const entry of entries) {
    const { material, isGlass, isMetal } = entry;

    if (isGlass) {
      material.envMapIntensity = lerp(entry.baseEnv, 3.4, t);
      material.roughness = lerp(entry.baseRoughness, 0.03, t);
      material.opacity = lerp(entry.baseOpacity, 0.96, t);
    } else if (isMetal) {
      material.envMapIntensity = lerp(entry.baseEnv, 2.2, t);
      material.roughness = lerp(entry.baseRoughness, 0.12, t);
      if (t > 0.62) {
        const fade = smoothStep((t - 0.62) / 0.38);
        material.transparent = true;
        material.opacity = lerp(entry.baseOpacity, 0, fade);
      }
    } else {
      material.envMapIntensity = lerp(entry.baseEnv, 1.25, t);
      if (t > 0.62) {
        const fade = smoothStep((t - 0.62) / 0.38);
        material.transparent = true;
        material.opacity = lerp(entry.baseOpacity, 0, fade);
      }
    }

    material.needsUpdate = true;
  }
}
