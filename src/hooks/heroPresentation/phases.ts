import gsap from "gsap";
import type { Group } from "three";

import {
  CAMERA_DROP_ANIMATION,
  PRESENTATION_REVEAL,
} from "@/components/hero-scene/constants";

type DropPhaseConfig = {
  startY: number;
  restY: number;
};

export function addCameraDropPhase(
  timeline: gsap.core.Timeline,
  subject: Group,
  config: DropPhaseConfig = CAMERA_DROP_ANIMATION,
): void {
  const { startY, restY } = config;

  subject.position.y = startY;

  timeline
    .addLabel("drop", 0)
    .fromTo(
      subject.position,
      { y: startY },
      {
        y: restY - 0.028,
        duration: 1.08,
        ease: "power3.in",
      },
      "drop",
    )
    .addLabel("impact", ">")
    .to(
      subject.position,
      {
        y: restY + 0.04,
        duration: 0.16,
        ease: "power2.out",
      },
      "impact",
    )
    .addLabel("settle", ">")
    .to(
      subject.position,
      {
        y: restY,
        duration: 0.44,
        ease: "power3.out",
      },
      "settle",
    )
    .addLabel("dropComplete", ">");
}

type SlideAndTitlePhaseOptions = {
  stage: Group;
  titleRoot: HTMLElement;
  stageStartX: number;
  stageEndX: number;
};

export function addSlideAndTitlePhase(
  timeline: gsap.core.Timeline,
  options: SlideAndTitlePhaseOptions,
): void {
  const { stage, titleRoot, stageStartX, stageEndX } = options;
  const { slideDuration, slideEase, titleStagger, titleDuration, revealDelay } =
    PRESENTATION_REVEAL;

  const chars = titleRoot.querySelectorAll<HTMLElement>("[data-hero-char]");
  const tagline = titleRoot.querySelector<HTMLElement>("[data-hero-tagline]");
  const accent = titleRoot.querySelector<HTMLElement>("[data-hero-accent]");

  stage.position.x = stageStartX;

  timeline
    .addLabel("reveal", `dropComplete+=${revealDelay}`)
    .to(
      stage.position,
      { x: stageEndX, duration: slideDuration, ease: slideEase },
      "reveal",
    )
    .to(titleRoot, { opacity: 1, duration: 0.35, ease: "power2.out" }, "reveal")
    .fromTo(
      accent,
      { scaleX: 0, transformOrigin: "100% 50%" },
      { scaleX: 1, duration: 0.85, ease: "power3.inOut" },
      "reveal+=0.1",
    )
    .fromTo(
      chars,
      {
        opacity: 0,
        y: 56,
        rotateZ: -7,
        transformOrigin: "50% 100%",
      },
      {
        opacity: 1,
        y: 0,
        rotateZ: 0,
        duration: titleDuration,
        stagger: titleStagger,
        ease: "power3.out",
      },
      "reveal+=0.2",
    )
    .fromTo(
      tagline,
      { opacity: 0, x: 28, letterSpacing: "0.38em" },
      {
        opacity: 0.75,
        x: 0,
        letterSpacing: "0.24em",
        duration: 1.05,
        ease: "power2.out",
      },
      "reveal+=0.55",
    )
    .addLabel("complete", ">");
}
