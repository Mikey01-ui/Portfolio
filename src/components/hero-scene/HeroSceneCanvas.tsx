"use client";

import { Suspense, type RefObject } from "react";
import { Canvas } from "@react-three/fiber";
import { Loader } from "@react-three/drei";
import { ACESFilmicToneMapping } from "three";

import { CinematicBackground } from "@/components/hero-scene/CinematicBackground";
import { CinematicPostProcessing } from "@/components/hero-scene/CinematicPostProcessing";
import { LensSequenceEffects } from "@/components/hero-scene/LensSequenceEffects";
import { SceneEnvironment } from "@/components/hero-scene/SceneEnvironment";
import { SceneLights } from "@/components/hero-scene/SceneLights";
import { SceneSubject } from "@/components/hero-scene/SceneSubject";
import { StudioDust } from "@/components/hero-scene/StudioDust";
import { VolumetricAtmosphere } from "@/components/hero-scene/VolumetricAtmosphere";
import { SCENE_PERFORMANCE } from "@/components/hero-scene/scenePerformance";
import { useResponsiveCanvasDpr } from "@/hooks/useResponsiveCanvasDpr";

type HeroSceneCanvasProps = {
  titleRef: RefObject<HTMLElement | null>;
  titleReady: boolean;
};

function HeroSceneContent({
  titleRef,
  titleReady,
}: HeroSceneCanvasProps) {
  return (
    <>
      <CinematicBackground />
      <SceneEnvironment />
      <SceneLights />
      <VolumetricAtmosphere />
      <StudioDust />
      <SceneSubject titleRef={titleRef} titleReady={titleReady} />
      {SCENE_PERFORMANCE.enablePostProcessing ? (
        <CinematicPostProcessing />
      ) : null}
      <LensSequenceEffects />
    </>
  );
}

export function HeroSceneCanvas({
  titleRef,
  titleReady,
}: HeroSceneCanvasProps) {
  const dpr = useResponsiveCanvasDpr();

  return (
    <>
      <Canvas
        className="h-full w-full touch-none"
        frameloop={SCENE_PERFORMANCE.frameloop}
        dpr={dpr}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 1.06,
        }}
      >
        <Suspense fallback={null}>
          <HeroSceneContent titleRef={titleRef} titleReady={titleReady} />
        </Suspense>
      </Canvas>
      <Loader
        containerStyles={{
          background: "#000000",
        }}
        innerStyles={{
          background: "#1a1a24",
          width: "280px",
        }}
        barStyles={{
          background: "#7eb8ff",
          height: "2px",
        }}
        dataStyles={{
          color: "#a8b4c8",
          fontFamily: "system-ui, sans-serif",
          fontSize: "12px",
        }}
      />
    </>
  );
}
