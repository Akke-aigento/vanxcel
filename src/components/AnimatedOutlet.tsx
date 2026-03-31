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

  useEffect(() => {
    if (transitionStage === "exit") {
      const timer = setTimeout(() => {
        prevKey.current = location.key;
        setDisplayChildren(children);
        setTransitionStage("enter");
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [transitionStage, children, location.key]);

  return (
    <div
      className={`page-transition ${transitionStage === "exit" ? "page-exit" : "page-enter"}`}
    >
      {displayChildren}
    </div>
  );
};

export default AnimatedOutlet;
