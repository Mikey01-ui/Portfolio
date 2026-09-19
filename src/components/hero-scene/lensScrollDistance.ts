import { LENS_TRANSITION } from "@/components/hero-scene/constants";

/** Extra scroll distance (px) after the first viewport — drives scrub + pin spacer. */
export function getLensTransitionScrollEndPx(): number {
  if (typeof window === "undefined") {
    return 4600;
  }

  const extraVh = LENS_TRANSITION.sectionHeightVh - 100;
  return (window.innerHeight * extraVh) / 100;
}

export function getLensTransitionScrollEnd(): string {
  return `+=${getLensTransitionScrollEndPx()}`;
}
