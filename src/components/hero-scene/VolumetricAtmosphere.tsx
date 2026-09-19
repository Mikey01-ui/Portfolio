"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BackSide,
  Color,
  DoubleSide,
  Quaternion,
  ShaderMaterial,
  Vector3,
} from "three";

import { KEY_LIGHT, RIM_LIGHT } from "@/components/hero-scene/constants";
import {
  lightShaftFragmentShader,
  lightShaftVertexShader,
  voidHazeFragmentShader,
  voidHazeVertexShader,
} from "@/components/hero-scene/volumetricAtmosphereShaders";

const focus = new Vector3(0, 0.95, 0);
const up = new Vector3(0, 1, 0);

function getShaftTransform(lightPosition: readonly [number, number, number]) {
  const origin = new Vector3(...lightPosition);
  const direction = focus.clone().sub(origin).normalize();
  const midpoint = origin.clone().lerp(focus, 0.42);
  const quaternion = new Quaternion().setFromUnitVectors(up, direction);
  return { midpoint, quaternion };
}

export function VolumetricAtmosphere() {
  const hazeRef = useRef<ShaderMaterial>(null);

  const keyShaft = useMemo(
    () => getShaftTransform(KEY_LIGHT.position),
    [],
  );
  const rimShaft = useMemo(
    () => getShaftTransform(RIM_LIGHT.position),
    [],
  );

  useFrame((state) => {
    if (hazeRef.current) {
      hazeRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <group>
      <mesh renderOrder={-2}>
        <sphereGeometry args={[7.5, 24, 16]} />
        <shaderMaterial
          ref={hazeRef}
          uniforms={{
            uTime: { value: 0 },
            uWarm: { value: new Color(KEY_LIGHT.color) },
            uCool: { value: new Color(RIM_LIGHT.color) },
          }}
          vertexShader={voidHazeVertexShader}
          fragmentShader={voidHazeFragmentShader}
          transparent
          depthWrite={false}
          side={BackSide}
          blending={AdditiveBlending}
        />
      </mesh>

      <mesh
        position={keyShaft.midpoint}
        quaternion={keyShaft.quaternion}
        renderOrder={-1}
      >
        <cylinderGeometry args={[0.05, 1.35, 5.8, 20, 1, true]} />
        <shaderMaterial
          uniforms={{
            uColor: { value: new Color(KEY_LIGHT.color) },
            uOpacity: { value: 0.055 },
          }}
          vertexShader={lightShaftVertexShader}
          fragmentShader={lightShaftFragmentShader}
          transparent
          depthWrite={false}
          side={DoubleSide}
          blending={AdditiveBlending}
        />
      </mesh>

      <mesh
        position={rimShaft.midpoint}
        quaternion={rimShaft.quaternion}
        renderOrder={-1}
      >
        <cylinderGeometry args={[0.04, 1.05, 4.6, 16, 1, true]} />
        <shaderMaterial
          uniforms={{
            uColor: { value: new Color(RIM_LIGHT.color) },
            uOpacity: { value: 0.035 },
          }}
          vertexShader={lightShaftVertexShader}
          fragmentShader={lightShaftFragmentShader}
          transparent
          depthWrite={false}
          side={DoubleSide}
          blending={AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
