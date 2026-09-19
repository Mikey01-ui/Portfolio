import { Box3, type Object3D, Vector3 } from "three";

import {
  LENS_OPENING,
  MODEL_TARGET_HEIGHT,
  MODEL_Y_ROTATION,
} from "@/components/hero-scene/constants";

export type PreparedModelMetrics = {
  height: number;
  focusY: number;
  /** Matte box screen center, in subject-local space. */
  lensFocusLocal: readonly [number, number, number];
  /** Rig yaw that points the lens axis straight at the viewer (+Z). */
  lensFacingYaw: number;
  /** Usable cavity at the screen depth (model units) — quad must fit inside. */
  lensCavityWidth: number;
  lensCavityHeight: number;
};

/** Centers the model in space — no floor anchor (suspended in void). */
export function prepareModelForScene(root: Object3D): PreparedModelMetrics {
  const box = new Box3().setFromObject(root);
  const size = new Vector3();
  box.getSize(size);

  const scale = MODEL_TARGET_HEIGHT / Math.max(size.y, 0.0001);
  root.scale.multiplyScalar(scale);
  root.rotation.y = MODEL_Y_ROTATION;

  box.setFromObject(root);
  const center = new Vector3();
  box.getCenter(center);

  root.position.set(-center.x, -center.y, -center.z);

  box.setFromObject(root);
  box.getCenter(center);
  box.getSize(size);

  const halfY = size.y / 2;
  const halfZ = size.z / 2;

  const depthInset = size.x * LENS_OPENING.depthIntoHood;
  const lensFocus = new Vector3(
    box.max.x - depthInset,
    center.y + halfY * LENS_OPENING.centerY,
    center.z + halfZ * LENS_OPENING.centerZ,
  );

  const lensCavityWidth = size.z * LENS_OPENING.spanZ * LENS_OPENING.innerFit;
  const lensCavityHeight = size.y * LENS_OPENING.spanY * LENS_OPENING.innerFit;

  /** Yaw that rotates the body→lens axis onto world +Z (facing the camera). */
  const lensFacingYaw = -Math.atan2(
    lensFocus.x - center.x,
    lensFocus.z - center.z,
  );

  return {
    height: MODEL_TARGET_HEIGHT,
    focusY: center.y,
    lensFocusLocal: [lensFocus.x, lensFocus.y, lensFocus.z] as const,
    lensFacingYaw,
    lensCavityWidth,
    lensCavityHeight,
  };
}
