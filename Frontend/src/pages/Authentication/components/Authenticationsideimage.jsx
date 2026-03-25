import { motion } from "framer-motion";

export default function AuthenticationSideImage({ image, title, subtitle }) {
  return (
    <div className="hidden md:block w-[42%] flex-shrink-0 self-stretch relative overflow-hidden">
      <motion.img
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 8, ease: "linear" }}
        src={image}
        alt="Background"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Gradient overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, rgba(2,132,199,0.55) 0%, rgba(15,23,42,0.75) 100%)",
        }}
      />
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/60 to-transparent" />
      
      <div className="absolute inset-0 flex items-center justify-center px-10 z-10">
        <div className="text-center max-w-lg">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl font-bold leading-tight text-white font-['Outfit']"
            style={{ textShadow: '0 4px 20px rgba(0,0,0,0.4)' }}
          >
            {title}
          </motion.h1>
          {subtitle && (
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="text-white/80 text-lg mt-5 font-light leading-relaxed"
              style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}
            >
              {subtitle}
            </motion.p>
          )}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-6 mx-auto w-20 h-0.5 rounded-full bg-gradient-to-r from-sky-400 to-sky-300"
          />
        </div>
      </div>
    </div>
  );
}
