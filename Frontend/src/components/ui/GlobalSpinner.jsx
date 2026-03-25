import { motion } from "framer-motion";

export default function GlobalSpinner() {
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/30 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        {/* Animated rings */}
        <div className="relative w-14 h-14">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
            className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-sky-500 border-r-sky-300"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }}
            className="absolute inset-1.5 rounded-full border-[3px] border-transparent border-b-sky-400/60 border-l-sky-200/40"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 shadow-md shadow-sky-500/30" />
          </div>
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm font-medium text-white/80"
        >
          Loading...
        </motion.p>
      </motion.div>
    </div>
  );
}
