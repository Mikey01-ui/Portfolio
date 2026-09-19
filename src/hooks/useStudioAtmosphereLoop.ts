"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";

/**
 * Keeps `frameloop="demand"` alive for subtle atmosphere (dust, haze)
 * without running a full 60fps scene loop.
 */
export function useStudioAtmosphereLoop(fps = 24) {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    invalidate();
    const intervalMs = 1000 / fps;
    const id = window.setInterval(() => invalidate(), intervalMs);
    return () => window.clearInterval(id);
  }, [fps, invalidate]);
}
