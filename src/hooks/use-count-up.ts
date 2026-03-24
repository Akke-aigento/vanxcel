import { useEffect, useState } from "react";
import { useScrollReveal } from "./use-scroll-reveal";

export const useCountUp = (target: number, duration: number = 1500) => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.3 });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setValue(Math.round(eased * target));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, target, duration]);

  return { ref, value, isVisible };
};
