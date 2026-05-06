import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const ScrollBackground = () => {
    const { scrollYProgress } = useScroll();

    // Defined "Celestial Palette" (Azure -> Emerald -> Indigo -> Violet -> Slate)
    const backgroundColor = useTransform(
        scrollYProgress,
        [0, 0.25, 0.5, 0.75, 1],
        [
            '#f8fafc', // Clean Azure Slate
            '#f0fdf4', // Emerald Tint (Atmospheric)
            '#eef2ff', // Indigo Tint (Professional)
            '#f5f3ff', // Violet Tint (Creative)
            '#fdf4ff'  // Fuchsia Tint (Dynamic)
        ]
    );

    return (
        <motion.div 
            style={{ backgroundColor }}
            className="fixed inset-0 -z-20 w-full h-full pointer-events-none"
        >
            <div className="noise-grain opacity-[0.05]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.4),transparent)]" />
        </motion.div>
    );
};

export default ScrollBackground;


