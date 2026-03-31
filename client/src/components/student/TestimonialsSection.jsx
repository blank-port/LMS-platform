import React from 'react';
import { assets, dummyTestimonial } from '../../assets/assets';

const TestimonialsSection = () => {
  return (
    <section className="py-28 bg-[var(--surface)] relative overflow-hidden w-full">
      {/* Subtle Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent"></div>
      <div className="absolute top-20 right-10 w-72 h-72 bg-purple-600/5 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-10 left-10 w-60 h-60 bg-indigo-600/5 rounded-full blur-[80px]"></div>

      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-5 py-2.5 rounded-full mb-6 backdrop-blur-md">
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Success Stories</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-[var(--text-main)] mb-6 tracking-tight">
            Loved by <span className="bg-gradient-to-r from-[#7C32FF] to-[#FF3278] bg-clip-text text-transparent">Thousands</span> of Learners
          </h2>
          <p className="text-[var(--text-muted)] text-lg font-medium leading-relaxed">
            Don't just take our word for it. See what our students from around the world have to say about their experience with PrismEd.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dummyTestimonial.map((testimonial, index) => (
            <div key={index} className="bg-[var(--background)] border border-[var(--border)] rounded-2xl flex flex-col p-8 transition-all duration-500 hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 group">
              <div className="flex items-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-amber-400 text-sm">
                    {i < Math.floor(testimonial.rating) ? '★' : '☆'}
                  </span>
                ))}
              </div>

              <p className="text-[var(--text-muted)] text-base font-medium leading-[1.9] mb-8">
                "{testimonial.feedback}"
              </p>

              <div className="mt-auto flex items-center gap-4 pt-6 border-t border-[var(--border)]">
                <img className="h-12 w-12 rounded-full border-2 border-[var(--surface)] shadow-md object-cover" src={testimonial.image} alt={testimonial.name} />
                <div className="flex flex-col text-left">
                  <h4 className="text-sm font-black text-[var(--text-main)] uppercase tracking-tighter">{testimonial.name}</h4>
                  <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{testimonial.role}</p>
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
