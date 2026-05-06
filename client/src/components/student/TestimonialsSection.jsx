import React from 'react';
import { dummyTestimonial } from '../../assets/assets';

const TestimonialsSection = ({ config }) => {
  const items = config?.items?.length ? config.items : dummyTestimonial;

  if (config?.enabled === false) return null;

  return (
    <section className="relative w-full overflow-hidden bg-[var(--surface)] py-28">
      <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-[var(--primary)]/20 to-transparent" />
      <div className="absolute top-20 right-10 h-72 w-72 rounded-full bg-[var(--accent)]/10 blur-[100px]" />
      <div className="absolute bottom-10 left-10 h-60 w-60 rounded-full bg-[var(--primary)]/10 blur-[80px]" />

      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        <div className="mx-auto mb-20 max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/20 bg-[var(--primary)]/10 px-5 py-2.5 backdrop-blur-md">
            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]">Success Stories</span>
          </div>
          <h2 className="mb-6 text-4xl font-black tracking-tight text-[var(--text-main)] md:text-5xl">
            {config?.title || 'Loved by ambitious learners'}
          </h2>
          <p className="text-lg font-medium leading-relaxed text-[var(--text-muted)]">
            {config?.subtitle || 'Showcase trust and momentum through student success stories.'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {items.map((testimonial, index) => (
            <div
              key={`${testimonial.name}-${index}`}
              className="group flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--background)] p-8 transition-all duration-500 hover:-translate-y-1 hover:border-[var(--primary)]/30 hover:shadow-xl hover:shadow-[var(--primary)]/5"
            >
              <div className="mb-6 flex items-center gap-1">
                {[...Array(5)].map((_, starIndex) => (
                  <span key={starIndex} className="text-sm text-amber-400">
                    {starIndex < Math.floor(testimonial.rating) ? '?' : '?'}
                  </span>
                ))}
              </div>

              <p className="mb-8 text-base font-medium leading-[1.9] text-[var(--text-muted)]">
                "{testimonial.feedback}"
              </p>

              <div className="mt-auto flex items-center gap-4 border-t border-[var(--border)] pt-6">
                <img
                  className="h-12 w-12 rounded-full border-2 border-[var(--surface)] object-cover shadow-md"
                  src={testimonial.image || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80'}
                  alt={testimonial.name}
                />
                <div className="flex flex-col text-left">
                  <h4 className="text-sm font-black uppercase tracking-tighter text-[var(--text-main)]">{testimonial.name}</h4>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;


