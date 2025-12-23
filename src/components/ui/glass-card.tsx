"use client";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface GlassCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

export function GlassCard({ children, className, hoverEffect = false, ...props }: GlassCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={hoverEffect ? { y: -5, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)" } : undefined}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={cn(
                "relative overflow-hidden rounded-3xl border border-white/20 bg-white/70 p-8 backdrop-blur-xl shadow-xl transition-all",
                "before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-br before:from-white/40 before:to-white/10 before:opacity-0 before:transition-opacity hover:before:opacity-100",
                className
            )}
            {...props}
        >
            {/* Noise texture overlay for premium feel */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
            {children}
        </motion.div>
    );
}
