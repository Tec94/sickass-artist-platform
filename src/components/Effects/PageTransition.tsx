import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { ReactNode, useEffect, useState } from "react";

export type TransitionType = "push" | "push-back" | "slide-up" | "fade";

// We can store a global state to track the transition direction
export const globalTransitionState = {
  type: "push" as TransitionType
};

export const setNextTransition = (type: TransitionType) => {
  globalTransitionState.type = type;
};

const variants = {
  push: {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-30%", opacity: 0 }
  },
  "push-back": {
    initial: { x: "-100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "30%", opacity: 0 }
  },
  "slide-up": {
    initial: { y: "100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "100%", opacity: 0 }
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  }
};

interface AnimatedRoutesProps {
  children: ReactNode;
}

export function AnimatedRoutes({ children }: AnimatedRoutesProps) {
  const location = useLocation();
  const [transition, setTransition] = useState<TransitionType>("fade");

  useEffect(() => {
    setTransition(globalTransitionState.type);
    // Reset to push after navigation defaults
    globalTransitionState.type = "push";
  }, [location.pathname]);

  const activeVariants = variants[transition];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={activeVariants}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="h-full w-full absolute top-0 left-0 bg-[#F4EFE6]"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
