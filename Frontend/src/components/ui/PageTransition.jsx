import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export const pageItemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3, ease: [0.4, 0, 1, 1] },
  },
};

export const pageContainerVariants = {
  initial: {},
  animate: {
    transition: {
      delay: 0.15,
      delayChildren: 0.15,
      staggerChildren: 0.12,
      when: "beforeChildren",
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.1,
      staggerDirection: 1,
      when: "beforeChildren",
    },
  },
};

export const pageSectionStaggerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.12,
      when: "beforeChildren",
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.1,
      staggerDirection: 1,
      when: "beforeChildren",
    },
  },
};

export function PageTransitionItem({ children, className = "", ...props }) {
  return (
    <motion.div
      variants={pageItemVariants}
      data-page-transition-item="true"
      className={`[will-change:transform,opacity] ${className}`.trim()}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export default function PageTransition({ children, className = "min-h-full" }) {
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Fallback: if Framer Motion doesn't reliably fire `onAnimationComplete`
  // (can happen with interrupted transitions), make sure pointer-events
  // never get stuck, which would break clickability of tabs/buttons.
  useEffect(() => {
    if (!isTransitioning) return;
    const timeoutId = window.setTimeout(() => {
      setIsTransitioning(false);
    }, 1200);
    return () => window.clearTimeout(timeoutId);
  }, [isTransitioning]);

  return (
    <motion.div
      variants={pageContainerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      onAnimationStart={() => setIsTransitioning(true)}
      onAnimationComplete={() => setIsTransitioning(false)}
      className={`${className} ${isTransitioning ? "pointer-events-none" : ""}`.trim()}
    >
      {children}
    </motion.div>
  );
}
