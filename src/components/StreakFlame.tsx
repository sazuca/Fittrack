import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function StreakFlame({ className, size = 20 }: { className?: string; size?: number }) {
  return (
    <span className={cn("relative inline-grid place-items-center flame-glow", className)} style={{ width: size, height: size }}>
      <motion.svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        animate={{ scale: [1, 1.08, 1], rotate: [0, -2, 2, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <defs>
          <linearGradient id="flame-grad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#ff3b00" />
            <stop offset="55%" stopColor="#ff8a00" />
            <stop offset="100%" stopColor="#ffd400" />
          </linearGradient>
        </defs>
        <path
          fill="url(#flame-grad)"
          d="M12 2c1 4-2 5-2 8a2 2 0 0 0 4 0c0 2 3 3 3 7a7 7 0 1 1-14 0c0-5 5-6 5-11 1 1 3 2 4-4z"
        />
      </motion.svg>
    </span>
  );
}
