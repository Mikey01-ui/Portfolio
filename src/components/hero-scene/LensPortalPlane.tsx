"use client";

import { useEffect, useMemo } from "react";
import { useTexture } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { ClampToEdgeWrapping, DoubleSide, SRGBColorSpace } from "three";

import { LENS_PORTAL } from "@/components/hero-scene/constants";

useTexture.preload(LENS_PORTAL.imagePath);

/** Largest quad with the photo's aspect that still fits the hood cavity. */
function fitToCavity(image: unknown, maxWidth: number, maxHeight: number) {
  const source = image as { width?: number; height?: number } | null;
  if (!source?.width || !source.height) {
    return { width: maxWidth, height: maxHeight };
  }

  const imageAspect = source.width / source.height;
  const cavityAspect = maxWidth / maxHeight;

  return imageAspect > cavityAspect
    ? { width: maxWidth, height: maxWidth / imageAspect }
    : { width: maxHeight * imageAspect, height: maxHeight };
}

/** Photo on the inner matte-box screen (faces out through the hood). */
type LensPortalPlaneProps = {
  position: readonly [number, number, number];
  maxWidth: number;
  maxHeight: number;
  onSized: (width: number, height: number) => void;
};

export function LensPortalPlane({
  position,
  maxWidth,
  maxHeight,
  onSized,
}: LensPortalPlaneProps) {
  const invalidate = useThree((state) => state.invalidate);
  const texture = useTexture(LENS_PORTAL.imagePath, (loaded) => {
    loaded.wrapS = ClampToEdgeWrapping;
    loaded.wrapT = ClampToEdgeWrapping;
    loaded.colorSpace = SRGBColorSpace;
  });

  const { width, height } = useMemo(
    () => fitToCavity(texture.image, maxWidth, maxHeight),
    [texture, maxWidth, maxHeight],
  );

  useEffect(() => {
    onSized(width, height);
    invalidate();
  }, [height, invalidate, onSized, width]);

  return (
    <group position={position}>
      <mesh rotation={[0, -Math.PI / 2, 0]} renderOrder={12}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial
          map={texture}
          map-colorSpace={SRGBColorSpace}
          toneMapped={false}
          side={DoubleSide}
          polygonOffset
          polygonOffsetFactor={-2}
          polygonOffsetUnits={-2}
        />
      </mesh>
    </group>
  );
}
