import { motion } from "framer-motion";

export default function GlobalSpinner() {
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/25 backdrop-blur-sm">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="h-12 w-12 rounded-full border-4 border-slate-200 border-t-blue-500 dark:border-slate-700 dark:border-t-blue-400"
      />
    </div>
  );
}

