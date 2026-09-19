"use client";

import { useEffect, useState } from "react";

const MOBILE_MAX_WIDTH_PX = 768;

/** Lower DPR on phones for smoother scroll + fewer GPU stalls. */
export function useResponsiveCanvasDpr(): number {
  const [dpr, setDpr] = useState(1);

  useEffect(() => {
    const mobileQuery = window.matchMedia(
      `(max-width: ${MOBILE_MAX_WIDTH_PX}px)`,
    );

    const sync = () => {
      if (mobileQuery.matches) {
        setDpr(1);
        return;
      }
      setDpr(Math.min(window.devicePixelRatio, 1.5));
    };

    sync();
    mobileQuery.addEventListener("change", sync);
    window.addEventListener("resize", sync);

    return () => {
      mobileQuery.removeEventListener("change", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  return dpr;
}
