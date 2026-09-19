"use client";

import { forwardRef } from "react";

import { LightRays } from "@/components/hero-scene/LightRays";
import { TITLE_LIGHT_RAYS } from "@/components/hero-scene/constants";

/** Renders above the title and blends onto NANAGANABA (not blocked by a full-screen layer). */
export const HeroTitleLightRays = forwardRef<HTMLDivElement>(
  function HeroTitleLightRays(_props, ref) {
    return (
      <div
        ref={ref}
        className="pointer-events-none absolute inset-0 z-[25] [isolation:isolate]"
        aria-hidden
      >
        <LightRays
          raysOrigin={TITLE_LIGHT_RAYS.origin}
          raysColor={TITLE_LIGHT_RAYS.color}
          raysSpeed={TITLE_LIGHT_RAYS.speed}
          lightSpread={TITLE_LIGHT_RAYS.spread}
          rayLength={TITLE_LIGHT_RAYS.length}
          followMouse={TITLE_LIGHT_RAYS.followMouse}
          mouseInfluence={TITLE_LIGHT_RAYS.mouseInfluence}
          noiseAmount={TITLE_LIGHT_RAYS.noiseAmount}
          distortion={TITLE_LIGHT_RAYS.distortion}
          fadeDistance={TITLE_LIGHT_RAYS.fadeDistance}
          saturation={TITLE_LIGHT_RAYS.saturation}
          initialMousePosition={TITLE_LIGHT_RAYS.aimAtTitle}
          className="h-full w-full mix-blend-screen opacity-50 sm:opacity-[0.95]"
        />
      </div>
    );
  },
);
