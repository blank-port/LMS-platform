import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { homepageIconMap } from '../../utils/homepageConfig';

const HomepageFeatureGrid = ({ config }) => {
    if (!config?.enabled) return null;

    return (
        <section className="relative w-full py-24 bg-[var(--surface)] overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--primary)]/20 to-transparent" />
            <div className="absolute left-0 top-20 h-64 w-64 rounded-full bg-[var(--surface-tint)] blur-[110px] opacity-60" />
            <div className="container mx-auto px-6 md:px-12 lg:px-24">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.55 }}
                    className="mx-auto mb-14 max-w-3xl text-center"
                >
                    <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[var(--primary)]">Platform Features</p>
                    <h2 className="mt-4 text-4xl md:text-5xl font-black tracking-tight text-[var(--text-main)]">{config.title}</h2>
                    <p className="mt-5 text-lg font-medium leading-relaxed text-[var(--text-muted)]">{config.subtitle}</p>
                </motion.div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {config.cards.map((card, index) => {
                        const Icon = homepageIconMap[card.icon] || homepageIconMap.Sparkles;
                        return (
                            <motion.article
                                key={`${card.title}-${index}`}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.15 }}
                                transition={{ duration: 0.45, delay: index * 0.08 }}
                                whileHover={{ y: -6 }}
                                className="group rounded-[2rem] border border-[var(--border)] bg-white/85 p-8 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur-sm"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)]">
                                        <Icon size={24} />
                                    </div>
                                    <ArrowUpRight size={18} className="text-[var(--text-muted)] transition group-hover:text-[var(--primary)] group-hover:translate-x-1 group-hover:-translate-y-1" />
                                </div>
                                <h3 className="mt-8 text-2xl font-black tracking-tight text-[var(--text-main)]">{card.title}</h3>
                                <p className="mt-4 text-base font-medium leading-7 text-[var(--text-muted)]">{card.description}</p>
                            </motion.article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default HomepageFeatureGrid;


