"use client";

import { useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  DepthOfField,
  EffectComposer,
  SMAA,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction, DepthOfFieldEffect, VignetteEffect } from "postprocessing";
import { Vector3 } from "three";

import { heroLensSequenceState } from "@/components/hero-scene/heroLensSequenceState";
import { LENS_SEQUENCE_FX, POST_PROCESSING } from "@/components/hero-scene/constants";
import { SCENE_PERFORMANCE } from "@/components/hero-scene/scenePerformance";

function smoothStep(t: number): number {
  const clamped = Math.min(1, Math.max(0, t));
  return clamped * clamped * (3 - 2 * clamped);
}

export function LensSequenceEffects() {
  const dofRef = useRef<DepthOfFieldEffect>(null);
  const vignetteRef = useRef<VignetteEffect>(null);
  const camera = useThree((state) => state.camera);
  const [focusTarget] = useState(() => new Vector3());

  useFrame(() => {
    if (!SCENE_PERFORMANCE.enableLensSequenceFx) {
      return;
    }

    const t = smoothStep(heroLensSequenceState.progress);
    const vignetteFade = 1 - smoothStep(Math.min(1, Math.max(0, (t - 0.55) / 0.45)));
    const textLockT = smoothStep(Math.min(1, Math.max(0, (t - 0.72) / 0.28)));
    const lensWorld = heroLensSequenceState.lensWorld;
    focusTarget.copy(lensWorld);

    const dof = dofRef.current;
    if (dof?.target) {
      dof.target.copy(lensWorld);
      dof.bokehScale = LENS_SEQUENCE_FX.bokehScale * t * (1 - textLockT);
      dof.cocMaterial.uniforms.focusDistance.value =
        camera.position.distanceTo(lensWorld);
      dof.cocMaterial.uniforms.focusRange.value = LENS_SEQUENCE_FX.focusRangeMin +
        (LENS_SEQUENCE_FX.focusRangeMax - LENS_SEQUENCE_FX.focusRangeMin) *
          (1 - t);
    }

    const vignette = vignetteRef.current;
    if (vignette) {
      const base = POST_PROCESSING.vignette.darkness;
      vignette.darkness =
        (base + (LENS_SEQUENCE_FX.vignetteDarknessMax - base) * t) *
        vignetteFade;
      vignette.offset =
        (POST_PROCESSING.vignette.offset +
          LENS_SEQUENCE_FX.vignetteOffsetBoost * t) *
        vignetteFade;
    }
  });

  if (!SCENE_PERFORMANCE.enableLensSequenceFx) {
    return null;
  }

  return (
    <EffectComposer multisampling={4} enableNormalPass={false}>
      <SMAA />
      <DepthOfField
        ref={dofRef}
        target={focusTarget}
        focalLength={LENS_SEQUENCE_FX.focalLength}
        bokehScale={0}
        height={LENS_SEQUENCE_FX.dofResolution}
      />
      <Vignette
        ref={vignetteRef}
        offset={POST_PROCESSING.vignette.offset}
        darkness={POST_PROCESSING.vignette.darkness}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  );
}
