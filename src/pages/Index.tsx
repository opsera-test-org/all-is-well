import { motion } from "framer-motion";
import { Check } from "lucide-react";

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 overflow-hidden relative">
      {/* Soft floating circles */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full bg-accent/40 blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{ top: "-10%", right: "-10%" }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full bg-primary/10 blur-3xl"
        animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{ bottom: "-10%", left: "-5%" }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center gap-6"
      >
        {/* Checkmark circle */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
          className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/15 ring-2 ring-primary/20"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-primary"
          >
            <Check className="h-8 w-8 text-primary-foreground" strokeWidth={3} />
          </motion.div>
        </motion.div>

        {/* Text */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-5xl font-light tracking-tight text-foreground sm:text-6xl"
        >
          All is Well
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="max-w-md text-center text-lg text-muted-foreground font-light leading-relaxed"
        >
          Everything is running smoothly. No issues detected. Sit back and relax.
        </motion.p>

        {/* Pulse dot */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
          </span>
          All systems operational
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Index;
