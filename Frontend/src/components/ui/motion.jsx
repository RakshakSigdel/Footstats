import { motion } from "framer-motion";

// ─── SPRING CONFIGS ───
export const spring = { type: "spring", stiffness: 320, damping: 24 };
export const springBouncy = { type: "spring", stiffness: 400, damping: 17 };
export const springSmooth = { type: "spring", stiffness: 200, damping: 30 };

// ─── PAGE VARIANTS ───
export const pageVariants = {
  initial: { opacity: 0, y: 24, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.08 },
  },
  exit: { opacity: 0, y: -12, scale: 0.98, transition: { duration: 0.25, ease: "easeIn" } },
};

// ─── LIST / ITEM VARIANTS ───
export const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

// ─── FADE VARIANTS ───
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export const fadeInScale = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

// ─── STAGGER CONTAINER ───
export const staggerContainer = (staggerValue = 0.08) => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: staggerValue, delayChildren: 0.05 },
  },
});

// ─── MOTION BUTTON ───
export function MotionButton({ children, className = "", ...props }) {
  return (
    <motion.button
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.96, y: 0 }}
      transition={spring}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
}

// ─── MOTION CARD (NEW) ───
export function MotionCard({ children, className = "", delay = 0, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{
        y: -4,
        scale: 1.01,
        boxShadow: "0 20px 40px -12px rgba(0,0,0,0.15)",
        transition: { duration: 0.25, ease: "easeOut" },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// ─── MOTION ICON (NEW) ───
export function MotionIcon({ children, className = "", ...props }) {
  return (
    <motion.span
      whileHover={{ scale: 1.15, rotate: 5 }}
      whileTap={{ scale: 0.9 }}
      transition={springBouncy}
      className={`inline-flex ${className}`}
      {...props}
    >
      {children}
    </motion.span>
  );
}
