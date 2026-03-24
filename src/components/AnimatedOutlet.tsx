import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";

interface AnimatedOutletProps {
  children: React.ReactNode;
}

const AnimatedOutlet = ({ children }: AnimatedOutletProps) => {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState<"enter" | "exit">("enter");
  const prevKey = useRef(location.key);

  useEffect(() => {
    if (location.key !== prevKey.current) {
      setTransitionStage("exit");
    }
  }, [location.key]);

  const handleTransitionEnd = () => {
    if (transitionStage === "exit") {
      prevKey.current = location.key;
      setDisplayChildren(children);
      setTransitionStage("enter");
    }
  };

  return (
    <div
      className={`page-transition ${transitionStage === "exit" ? "page-exit" : "page-enter"}`}
      onTransitionEnd={handleTransitionEnd}
    >
      {displayChildren}
    </div>
  );
};

export default AnimatedOutlet;
