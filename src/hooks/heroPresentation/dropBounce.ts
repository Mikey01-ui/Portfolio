import gsap from "gsap";
import type { Group } from "three";

import { CAMERA_DROP_ANIMATION } from "@/components/hero-scene/constants";

type BounceStep = {
  peak: number;
  riseDuration: number;
  fallDuration: number;
};

type DropConfig = {
  restY: number;
  startY: number;
  fallDuration: number;
  bounces: readonly BounceStep[];
  postBounceHold: number;
};

export function resetSubjectDropTransform(subject: Group, restY: number): void {
  subject.position.y = restY;
  subject.scale.set(1, 1, 1);
  subject.rotation.z = 0;
}

/**
 * Drop + exactly three bounces. Each arc is sequential (no overlapping squash/wobble).
 * Rise uses sine.out, fall uses sine.in — reads like gravity, not elastic UI motion.
 */
export function addCameraDropBounces(
  timeline: gsap.core.Timeline,
  subject: Group,
  config: DropConfig = CAMERA_DROP_ANIMATION as DropConfig,
): void {
  const { restY, startY, fallDuration, bounces, postBounceHold } = config;

  subject.position.y = startY;
  subject.scale.set(1, 1, 1);
  subject.rotation.z = 0;

  timeline.addLabel("drop", 0).to(
    subject.position,
    {
      y: restY,
      duration: fallDuration,
      ease: "power3.in",
    },
    "drop",
  );

  timeline.addLabel("impact", ">");

  bounces.forEach((bounce, index) => {
    timeline.to(
      subject.position,
      {
        y: restY + bounce.peak,
        duration: bounce.riseDuration,
        ease: "sine.out",
      },
      index === 0 ? "impact" : ">",
    );

    timeline.to(subject.position, {
      y: restY,
      duration: bounce.fallDuration,
      ease: "sine.in",
    });
  });

  timeline.addLabel("bounceSettled", ">").to({}, { duration: postBounceHold });
  timeline.addLabel("dropComplete", ">");
}
