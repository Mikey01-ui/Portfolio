"use client";

import { useCallback, useMemo, useRef, useState, type RefObject } from "react";
import type { Group, Object3D } from "three";

import { CameraModel } from "@/components/hero-scene/CameraModel";
import { HeroCamera } from "@/components/hero-scene/HeroCamera";
import { HeroScrollRigRegistration } from "@/components/hero-scene/HeroScrollRigRegistration";
import { LensPortalPlane } from "@/components/hero-scene/LensPortalPlane";
import {
  MODEL_COMPOSITION_OFFSET,
  MODEL_TARGET_HEIGHT,
} from "@/components/hero-scene/constants";
import type { PreparedModelMetrics } from "@/components/hero-scene/normalizeModel";
import { useHeroPresentationTimeline } from "@/hooks/useHeroPresentationTimeline";

const DEFAULT_FOCUS_Y = MODEL_TARGET_HEIGHT / 2;
const DEFAULT_LENS_LOCAL: readonly [number, number, number] = [0, DEFAULT_FOCUS_Y, 0];

type SceneSubjectProps = {
  titleRef: RefObject<HTMLElement | null>;
  titleReady: boolean;
};

export function SceneSubject({ titleRef, titleReady }: SceneSubjectProps) {
  const [focusY, setFocusY] = useState(DEFAULT_FOCUS_Y);
  const [lensFocusLocal, setLensFocusLocal] =
    useState<readonly [number, number, number]>(DEFAULT_LENS_LOCAL);
  const [lensFacingYaw, setLensFacingYaw] = useState(-Math.PI / 2);
  const [cavity, setCavity] = useState({ width: 0.49, height: 0.44 });
  const [portalSize, setPortalSize] = useState({ width: 0.25, height: 0.44 });
  const [modelReady, setModelReady] = useState(false);

  const subjectRef = useRef<Group>(null);
  const focusRigRef = useRef<Group>(null);
  const lensAnchorRef = useRef<Object3D>(null);
  const stageRef = useRef<Group>(null);

  const presentationReady = modelReady && titleReady;

  useHeroPresentationTimeline({
    enabled: presentationReady,
    subjectRef,
    stageRef,
    titleRef,
  });

  const focusPoint = useMemo(
    () =>
      [
        MODEL_COMPOSITION_OFFSET[0],
        focusY + MODEL_COMPOSITION_OFFSET[1],
        MODEL_COMPOSITION_OFFSET[2],
      ] as const,
    [focusY],
  );

  const handlePortalSized = useCallback((width: number, height: number) => {
    setPortalSize((current) =>
      current.width === width && current.height === height
        ? current
        : { width, height },
    );
  }, []);

  const handleModelPrepared = useCallback((metrics: PreparedModelMetrics) => {
    setFocusY(metrics.focusY);
    setLensFocusLocal(metrics.lensFocusLocal);
    setLensFacingYaw(metrics.lensFacingYaw);
    setCavity((current) =>
      current.width === metrics.lensCavityWidth &&
      current.height === metrics.lensCavityHeight
        ? current
        : { width: metrics.lensCavityWidth, height: metrics.lensCavityHeight },
    );
    setModelReady(true);
  }, []);

  return (
    <>
      <HeroScrollRigRegistration
        active={modelReady}
        focusRigRef={focusRigRef}
        lensAnchorRef={lensAnchorRef}
        focusPoint={focusPoint}
        lensFacingYaw={lensFacingYaw}
        lensPortalWidth={portalSize.width}
        lensPortalHeight={portalSize.height}
      />
      <HeroCamera focusPoint={focusPoint} />
      <group
        ref={stageRef}
        position={[
          MODEL_COMPOSITION_OFFSET[0],
          MODEL_COMPOSITION_OFFSET[1],
          MODEL_COMPOSITION_OFFSET[2],
        ]}
      >
        <group ref={focusRigRef}>
          <group ref={subjectRef}>
            <CameraModel onPrepared={handleModelPrepared} />
            <object3D
              ref={lensAnchorRef}
              position={[
                lensFocusLocal[0],
                lensFocusLocal[1],
                lensFocusLocal[2],
              ]}
            />
            <LensPortalPlane
              position={lensFocusLocal}
              maxWidth={cavity.width}
              maxHeight={cavity.height}
              onSized={handlePortalSized}
            />
          </group>
        </group>
      </group>
    </>
  );
}
