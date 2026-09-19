"use client";

import { useLayoutEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import type { Group } from "three";
import { Mesh } from "three";

import { CAMERA_MODEL_PATH } from "@/components/hero-scene/constants";
import { enhanceSceneMaterials } from "@/components/hero-scene/enhanceSceneMaterials";
import { clearLensMaterialScrollEntries } from "@/components/hero-scene/lensMaterialScroll";
import {
  prepareModelForScene,
  type PreparedModelMetrics,
} from "@/components/hero-scene/normalizeModel";
useGLTF.preload(CAMERA_MODEL_PATH);

function configureMeshShadows(root: Group) {
  root.traverse((object) => {
    if (!(object instanceof Mesh)) {
      return;
    }

    object.castShadow = false;
    object.receiveShadow = false;
  });
}

type CameraModelProps = {
  onPrepared?: (metrics: PreparedModelMetrics) => void;
};

export function CameraModel({ onPrepared }: CameraModelProps) {
  const invalidate = useThree((state) => state.invalidate);
  const { scene } = useGLTF(CAMERA_MODEL_PATH);

  const { model, metrics } = useMemo(() => {
    clearLensMaterialScrollEntries();
    const clone = scene.clone(true);
    configureMeshShadows(clone);
    const prepared = prepareModelForScene(clone);
    enhanceSceneMaterials(clone);
    return { model: clone, metrics: prepared };
  }, [scene]);

  useLayoutEffect(() => {
    onPrepared?.(metrics);
    invalidate();
  }, [metrics, onPrepared, invalidate]);

  return <primitive object={model} />;
}
