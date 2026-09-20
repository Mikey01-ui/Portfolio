"use client";

import { useRef, type RefObject } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useThree } from "@react-three/fiber";
import type { Group } from "three";

import { CAMERA_DROP_ANIMATION } from "@/components/hero-scene/constants";
import { resetSubjectDropTransform } from "@/hooks/heroPresentation/dropBounce";
import { addCameraDropPhase } from "@/hooks/heroPresentation/phases";

gsap.registerPlugin(useGSAP);

export type CameraDropTimelineOptions = {
  enabled?: boolean;
  restY?: number;
  startY?: number;
};

export type CameraDropTimelineResult = {
  timelineRef: RefObject<gsap.core.Timeline | null>;
};

/**
 * Drop-only timeline. Prefer `useHeroPresentationTimeline` for the full sequence.
 */
export function useCameraDropTimeline(
  subjectRef: RefObject<Group | null>,
  options: CameraDropTimelineOptions = {},
): CameraDropTimelineResult {
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const invalidate = useThree((state) => state.invalidate);

  const enabled = options.enabled ?? true;
  const restY = options.restY ?? CAMERA_DROP_ANIMATION.restY;
  const startY = options.startY ?? CAMERA_DROP_ANIMATION.startY;

  useGSAP(
    () => {
      const subject = subjectRef.current;
      if (!enabled || !subject) {
        return;
      }

      subject.position.y = startY;
      invalidate();

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        onUpdate: () => invalidate(),
        onComplete: () => {
          resetSubjectDropTransform(subject, restY);
          invalidate();
        },
      });

      timelineRef.current = timeline;
      addCameraDropPhase(timeline, subject, { startY, restY });

      return () => {
        timeline.kill();
        timelineRef.current = null;
      };
    },
    {
      dependencies: [enabled, invalidate, restY, startY],
      revertOnUpdate: true,
    },
  );

  return { timelineRef };
}
