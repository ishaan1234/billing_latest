"use client";
import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export const ShimmerButton = ({
    children,
    className,
    onClick,
    disabled
}: {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
}) => {
    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-xl px-8 font-medium text-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 disabled:opacity-50 disabled:cursor-not-allowed",
                // Base gradient
                "bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] animate-shimmer",
                // Override with our custom colors if needed, but the shimmer effect relies on the linear-gradient above
                "border border-slate-800 text-slate-300",
                className
            )}
        >
            <span className="relative flex items-center gap-2 z-10">{children}</span>
        </motion.button>
    );
};
