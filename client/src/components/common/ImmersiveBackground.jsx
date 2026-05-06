import React from 'react';
import { motion } from 'framer-motion';

const ImmersiveBackground = () => {
    return (
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[var(--background)]">
            {/* Animated Mesh Core */}
            <svg className="absolute inset-0 h-full w-full opacity-40 mix-blend-multiply" xmlns="http://www.w3.org/2000/svg">
                <filter id="liquid-filter">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="80" result="blur" />
                    <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" result="liquid" />
                </filter>
                <g filter="url(#liquid-filter)">
                    <motion.circle
                        animate={{
                            cx: ['10%', '30%', '10%'],
                            cy: ['20%', '50%', '20%'],
                        }}
                        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                        r="35%"
                        fill="hsla(171, 77%, 26%, 0.12)"
                    />
                    <motion.circle
                        animate={{
                            cx: ['90%', '60%', '90%'],
                            cy: ['10%', '40%', '10%'],
                        }}
                        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                        r="40%"
                        fill="hsla(189, 94%, 43%, 0.1)"
                    />
                    <motion.circle
                        animate={{
                            cx: ['20%', '60%', '20%'],
                            cy: ['80%', '40%', '80%'],
                        }}
                        transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
                        r="30%"
                        fill="hsla(38, 92%, 50%, 0.08)"
                    />
                    <motion.circle
                        animate={{
                            cx: ['80%', '40%', '80%'],
                            cy: ['90%', '60%', '90%'],
                        }}
                        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
                        r="35%"
                        fill="hsla(171, 77%, 26%, 0.08)"
                    />
                </g>
            </svg>

            {/* Overlays */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--background)] via-transparent to-white/20" />
            <div className="noise-grain" />

            {/* Soft Ambient Light Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-300/10 rounded-full blur-[140px]" />
            <div className="absolute bottom-[-15%] right-[-5%] w-[800px] h-[800px] bg-cyan-200/10 rounded-full blur-[160px]" />
        </div>
    );
};

export default ImmersiveBackground;


