"use client";

import { forwardRef } from "react";

import { COMPANY_TITLE } from "@/components/hero-scene/constants";

export const HeroTitle = forwardRef<HTMLDivElement>(function HeroTitle(_, ref) {
  const characters = COMPANY_TITLE.split("");

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-end justify-center px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(3.5rem,env(safe-area-inset-top))] sm:items-center sm:justify-end sm:px-0 sm:pb-[8vh] sm:pt-[10vh] sm:pl-[clamp(1.5rem,5vw,3rem)] sm:pr-[clamp(5rem,14vw,11rem)]">
      <div ref={ref} className="opacity-0" data-hero-root>
        <div
          data-hero-block
          className="w-full max-w-[min(100%,56rem)] text-center sm:max-w-[min(56rem,62vw)] sm:text-right"
        >
          <div
            data-hero-accent
            className="mx-auto mb-4 h-px w-[min(12rem,70vw)] bg-gradient-to-r from-transparent via-[#7eb8ff]/70 to-[#7eb8ff] sm:mx-0 sm:mb-6 sm:ml-auto sm:w-[min(16rem,48vw)]"
          />
          <h1
            className="font-[family-name:var(--font-manuka)] text-[clamp(2.5rem,13.5vw,9.25rem)] leading-[0.88] tracking-[0.04em] text-[#f4f6fb] sm:tracking-[0.05em]"
            aria-label={COMPANY_TITLE}
          >
            <span className="sr-only">{COMPANY_TITLE}</span>
            <span aria-hidden className="inline-flex flex-wrap justify-center gap-[0.04em] sm:justify-end">
              {characters.map((character, index) => (
                <span
                  key={`${character}-${index}`}
                  data-hero-char
                  className="inline-block will-change-transform"
                >
                  {character}
                </span>
              ))}
            </span>
          </h1>
          <p
            data-hero-tagline
            className="mt-5 font-[family-name:var(--font-inter)] text-[clamp(0.7rem,1.45vw,0.95rem)] font-medium uppercase text-[#8fa3bc]"
          >
            Motion · Light · Story
          </p>
        </div>
      </div>
    </div>
  );
});
