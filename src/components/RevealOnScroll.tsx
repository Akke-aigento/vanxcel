import { forwardRef } from "react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

interface RevealOnScrollProps {
  children: React.ReactNode;
  direction?: "up" | "left" | "right" | "fade";
  delay?: number;
  className?: string;
}

const directionStyles = {
  up: "translate-y-8",
  left: "translate-x-8",
  right: "-translate-x-8",
  fade: "",
};

const RevealOnScroll = forwardRef<HTMLDivElement, RevealOnScrollProps>(
  ({ children, direction = "up", delay = 0, className = "" }, _ref) => {
    const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

    return (
      <div
        ref={ref}
        className={`transition-all duration-700 ease-out ${
          isVisible
            ? "opacity-100 translate-y-0 translate-x-0"
            : `opacity-0 ${directionStyles[direction]}`
        } ${className}`}
        style={{ transitionDelay: `${delay}ms` }}
      >
        {children}
      </div>
    );
  }
);

RevealOnScroll.displayName = "RevealOnScroll";

export default RevealOnScroll;
