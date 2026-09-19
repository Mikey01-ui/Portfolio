"use client";

import {
  AMBIENT_LIGHT,
  FILL_LIGHT,
  KEY_LIGHT,
  RIM_LIGHT,
} from "@/components/hero-scene/constants";

export function SceneLights() {
  return (
    <>
      <ambientLight
        intensity={AMBIENT_LIGHT.intensity}
        color={AMBIENT_LIGHT.color}
      />
      <directionalLight
        position={KEY_LIGHT.position}
        intensity={KEY_LIGHT.intensity}
        color={KEY_LIGHT.color}
        castShadow={false}
      />
      <directionalLight
        position={FILL_LIGHT.position}
        intensity={FILL_LIGHT.intensity}
        color={FILL_LIGHT.color}
      />
      <directionalLight
        position={RIM_LIGHT.position}
        intensity={RIM_LIGHT.intensity}
        color={RIM_LIGHT.color}
      />
    </>
  );
}
