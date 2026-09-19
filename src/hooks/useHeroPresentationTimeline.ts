"use client";

import { useRef, type RefObject } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useThree } from "@react-three/fiber";
import type { Group } from "three";

import {
  MODEL_COMPOSITION_OFFSET,
  PRESENTATION_REVEAL,
} from "@/components/hero-scene/constants";
import {
  addCameraDropPhase,
  addSlideAndTitlePhase,
} from "@/hooks/heroPresentation/phases";

gsap.registerPlugin(useGSAP);

export type HeroPresentationTimelineOptions = {
  enabled?: boolean;
  subjectRef: RefObject<Group | null>;
  stageRef: RefObject<Group | null>;
  titleRef: RefObject<HTMLElement | null>;
};

export function useHeroPresentationTimeline({
  enabled = false,
  subjectRef,
  stageRef,
  titleRef,
}: HeroPresentationTimelineOptions) {
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const invalidate = useThree((state) => state.invalidate);

  const stageStartX = MODEL_COMPOSITION_OFFSET[0];
  const stageEndX = stageStartX - PRESENTATION_REVEAL.slideX;

  useGSAP(
    () => {
      const subject = subjectRef.current;
      const stage = stageRef.current;
      const titleRoot = titleRef.current;

      if (!enabled || !subject || !stage || !titleRoot) {
        return;
      }

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        onUpdate: () => invalidate(),
        onComplete: () => {
          subject.position.y = 0;
          stage.position.x = stageEndX;
          invalidate();
        },
      });

      timelineRef.current = timeline;

      addCameraDropPhase(timeline, subject);
      addSlideAndTitlePhase(timeline, {
        stage,
        titleRoot,
        stageStartX,
        stageEndX,
      });

      return () => {
        timeline.kill();
        timelineRef.current = null;
      };
    },
    {
      dependencies: [
        enabled,
        invalidate,
        stageEndX,
        stageRef,
        stageStartX,
        subjectRef,
        titleRef,
      ],
      revertOnUpdate: true,
    },
  );

  return { timelineRef };
}
