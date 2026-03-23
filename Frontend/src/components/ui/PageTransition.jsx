import { motion } from "framer-motion";

const variants = {
  initial: { opacity: 0, y: 20, scale: 0.98, filter: "blur(4px)" },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.08 },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.99,
    filter: "blur(2px)",
    transition: { duration: 0.25, ease: "easeIn" },
  },
};

export default function PageTransition({ children }) {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-full"
    >
      {children}
    </motion.div>
  );
}
