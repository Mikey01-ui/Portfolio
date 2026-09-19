"use client";

import { SCENE_BACKGROUND } from "@/components/hero-scene/constants";

export function CinematicBackground() {
  return <color attach="background" args={[SCENE_BACKGROUND]} />;
}
