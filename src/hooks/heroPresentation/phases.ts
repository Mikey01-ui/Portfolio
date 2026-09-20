import gsap from "gsap";
import type { Group } from "three";

import {
  CAMERA_DROP_ANIMATION,
  PRESENTATION_REVEAL,
} from "@/components/hero-scene/constants";
import { addCameraDropBounces } from "@/hooks/heroPresentation/dropBounce";

type DropPhaseConfig = {
  startY?: number;
  restY?: number;
};

export function addCameraDropPhase(
  timeline: gsap.core.Timeline,
  subject: Group,
  config: DropPhaseConfig = {},
): void {
  const restY = config.restY ?? CAMERA_DROP_ANIMATION.restY;
  const startY = config.startY ?? CAMERA_DROP_ANIMATION.startY;

  addCameraDropBounces(timeline, subject, {
    ...CAMERA_DROP_ANIMATION,
    restY,
    startY,
  });
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
  const titleBlock = titleRoot.querySelector<HTMLElement>("[data-hero-block]");
  const charRow = titleRoot.querySelector<HTMLElement>("[data-hero-char-row]");

  const isWideLayout =
    typeof window !== "undefined" &&
    window.matchMedia("(min-width: 640px)").matches;
  const drag = isWideLayout
    ? PRESENTATION_REVEAL.titleDrag
    : PRESENTATION_REVEAL.titleDrag.mobile;
  const dragOrigin = isWideLayout ? "100% 50%" : "50% 100%";

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
    );

  if (titleBlock) {
    gsap.set(titleBlock, { transformOrigin: dragOrigin });
    timeline.fromTo(
      titleBlock,
      { x: 0, scaleX: 1, skewX: 0 },
      {
        x: drag.blockX,
        scaleX: drag.blockScaleX,
        skewX: drag.blockSkewX,
        duration: slideDuration,
        ease: slideEase,
      },
      "reveal",
    );
  }

  if (charRow) {
    gsap.set(charRow, { gap: drag.gapFrom });
    timeline.fromTo(
      charRow,
      { gap: drag.gapFrom },
      {
        gap: drag.gapTo,
        duration: slideDuration,
        ease: slideEase,
      },
      "reveal",
    );
  }

  chars.forEach((char, index) => {
    const scaleX = drag.charScaleX[index] ?? drag.charScaleX.at(-1) ?? 1;
    const isFirst = index === 0;
    const isLast = index === chars.length - 1;
    const charOrigin =
      isFirst && !isLast
        ? "100% 50%"
        : isLast && !isFirst
          ? "0% 50%"
          : "50% 50%";

    gsap.set(char, { transformOrigin: charOrigin });
    timeline.fromTo(
      char,
      { scaleX: 1 },
      {
        scaleX,
        duration: slideDuration * 0.92,
        ease: slideEase,
      },
      "reveal+=0.12",
    );
  });

  if (tagline) {
    timeline.fromTo(
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
    );
  }

  timeline.addLabel("complete", ">");
}
