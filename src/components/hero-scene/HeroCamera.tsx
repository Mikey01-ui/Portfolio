"use client";

import { useLayoutEffect, useRef } from "react";
import { PerspectiveCamera } from "@react-three/drei";
import type { PerspectiveCamera as PerspectiveCameraImpl } from "three";
import { Vector3 } from "three";

import { HERO_CAMERA } from "@/components/hero-scene/constants";

type HeroCameraProps = {
  focusPoint: readonly [number, number, number];
};

export function HeroCamera({ focusPoint }: HeroCameraProps) {
  const cameraRef = useRef<PerspectiveCameraImpl>(null);
  const target = useRef(new Vector3());

  useLayoutEffect(() => {
    target.current.set(...focusPoint);
    cameraRef.current?.lookAt(target.current);
  }, [focusPoint]);

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={HERO_CAMERA.position}
      fov={HERO_CAMERA.fov}
      near={HERO_CAMERA.near}
      far={HERO_CAMERA.far}
    />
  );
}
