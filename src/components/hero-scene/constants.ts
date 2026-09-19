export const CAMERA_MODEL_PATH = "/models/1930s_movie_camera.web.glb";

/** Y rotation so the camera's right side faces the viewer (was showing left). */
export const MODEL_Y_ROTATION = Math.PI;

export const SCENE_BACKGROUND = "#000000";

export const HDR_ENVIRONMENT = {
  preset: "studio" as const,
  intensity: 0.38,
  rotation: [0, 0.35, 0] as const,
};

/** Sparse studio dust — warm key + cool rim; not snow/smoke. */
export const STUDIO_DUST = {
  count: 88,
  seed: 0x9e_37_79_b9,
  pointSize: 0.072,
  motionSpeed: 0.14,
  targetFps: 24,
  bounds: {
    x: [-1.1, 2.4] as const,
    y: [-0.2, 1.55] as const,
    z: [-1.4, 1.6] as const,
  },
} as const;

export const POST_PROCESSING = {
  bloom: {
    intensity: 0.32,
    luminanceThreshold: 0.82,
    luminanceSmoothing: 0.88,
    levels: 5,
  },
  contrast: {
    brightness: -0.025,
    contrast: 0.16,
  },
  vignette: {
    offset: 0.24,
    darkness: 0.72,
  },
} as const;

export const MODEL_TARGET_HEIGHT = 1.62;

/**
 * Lens/matte-box opening as fractions of the model's half-extents.
 * The web GLB merges meshes by material, so the lens can't be found by name —
 * these are measured against the normalized bounding box instead.
 */
/** Image shown inside the lens / matte-box opening. */
export const LENS_PORTAL = {
  imagePath: "/images/lens-portal/film-set-01.png",
} as const;

/**
 * Matte-box cavity, measured from the GLB by `scripts/measure-lens-cavity.mjs`.
 * The hood's back wall blocks anything past ~0.21 depth, so the screen sits just
 * in front of it. Values are fractions of the normalized bbox.
 */
export const LENS_OPENING = {
  /** Depth into the hood from the outer +X face (fraction of bbox length). */
  depthIntoHood: 0.185,
  /** Cavity centre, as fractions of the Y/Z half-extents. */
  centerY: -0.31,
  centerZ: -0.217,
  /** Usable cavity at that depth (fractions of full bbox Z / Y). */
  spanZ: 0.62,
  spanY: 0.283,
  /** Clearance so the quad never touches the hood walls. */
  innerFit: 0.96,
} as const;

/** DOM photo that takes over from the 3D lens at the end of the zoom. */
export const LENS_PHOTO = {
  aspect: 1024 / 682,
  /** DOM photo scale — matches the lens opening at handoff (final hero frame). */
  lensWindowScale: 0.52,
} as const;

/** Lift subject slightly above frame center — floating in void. */
export const MODEL_COMPOSITION_OFFSET = [0, 0.22, 0] as const;

export const COMPANY_TITLE = "NANAGANABA";

/** Light rays (React Bits / OGL) — top-right column, locked on NANAGANABA. */
export const TITLE_LIGHT_RAYS = {
  origin: "top-right" as const,
  color: "#00ffff",
  speed: 1.05,
  spread: 0.92,
  length: 2.15,
  followMouse: false,
  mouseInfluence: 0.96,
  noiseAmount: 0.08,
  distortion: 0.04,
  fadeDistance: 1.35,
  saturation: 0.98,
  /** Viewport-normalized center of the NANAGANABA stack (unchanged title layout). */
  aimAtTitle: { x: 0.74, y: 0.5 },
};

export const CAMERA_DROP_ANIMATION = {
  restY: 0,
  startY: 3.75,
} as const;

export const PRESENTATION_REVEAL = {
  slideX: 0.88,
  slideDuration: 1.45,
  slideEase: "power3.inOut",
  titleStagger: 0.042,
  titleDuration: 0.78,
  /** Beat after landing before slide + title (seconds). */
  revealDelay: 0.18,
} as const;

export const HERO_CAMERA = {
  position: [-2.8, 1.52, 5.35] as const,
  fov: 30,
  near: 0.05,
  far: 50,
};

/** Scroll-scrubbed lens transition (single master timeline). */
export const LENS_TRANSITION = {
  /** Must cover all phase durations below (+ ~100vh for the pinned viewport). */
  sectionHeightVh: 400,
  scrubSmoothing: 1.15,
  phaseDuration: {
    /** Yaw right until the lens barrel points at the viewer. */
    faceLens: 3.2,
    /** Dolly into the lens opening (rotation held). */
    zoomIntoLens: 2.8,
    /** Hold the 3D lens frame — hero ends before the DOM photo overlay. */
    holdAtLens: 1.0,
  },
  /**
   * Step 1 — rig yaws to `lensFacingYaw` (computed from the model's lens axis)
   * while the camera slides onto that axis, so the lens is square to the screen.
   */
  faceLens: {
    /** Camera distance from the lens anchor, straight down the lens axis. */
    cameraDistance: 4.1,
    cameraFov: 28,
    /** Slight height offset above the lens center (eye-line feel). */
    cameraOffsetY: 0.03,
  },
  /** Step 2 — dolly until the full portal image fits in frame (no crop). */
  zoomIntoLens: {
    cameraFov: 26,
    cameraOffsetY: 0,
    /** Fit inside lens (full photo visible in the hood). */
    fitPadding: 1.04,
    /** Cover fill during the last part of the 3D zoom (<1 = closer). */
    fillOvershoot: 0.78,
  },
} as const;

/** Scroll-driven lens hero: DOF, vignette, reflections. */
export const LENS_SEQUENCE_FX = {
  bokehScale: 2.65,
  focalLength: 0.028,
  dofResolution: 480,
  focusRangeMin: 0.08,
  focusRangeMax: 2.4,
  vignetteDarknessMax: 0.92,
  vignetteOffsetBoost: 0.08,
} as const;

export const KEY_LIGHT = {
  position: [-5, 6.2, 3.8] as const,
  intensity: 2.55,
  color: "#ffd8a8",
  shadowMapSize: 1024,
  shadowRadius: 3,
};

export const FILL_LIGHT = {
  position: [3.5, 2.2, 4.2] as const,
  intensity: 0.32,
  color: "#a8b4c4",
};

export const RIM_LIGHT = {
  position: [2.8, 4.2, -5.2] as const,
  intensity: 3.6,
  color: "#4d8fff",
};

export const AMBIENT_LIGHT = {
  intensity: 0.06,
  color: "#121218",
};
