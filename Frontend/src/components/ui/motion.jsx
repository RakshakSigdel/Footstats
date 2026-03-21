import { motion } from "framer-motion";

export const spring = { type: "spring", stiffness: 320, damping: 24 };

export const pageVariants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, staggerChildren: 0.08 } },
  exit: { opacity: 0, y: 12, transition: { duration: 0.2 } },
};

export const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export function MotionButton({ children, className = "", ...props }) {
  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97, y: 0 }}
      transition={spring}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
}

