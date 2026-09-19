import {
  Color,
  Mesh,
  MeshStandardMaterial,
  type Object3D,
} from "three";

import {
  isGlassPartName,
  isMetalPartName,
} from "@/components/hero-scene/lensParts";
import { registerLensMaterialScrollEntry } from "@/components/hero-scene/lensMaterialScroll";
import { SCENE_PERFORMANCE } from "@/components/hero-scene/scenePerformance";

export function enhanceSceneMaterials(root: Object3D): void {
  root.traverse((object) => {
    if (!(object instanceof Mesh)) {
      return;
    }

    const { name } = object;

    if (isGlassPartName(name) && SCENE_PERFORMANCE.useCheapLensMaterial) {
      const glass = new MeshStandardMaterial({
        color: new Color("#0a121c"),
        metalness: 0.08,
        roughness: 0.065,
        transparent: true,
        opacity: 0.9,
        envMapIntensity: 1.45,
      });
      object.material = glass;
      registerLensMaterialScrollEntry(glass, { isGlass: true });
      return;
    }

    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material];

    for (const material of materials) {
      if (!(material instanceof MeshStandardMaterial)) {
        continue;
      }

      if (isMetalPartName(name)) {
        material.envMapIntensity = 1.1;
        material.roughness = Math.min(material.roughness, 0.28);
        material.metalness = Math.max(material.metalness, 0.88);
      } else {
        material.envMapIntensity = 0.75;
      }

      material.needsUpdate = true;
      registerLensMaterialScrollEntry(material, {
        isGlass: false,
        isMetal: isMetalPartName(name),
      });
    }
  });
}
