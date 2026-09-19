"use client";

import { Environment } from "@react-three/drei";

import { HDR_ENVIRONMENT } from "@/components/hero-scene/constants";
import { SCENE_PERFORMANCE } from "@/components/hero-scene/scenePerformance";

export function SceneEnvironment() {
  return (
    <Environment
      preset={HDR_ENVIRONMENT.preset}
      background={false}
      environmentIntensity={HDR_ENVIRONMENT.intensity}
      environmentRotation={HDR_ENVIRONMENT.rotation}
      resolution={SCENE_PERFORMANCE.environmentResolution}
    />
  );
}
