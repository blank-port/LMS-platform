import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import CourseCard from './CourseCard';
import { Link } from 'react-router-dom';

const CoursesSection = () => {
  const { allCourses } = useContext(AppContext);

  return (
    <section className="py-28 bg-[var(--background)] relative overflow-hidden w-full">
      {/* Subtle Background Decoration */}
      <div className="absolute top-40 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] opacity-50"></div>
      <div className="absolute bottom-20 left-0 w-72 h-72 bg-purple-500/5 rounded-full blur-[80px] opacity-40"></div>

      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        <div className="text-center max-w-3xl mx-auto mb-20 relative z-10">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-5 py-2.5 rounded-full mb-6 backdrop-blur-md">
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Premium Catalog</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-[var(--text-main)] mb-6 tracking-tight">
            Learn from the <span className="bg-gradient-to-r from-[#7C32FF] to-[#FF3278] bg-clip-text text-transparent">World's Best</span>
          </h2>
          <p className="text-[var(--text-muted)] text-lg font-medium leading-relaxed">
            Explore our curated selection of high-quality courses designed to help you master new skills and advance your career with confidence.
          </p>
        </div>

        {allCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 px-4 md:px-0 relative z-10">
            {allCourses.slice(0, 4).map((course, index) => (
              <CourseCard key={index} course={course} />
            ))}
          </div>
        ) : (
          <div className="relative z-10 mb-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-4 md:px-0">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-video bg-white/5"></div>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between">
                      <div className="h-5 w-24 bg-white/5 rounded-md"></div>
                      <div className="h-5 w-12 bg-white/5 rounded-full"></div>
                    </div>
                    <div className="h-6 w-full bg-white/5 rounded-md"></div>
                    <div className="h-4 w-3/4 bg-white/5 rounded-md"></div>
                    <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                      <div className="h-7 w-20 bg-white/5 rounded-md"></div>
                      <div className="h-10 w-10 bg-white/5 rounded-2xl"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-[var(--text-muted)] mt-8 text-sm font-medium">Loading courses from server...</p>
          </div>
        )}

        <div className="text-center relative z-10">
          <Link
            to="/course-list"
            onClick={() => window.scrollTo(0, 0)}
            className="inline-flex items-center gap-4 px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#7C32FF] transition-all shadow-xl hover:shadow-purple-500/20 active:scale-95 group"
          >
            Explore all courses
            <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;
