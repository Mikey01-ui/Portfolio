"use client";

import { type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, type Group, type Object3D } from "three";

import { patchHeroScrollRigBridge } from "@/components/hero-scene/heroScrollRigBridge";

type HeroScrollRigRegistrationProps = {
  focusRigRef: RefObject<Group | null>;
  lensAnchorRef: RefObject<Object3D | null>;
  focusPoint: readonly [number, number, number];
  lensFacingYaw: number;
  lensPortalWidth: number;
  lensPortalHeight: number;
  active: boolean;
};

/** Publishes the 3D rig to the DOM-side ScrollTrigger timeline. */
export function HeroScrollRigRegistration({
  focusRigRef,
  lensAnchorRef,
  focusPoint,
  lensFacingYaw,
  lensPortalWidth,
  lensPortalHeight,
  active,
}: HeroScrollRigRegistrationProps) {
  const invalidate = useThree((state) => state.invalidate);
  const camera = useThree((state) => state.camera);

  useFrame(() => {
    if (!active) {
      return;
    }

    const focusRig = focusRigRef.current;
    const lensAnchor = lensAnchorRef.current;
    if (!focusRig || !lensAnchor || !(camera instanceof PerspectiveCamera)) {
      return;
    }

    patchHeroScrollRigBridge({
      focusRig,
      lensAnchor,
      camera,
      focusPoint,
      lensFacingYaw,
      lensPortalWidth,
      lensPortalHeight,
      invalidate,
    });
  });

  return null;
}
