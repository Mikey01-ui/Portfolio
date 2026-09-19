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

  const transitionDomRefs = useMemo<HeroLensTransitionDomRefs>(
    () => ({
      titleRef,
      canvasShellRef,
      lightRaysRef,
    }),
    [],
  );

  useHeroLensTransitionScroll({
    enabled: scrollEngineReady,
    pinViewportRef,
    domRefs: transitionDomRefs,
  });

  useLayoutEffect(() => {
    setTitleReady(Boolean(titleRef.current));
    document.documentElement.classList.add("hero-scroll-cinematic");
    document.body.classList.add("hero-scene-page");
    return () => {
      document.documentElement.classList.remove("hero-scroll-cinematic");
      document.body.classList.remove("hero-scene-page");
    };
  }, []);

  useEffect(() => {
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
  }, []);

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
