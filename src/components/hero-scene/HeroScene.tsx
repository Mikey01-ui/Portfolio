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
        className="relative min-h-svh w-full bg-[#080808] text-[#f0ede6] flex flex-col justify-between px-5 py-7 sm:px-10 sm:py-10 overflow-hidden selection:bg-[#c8ff00] selection:text-black"
        aria-label="Cinematic 3D Camera Rig"
      >
        {/* Ambient atmospheric backdrop glow with Miltomy brand green */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30 -z-0"
          style={{
            background:
              "radial-gradient(circle at 50% 28%, rgba(200, 255, 0, 0.14) 0%, rgba(200, 255, 0, 0.03) 42%, transparent 70%)",
          }}
        />

        {/* Top bar indicators in Miltomy box style */}
        <div className="relative z-10 flex items-center justify-between w-full">
          <div className="border border-[#222222] bg-[#111111] rounded-md px-3 py-1.5 text-[10px] sm:text-[11px] font-mono tracking-widest uppercase text-[#888888]">
            WebGL Showcase
          </div>
          <div className="inline-flex items-center gap-2 border border-[#c8ff00]/30 bg-[#c8ff00]/10 rounded-md px-3 py-1.5 text-[10px] sm:text-[11px] font-mono font-semibold text-[#c8ff00]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c8ff00] shadow-[0_0_8px_#c8ff00] animate-pulse" />
            DESKTOP EXPERIENCE ONLY
          </div>
        </div>

        {/* Hero showcase card in Miltomy box style */}
        <div className="relative z-10 flex flex-col items-center justify-center my-auto py-5 text-center max-w-md mx-auto w-full">
          <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden shadow-2xl border border-[#222222] bg-[#111111] mb-5 group">
            <img
              src={`${basePath}/images/camera-3d-preview.jpg`}
              alt="1930s 3D Studio Movie Camera"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-black/25 to-transparent pointer-events-none" />
            <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
              <span className="text-[11px] font-mono font-bold tracking-widest text-[#c8ff00] drop-shadow-sm">
                1930s VINTAGE RIG
              </span>
              <span className="text-[10px] text-[#888888] font-mono">
                60 FPS • GLSL
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono font-semibold tracking-widest uppercase text-[#c8ff00]">
              WEBGL + THREE.JS
            </span>
            <span className="text-neutral-600 font-mono">•</span>
            <span className="text-[10px] font-mono text-[#888888]">
              02
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f0ede6] uppercase mb-2">
            Cinematic 3D Camera Rig
          </h1>

          <p className="text-xs sm:text-sm text-[#888888] leading-relaxed mb-5 font-normal">
            Scroll-driven 3D vintage camera hero with physical drop bounce, custom volumetric lighting shaders, and optical lens zoom.
          </p>

          {/* Miltomy Box Style Info Card */}
          <div className="bg-[#111111] border border-[#222222] rounded-lg p-4 sm:p-5 text-left w-full shadow-lg">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-[#f0ede6] mb-1.5 font-mono uppercase tracking-wider">
              <div className="w-6 h-6 rounded bg-[#c8ff00]/10 border border-[#c8ff00]/30 flex items-center justify-center text-[#c8ff00] shrink-0">
                <svg className="w-3.5 h-3.5 text-[#c8ff00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-[#c8ff00]">Optimized for Laptop & Desktop</span>
            </div>
            <p className="text-[11px] text-[#888888] leading-relaxed pl-8.5">
              To preserve mobile battery and performance, the interactive 3D WebGL viewport and scroll dolly are active on desktop screens (≥ 1024px).
            </p>
          </div>
        </div>

        {/* Footer Tech Stack Tags in Miltomy box style */}
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-1.5 max-w-md mx-auto pt-2">
          {["React Three Fiber", "Three.js", "GSAP ScrollTrigger", "GLSL Shaders", "Next.js"].map((tech) => (
            <span
              key={tech}
              className="border border-[#222222] bg-[#111111] px-2.5 py-1 rounded-md text-[10px] text-[#888888] font-mono hover:border-[#c8ff00]/40 hover:text-[#c8ff00] transition-colors"
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
