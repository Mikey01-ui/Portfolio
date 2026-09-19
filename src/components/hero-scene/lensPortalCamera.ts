import { LENS_TRANSITION } from "@/components/hero-scene/constants";

/**
 * Dolly distance so the whole portal plane (full photo) fits in the viewport — no crop.
 */
export function getCameraDistanceToFitLensPortal(
  fovVerticalDeg: number,
  viewportAspect: number,
  portalWidth: number,
  portalHeight: number,
): number {
  const fovRad = (fovVerticalDeg * Math.PI) / 180;
  const halfTanV = Math.tan(fovRad / 2);
  const halfTanH = halfTanV * Math.max(viewportAspect, 0.5);

  const dForHeight = portalHeight / (2 * halfTanV);
  const dForWidth = portalWidth / (2 * halfTanH);
  const padding = LENS_TRANSITION.zoomIntoLens.fitPadding;

  return Math.max(dForHeight, dForWidth) * padding;
}

/** Closest dolly distance so the portal plane covers the viewport (crop inside lens). */
export function getCameraDistanceToFillLensPortal(
  fovVerticalDeg: number,
  viewportAspect: number,
  portalWidth: number,
  portalHeight: number,
): number {
  const fovRad = (fovVerticalDeg * Math.PI) / 180;
  const halfTanV = Math.tan(fovRad / 2);
  const halfTanH = halfTanV * Math.max(viewportAspect, 0.5);

  const dForHeight = portalHeight / (2 * halfTanV);
  const dForWidth = portalWidth / (2 * halfTanH);
  const overshoot = LENS_TRANSITION.zoomIntoLens.fillOvershoot;

  return Math.min(dForHeight, dForWidth) * overshoot;
}
