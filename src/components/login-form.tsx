"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { GlassCard } from "@/components/ui/glass-card";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Sparkles } from "lucide-react";

export function LoginForm({ onLogin }: { onLogin: () => void }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const validUser = process.env.NEXT_PUBLIC_ADMIN_USERNAME;
        const validPass = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

        if (username === validUser && password === validPass) {
            onLogin();
        } else {
            setError("Invalid credentials. Please try again.");
        }
    };

    return (
        <AuroraBackground>
            <motion.div
                initial={{ opacity: 0.5, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                    delay: 0.3,
                    duration: 0.8,
                    ease: "easeInOut",
                }}
                className="relative z-10 w-full max-w-md px-4"
            >
                <GlassCard className="border-white/40">
                    <div className="text-center mb-8 space-y-2">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            className="w-12 h-12 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-6"
                        >
                            <Sparkles className="text-white" size={24} />
                        </motion.div>
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-stone-800 to-stone-500 dark:from-stone-100 dark:to-stone-400 tracking-tight">
                            Welcome Back
                        </h1>
                        <p className="text-stone-500 dark:text-stone-400 text-sm font-medium tracking-wide uppercase">
                            Aastha Apparel Atelier
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="group">
                                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 ml-1 group-focus-within:text-violet-600 transition-colors">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full px-4 py-3.5 bg-white/50 border border-stone-200/60 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all placeholder:text-stone-400 text-stone-800 font-medium"
                                    placeholder="Enter your username"
                                />
                            </div>

                            <div className="group">
                                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 ml-1 group-focus-within:text-violet-600 transition-colors">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3.5 bg-white/50 border border-stone-200/60 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all placeholder:text-stone-400 text-stone-800 font-medium"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                            >
                                <p className="text-red-600 text-xs text-center font-bold tracking-wide">{error}</p>
                            </motion.div>
                        )}

                        <ShimmerButton className="w-full h-14 text-lg shadow-xl shadow-indigo-500/20 rounded-2xl">
                            Sign In to Dashboard
                        </ShimmerButton>
                    </form>
                </GlassCard>
            </motion.div>
        </AuroraBackground>
    );
}
