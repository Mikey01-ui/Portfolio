"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  type Points,
  ShaderMaterial,
  Vector3,
} from "three";

import {
  FILL_LIGHT,
  KEY_LIGHT,
  MODEL_COMPOSITION_OFFSET,
  RIM_LIGHT,
  STUDIO_DUST,
} from "@/components/hero-scene/constants";
import {
  studioDustFragmentShader,
  studioDustVertexShader,
} from "@/components/hero-scene/studioDustShaders";
import { useStudioAtmosphereLoop } from "@/hooks/useStudioAtmosphereLoop";

function createSeededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1_664_525 + 1_013_904_223) >>> 0;
    return state / 0xffffffff;
  };
}

function buildDustGeometry(count: number, bounds: typeof STUDIO_DUST.bounds) {
  const geometry = new BufferGeometry();
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const sizes = new Float32Array(count);
  const rand = createSeededRandom(STUDIO_DUST.seed);

  for (let i = 0; i < count; i += 1) {
    const index = i * 3;
    positions[index] = bounds.x[0] + rand() * (bounds.x[1] - bounds.x[0]);
    positions[index + 1] = bounds.y[0] + rand() * (bounds.y[1] - bounds.y[0]);
    positions[index + 2] = bounds.z[0] + rand() * (bounds.z[1] - bounds.z[0]);
    seeds[i] = rand();
    sizes[i] = 0.6 + rand() * 0.55;
  }

  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("aSeed", new BufferAttribute(seeds, 1));
  geometry.setAttribute("aSize", new BufferAttribute(sizes, 1));

  return geometry;
}

const keyDirection = new Vector3(...KEY_LIGHT.position).normalize();
const fillDirection = new Vector3(...FILL_LIGHT.position).normalize();
const rimDirection = new Vector3(...RIM_LIGHT.position).normalize();

export function StudioDust() {
  const invalidate = useThree((state) => state.invalidate);

  useStudioAtmosphereLoop(STUDIO_DUST.targetFps);

  const geometry = useMemo(
    () => buildDustGeometry(STUDIO_DUST.count, STUDIO_DUST.bounds),
    [],
  );

  const material = useMemo(() => {
    return new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: STUDIO_DUST.pointSize },
        uMotion: { value: STUDIO_DUST.motionSpeed },
        uKeyDir: { value: keyDirection.clone() },
        uFillDir: { value: fillDirection.clone() },
        uRimDir: { value: rimDirection.clone() },
        uWarm: { value: new Color(KEY_LIGHT.color) },
        uCool: { value: new Color(FILL_LIGHT.color) },
        uRim: { value: new Color(RIM_LIGHT.color) },
      },
      vertexShader: studioDustVertexShader,
      fragmentShader: studioDustFragmentShader,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: AdditiveBlending,
    });
  }, []);

  const pointsRef = useRef<Points>(null);

  useLayoutEffect(() => {
    invalidate();
  }, [invalidate, material]);

  useFrame((state) => {
    const points = pointsRef.current;
    if (points?.material instanceof ShaderMaterial) {
      points.material.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <group
      position={[
        MODEL_COMPOSITION_OFFSET[0],
        MODEL_COMPOSITION_OFFSET[1],
        MODEL_COMPOSITION_OFFSET[2],
      ]}
    >
      <points
        ref={pointsRef}
        geometry={geometry}
        material={material}
        frustumCulled={false}
        renderOrder={5}
      />
    </group>
  );
}
