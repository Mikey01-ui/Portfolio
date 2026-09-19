"use client";

import { useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Vector3 } from "three";

import { LENS_TRANSITION } from "@/components/hero-scene/constants";
import type { HeroLensTransitionDomRefs } from "@/components/hero-scene/heroLensTransitionDom";
import { setHeroLensSequenceProgress } from "@/components/hero-scene/heroLensSequenceState";
import {
  heroScrollRigBridge,
  isHeroScrollRigBridgeReady,
} from "@/components/hero-scene/heroScrollRigBridge";
import { applyLensMaterialScrollBoost } from "@/components/hero-scene/lensMaterialScroll";
import { getCameraDistanceToFitLensPortal } from "@/components/hero-scene/lensPortalCamera";
import { getLensTransitionScrollEnd } from "@/components/hero-scene/lensScrollDistance";

gsap.registerPlugin(useGSAP, ScrollTrigger);

function smoothStep(t: number): number {
  const clamped = Math.min(1, Math.max(0, t));
  return clamped * clamped * (3 - 2 * clamped);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export type HeroLensTransitionScrollOptions = {
  enabled?: boolean;
  pinViewportRef: RefObject<HTMLElement | null>;
  domRefs: HeroLensTransitionDomRefs;
};

export function useHeroLensTransitionScroll({
  enabled = false,
  pinViewportRef,
  domRefs,
}: HeroLensTransitionScrollOptions) {
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const lookTarget = useRef(new Vector3());
  const lensWorld = useRef(new Vector3());
  const bodyLookAt = useRef(new Vector3(0, 0.22, 0));
  const introCameraPosition = useRef(new Vector3());
  const axisCameraPosition = useRef(new Vector3());

  useGSAP(
    () => {
      const pinViewport = pinViewportRef.current;
      if (!enabled || !pinViewport || !isHeroScrollRigBridgeReady()) {
        return;
      }

      const focusRig = heroScrollRigBridge.focusRig;
      const lensAnchor = heroScrollRigBridge.lensAnchor;
      const camera = heroScrollRigBridge.camera;
      const invalidate = heroScrollRigBridge.invalidate;

      if (!focusRig || !lensAnchor || !camera || !invalidate) {
        return;
      }

      const lensFacingYaw = heroScrollRigBridge.lensFacingYaw;
      bodyLookAt.current.set(...heroScrollRigBridge.focusPoint);
      introCameraPosition.current.copy(camera.position);
      const introFov = camera.fov;

      const { titleRef, lightRaysRef } = domRefs;

      const { phaseDuration: pd, faceLens, zoomIntoLens } = LENS_TRANSITION;
      const threeDPhaseEnd = pd.faceLens + pd.zoomIntoLens;

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          id: "hero-lens-pin",
          trigger: pinViewport,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          start: "top top",
          end: getLensTransitionScrollEnd,
          scrub: LENS_TRANSITION.scrubSmoothing,
          invalidateOnRefresh: true,
        },
      });

      timelineRef.current = timeline;

      /** Step 1 — square the lens to the screen (rotation only). */
      timeline.addLabel("faceLens", 0);
      timeline.to(
        focusRig.rotation,
        {
          x: 0,
          y: lensFacingYaw,
          duration: pd.faceLens,
          ease: "power2.inOut",
        },
        "faceLens",
      );

      /** Step 2 — hold rotation; camera dollies down the lens axis. */
      timeline.addLabel("zoomIntoLens", `faceLens+=${pd.faceLens}`);
      timeline.to({}, { duration: pd.zoomIntoLens }, "zoomIntoLens");

      if (titleRef.current) {
        timeline.to(
          titleRef.current,
          { opacity: 0, duration: pd.faceLens * 0.4, ease: "power2.out" },
          "faceLens+=0.1",
        );
      }
      if (lightRaysRef.current) {
        timeline.to(
          lightRaysRef.current,
          { opacity: 0, duration: pd.faceLens * 0.45, ease: "power2.out" },
          "faceLens+=0.15",
        );
      }

      /** Final beat — rest looking through the 3D lens (before the DOM photo). */
      timeline.addLabel("holdAtLens", `zoomIntoLens+=${pd.zoomIntoLens}`);
      timeline.to({}, { duration: pd.holdAtLens }, "holdAtLens");

      timeline.eventCallback("onUpdate", () => {
        const time = timeline.time();
        const faceT = smoothStep(Math.min(1, time / pd.faceLens));
        const zoomT = smoothStep(
          Math.min(1, Math.max(0, (time - pd.faceLens) / pd.zoomIntoLens)),
        );
        const threeDProgress = Math.min(1, time / threeDPhaseEnd);

        lensAnchor.getWorldPosition(lensWorld.current);

        const viewportAspect =
          typeof window !== "undefined"
            ? window.innerWidth / Math.max(window.innerHeight, 1)
            : 16 / 9;
        const endFov = zoomIntoLens.cameraFov;
        const fitDistance = getCameraDistanceToFitLensPortal(
          endFov,
          viewportAspect,
          heroScrollRigBridge.lensPortalWidth,
          heroScrollRigBridge.lensPortalHeight,
        );

        /** Lens axis is world +Z once the rig reaches `lensFacingYaw`. */
        const distance = lerp(faceLens.cameraDistance, fitDistance, zoomT);
        const offsetY = lerp(
          faceLens.cameraOffsetY,
          zoomIntoLens.cameraOffsetY,
          zoomT,
        );

        axisCameraPosition.current.set(
          lensWorld.current.x,
          lensWorld.current.y + offsetY,
          lensWorld.current.z + distance,
        );

        camera.position
          .copy(introCameraPosition.current)
          .lerp(axisCameraPosition.current, faceT);

        camera.fov = lerp(
          lerp(introFov, faceLens.cameraFov, faceT),
          endFov,
          zoomT,
        );

        lookTarget.current
          .copy(bodyLookAt.current)
          .lerp(lensWorld.current, faceT);

        camera.lookAt(lookTarget.current);
        camera.updateProjectionMatrix();

        setHeroLensSequenceProgress(threeDProgress, lensWorld.current);
        applyLensMaterialScrollBoost(threeDProgress);
        invalidate();
      });

      ScrollTrigger.refresh();
      requestAnimationFrame(() => ScrollTrigger.refresh());

      return () => {
        timeline.eventCallback("onUpdate", null);
        timeline.scrollTrigger?.kill();
        timeline.kill();
        timelineRef.current = null;
      };
    },
    {
      scope: pinViewportRef,
      dependencies: [domRefs, enabled, pinViewportRef],
      revertOnUpdate: false,
    },
  );

  return { timelineRef };
}
