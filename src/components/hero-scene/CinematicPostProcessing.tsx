"use client";

import {
  Bloom,
  BrightnessContrast,
  EffectComposer,
  SMAA,
  ToneMapping,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

import { POST_PROCESSING } from "@/components/hero-scene/constants";

export function CinematicPostProcessing() {
  const { bloom, contrast, vignette } = POST_PROCESSING;

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <ToneMapping />
      <SMAA />
      <BrightnessContrast
        brightness={contrast.brightness}
        contrast={contrast.contrast}
      />
      <Bloom
        intensity={bloom.intensity}
        luminanceThreshold={bloom.luminanceThreshold}
        luminanceSmoothing={bloom.luminanceSmoothing}
        mipmapBlur
        levels={bloom.levels}
      />
      <Vignette
        offset={vignette.offset}
        darkness={vignette.darkness}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  );
}
