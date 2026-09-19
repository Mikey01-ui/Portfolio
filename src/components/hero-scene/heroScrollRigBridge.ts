import type { Group, Object3D, PerspectiveCamera } from "three";

export type HeroScrollRigBridge = {
  focusRig: Group | null;
  lensAnchor: Object3D | null;
  camera: PerspectiveCamera | null;
  focusPoint: readonly [number, number, number];
  /** Rig yaw that squares the lens to the viewer. */
  lensFacingYaw: number;
  lensPortalWidth: number;
  lensPortalHeight: number;
  invalidate: (() => void) | null;
};

export const heroScrollRigBridge: HeroScrollRigBridge = {
  focusRig: null,
  lensAnchor: null,
  camera: null,
  focusPoint: [0, 0.22, 0],
  lensFacingYaw: -Math.PI / 2,
  lensPortalWidth: 0.34,
  lensPortalHeight: 0.23,
  invalidate: null,
};

export function patchHeroScrollRigBridge(
  partial: Partial<HeroScrollRigBridge>,
): void {
  Object.assign(heroScrollRigBridge, partial);
}

export function isHeroScrollRigBridgeReady(): boolean {
  return Boolean(
    heroScrollRigBridge.focusRig &&
      heroScrollRigBridge.lensAnchor &&
      heroScrollRigBridge.camera &&
      heroScrollRigBridge.invalidate,
  );
}
