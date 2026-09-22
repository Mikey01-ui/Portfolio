"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { HeroSceneCanvas } from "@/components/hero-scene/HeroSceneCanvas";
import { HeroTitle } from "@/components/hero-scene/HeroTitle";
import { HeroTitleLightRays } from "@/components/hero-scene/HeroTitleLightRays";
import type { HeroLensTransitionDomRefs } from "@/components/hero-scene/heroLensTransitionDom";
import { isHeroScrollRigBridgeReady } from "@/components/hero-scene/heroScrollRigBridge";
import { useHeroLensTransitionScroll } from "@/hooks/useHeroLensTransitionScroll";

export function HeroScene() {
  const pinViewportRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const canvasShellRef = useRef<HTMLDivElement>(null);
  const lightRaysRef = useRef<HTMLDivElement>(null);
  const [titleReady, setTitleReady] = useState(false);
  const [scrollEngineReady, setScrollEngineReady] = useState(false);
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const checkDesktop = () => {
      // Screen width >= 1024px (Laptops / Desktops)
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  const transitionDomRefs = useMemo<HeroLensTransitionDomRefs>(
    () => ({
      titleRef,
      canvasShellRef,
      lightRaysRef,
    }),
    [],
  );

  useHeroLensTransitionScroll({
    enabled: scrollEngineReady && isDesktop === true,
    pinViewportRef,
    domRefs: transitionDomRefs,
  });

  useLayoutEffect(() => {
    if (isDesktop === true) {
      setTitleReady(Boolean(titleRef.current));
      document.documentElement.classList.add("hero-scroll-cinematic");
      document.body.classList.add("hero-scene-page");
      return () => {
        document.documentElement.classList.remove("hero-scroll-cinematic");
        document.body.classList.remove("hero-scene-page");
      };
    }
  }, [isDesktop]);

  useEffect(() => {
    if (isDesktop !== true) return;
    const syncScrollEngine = () => {
      setScrollEngineReady(isHeroScrollRigBridgeReady());
    };

    syncScrollEngine();
    const intervalId = window.setInterval(syncScrollEngine, 200);
    window.addEventListener("load", syncScrollEngine);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("load", syncScrollEngine);
    };
  }, [isDesktop]);

  const basePath = typeof window !== "undefined" && window.location.pathname.startsWith("/camera") ? "/camera" : "";

  // Initial SSR or waiting for mount
  if (isDesktop === null) {
    return <section className="min-h-svh w-full bg-black" aria-label="Loading hero scene" />;
  }

  // Mobile / Tablet fallback view (< 1024px)
  if (!isDesktop) {
    return (
      <section
        className="relative min-h-svh w-full bg-black text-[#f4f6fb] flex flex-col justify-between px-6 py-8 sm:px-12 sm:py-12 overflow-hidden selection:bg-cyan-500 selection:text-black"
        aria-label="Cinematic 3D Camera Rig"
      >
        {/* Ambient atmospheric backdrop glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 -z-0"
          style={{
            background:
              "radial-gradient(circle at 50% 30%, rgba(0, 255, 255, 0.16) 0%, rgba(200, 255, 0, 0.04) 38%, transparent 70%)",
          }}
        />

        {/* Top bar indicator */}
        <div className="relative z-10 flex items-center justify-between w-full">
          <div className="border border-white/15 rounded-full px-3.5 py-1 text-[11px] font-semibold tracking-wider uppercase text-white/80 bg-white/5 backdrop-blur-md">
            WebGL Showcase
          </div>
          <div className="inline-flex items-center gap-1.5 border border-amber-400/30 bg-amber-400/10 rounded-full px-3 py-1 text-[11px] font-medium text-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Desktop Experience Only
          </div>
        </div>

        {/* Hero showcase card */}
        <div className="relative z-10 flex flex-col items-center justify-center my-auto py-6 text-center max-w-md mx-auto w-full">
          <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl border border-white/15 mb-6 group">
            <img
              src={`${basePath}/images/camera-3d-preview.jpg`}
              alt="1930s 3D Studio Movie Camera"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent pointer-events-none" />
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between pointer-events-none">
              <span className="text-xs font-semibold tracking-widest text-cyan-300">1930s VINTAGE RIG</span>
              <span className="text-[10px] text-white/70 font-mono">60 FPS • GLSL</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-white mb-2.5">
            Cinematic 3D Camera Rig
          </h1>

          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-5 font-normal">
            Scroll-driven 3D vintage camera hero with physical drop bounce, custom volumetric lighting shaders, and optical lens zoom.
          </p>

          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 text-left w-full backdrop-blur-md shadow-lg">
            <div className="flex items-center gap-2 text-xs font-medium text-neutral-200 mb-1">
              <svg className="w-4 h-4 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Optimized for Laptop & Desktop
            </div>
            <p className="text-[11px] text-neutral-400 leading-normal">
              To preserve mobile battery and performance, the interactive 3D WebGL viewport and scroll dolly are active on desktop screens (≥ 1024px).
            </p>
          </div>
        </div>

        {/* Footer Tech Stack Tags */}
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-1.5 max-w-md mx-auto pt-2">
          {["React Three Fiber", "Three.js", "GSAP ScrollTrigger", "GLSL Shaders", "Next.js"].map((tech) => (
            <span
              key={tech}
              className="border border-white/10 bg-white/5 px-2.5 py-1 rounded-full text-[10px] text-neutral-400 font-mono"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>
    );
  }

  // Desktop / Laptop view (>= 1024px)
  return (
    <section
      className="relative overflow-x-clip bg-black"
      aria-label="Cinematic hero scene"
    >
      <div
        ref={pinViewportRef}
        className="relative h-svh w-full max-w-[100vw] overflow-x-clip"
        data-hero-pin-viewport
      >
        <div
          ref={canvasShellRef}
          className="absolute inset-0 z-0 h-full w-full"
        >
          <HeroSceneCanvas titleRef={titleRef} titleReady={titleReady} />
        </div>
        <HeroTitle ref={titleRef} />
        <HeroTitleLightRays ref={lightRaysRef} />
      </div>
    </section>
  );
}
