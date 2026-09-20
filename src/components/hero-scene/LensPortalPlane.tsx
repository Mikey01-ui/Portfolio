"use client";

import { useEffect, useMemo, useState } from "react";
import { useThree } from "@react-three/fiber";
import {
  CanvasTexture,
  ClampToEdgeWrapping,
  DoubleSide,
  LinearMipmapLinearFilter,
  SRGBColorSpace,
} from "three";

import { LENS_PORTAL } from "@/components/hero-scene/constants";

async function createLensPortalTexture(): Promise<CanvasTexture> {
  const {
    canvasWidth,
    canvasHeight,
    background,
    textColor,
    label,
    fontFamily,
    fontWeight,
    textureScale,
  } = LENS_PORTAL;

  const scale = textureScale;
  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth * scale;
  canvas.height = canvasHeight * scale;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    const fallback = new CanvasTexture(canvas);
    fallback.colorSpace = SRGBColorSpace;
    return fallback;
  }

  ctx.scale(scale, scale);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const fontSize = Math.round(canvasHeight * 0.13);
  const fontSpec = `${fontWeight} ${fontSize}px ${fontFamily}`;

  if (typeof document !== "undefined" && document.fonts) {
    await document.fonts.ready;
    try {
      await document.fonts.load(fontSpec);
    } catch {
      // Montserrat may already be loaded via next/font.
    }
  }

  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.fillStyle = textColor;
  ctx.font = fontSpec;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  /** Plane faces into the hood — mirror draw so zoom reads left-to-right. */
  ctx.save();
  ctx.translate(canvasWidth, 0);
  ctx.scale(-1, 1);
  ctx.fillText(label, canvasWidth / 2, canvasHeight / 2);
  ctx.restore();

  const texture = new CanvasTexture(canvas);
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  texture.colorSpace = SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.needsUpdate = true;

  return texture;
}

/** Largest quad with the portal aspect that still fits the hood cavity. */
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
  const gl = useThree((state) => state.gl);
  const [texture, setTexture] = useState<CanvasTexture | null>(null);

  useEffect(() => {
    let active = true;
    let created: CanvasTexture | null = null;

    void createLensPortalTexture().then((next) => {
      if (!active) {
        next.dispose();
        return;
      }
      created = next;
      setTexture(next);
      invalidate();
    });

    return () => {
      active = false;
      created?.dispose();
    };
  }, [invalidate]);

  const { width, height } = useMemo(
    () =>
      texture
        ? fitToCavity(texture.image, maxWidth, maxHeight)
        : { width: maxWidth, height: maxHeight },
    [texture, maxWidth, maxHeight],
  );

  useEffect(() => {
    if (!texture) {
      return;
    }
    const maxAniso = gl.capabilities.getMaxAnisotropy();
    texture.anisotropy = Math.min(16, maxAniso);
    texture.needsUpdate = true;
    onSized(width, height);
    invalidate();
  }, [gl, height, invalidate, onSized, texture, width]);

  if (!texture) {
    return null;
  }

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
