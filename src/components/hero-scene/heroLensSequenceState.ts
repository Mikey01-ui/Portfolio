import { Vector3 } from "three";

/** Updated by scroll timeline; read by DOF + materials (demand frameloop). */
export const heroLensSequenceState = {
  progress: 0,
  lensWorld: new Vector3(),
};

export function setHeroLensSequenceProgress(
  progress: number,
  lensWorld?: Vector3,
): void {
  heroLensSequenceState.progress = Math.min(1, Math.max(0, progress));
  if (lensWorld) {
    heroLensSequenceState.lensWorld.copy(lensWorld);
  }
}
