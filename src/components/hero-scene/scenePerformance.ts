export const SCENE_PERFORMANCE = {
  /** Fixed 1x pixel ratio — biggest win on high-DPI displays. */
  dpr: 1,
  /** Only re-render when the scene changes (GSAP calls invalidate). */
  frameloop: "demand" as const,
  /** Full-screen passes are expensive on a ~650k-vert model. */
  enablePostProcessing: false,
  /** Lens scroll: DOF + vignette only (lighter than full cinematic stack). */
  enableLensSequenceFx: true,
  /** Dynamic shadow maps + this mesh = stutter. ContactShadows only. */
  enableDirectionalShadows: false,
  /** Low-res HDR probe — enough for metal/glass highlights. */
  environmentResolution: 128,
  contactShadowResolution: 256,
  /** Skip expensive transmission shader on lens glass. */
  useCheapLensMaterial: true,
} as const;
