import { useScrollReveal } from "@/hooks/use-scroll-reveal";

interface SplitRevealTextProps {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  staggerMs?: number;
}

const SplitRevealText = ({
  text,
  as: Tag = "h2",
  className = "",
  staggerMs = 40,
}: SplitRevealTextProps) => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.2 });
  const words = text.split(" ");

  return (
    <Tag ref={ref as any} className={`split-reveal-container ${className}`}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.3em]">
          <span
            className="inline-block transition-all duration-500 ease-out"
            style={{
              transform: isVisible ? "translateY(0)" : "translateY(100%)",
              opacity: isVisible ? 1 : 0,
              transitionDelay: `${i * staggerMs}ms`,
            }}
          >
            {word}
          </span>
        </span>
      ))}
    </Tag>
  );
};

export default SplitRevealText;
