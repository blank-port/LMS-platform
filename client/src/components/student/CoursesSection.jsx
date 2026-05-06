import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContextObject.jsx';
import CourseCard from './CourseCard';

const CoursesSection = ({ config }) => {
  const { allCourses } = useContext(AppContext);

  const trendingCourses = useMemo(
    () =>
      [...allCourses]
        .filter((course) => course.enrolledStudents?.length >= 100)
        .sort((a, b) => b.enrolledStudents.length - a.enrolledStudents.length)
        .slice(0, 4),
    [allCourses]
  );

  const newestCourses = useMemo(
    () =>
      [...allCourses]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 4),
    [allCourses]
  );

  const featuredCourses = useMemo(
    () =>
      [...allCourses]
        .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
        .slice(0, 8),
    [allCourses]
  );

  const selectedCourses = useMemo(
    () =>
      [...allCourses]
        .filter((course) => config?.selectedCourseIds?.includes(course._id))
        .slice(0, 8),
    [allCourses, config?.selectedCourseIds]
  );

  const showcaseCourses =
    config?.mode === 'selected'
      ? selectedCourses
      : config?.mode === 'trending'
        ? trendingCourses
        : config?.mode === 'newest'
          ? newestCourses
          : featuredCourses;

  return (
    <section className="relative w-full space-y-32 overflow-hidden bg-[var(--background)] py-28">
      <div className="absolute top-40 right-0 h-96 w-96 rounded-full bg-[var(--accent)]/10 blur-[100px] opacity-50" />
      <div className="absolute bottom-20 left-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-[80px] opacity-40" />

      {config?.enabled !== false && (
        <div className="container mx-auto px-6 md:px-12 lg:px-24">
          <div className="relative z-10 mx-auto mb-20 max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/20 bg-[var(--primary)]/10 px-5 py-2.5 backdrop-blur-md">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--primary)]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]">Course Showcase</span>
            </div>
            <h2 className="mb-6 text-4xl font-black tracking-tight text-[var(--text-main)] md:text-5xl">
              {config?.title || 'Featured learning paths'}
            </h2>
            <p className="text-lg font-medium leading-relaxed text-[var(--text-muted)]">
              {config?.subtitle || 'Surface your strongest courses with a premium, high-conversion showcase.'}
            </p>
          </div>

          {showcaseCourses.length > 0 ? (
            <div className="relative z-10 mb-16 flex snap-x snap-mandatory gap-8 overflow-x-auto pb-4 no-scrollbar">
              {showcaseCourses.map((course) => (
                <div key={course._id} className="min-w-[320px] max-w-[360px] flex-1 snap-start">
                  <CourseCard course={course} />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}

      {trendingCourses.length > 0 && (
        <div className="container mx-auto px-6 md:px-12 lg:px-24">
          <div className="relative z-10 mb-20 flex flex-col justify-between gap-10 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <span className="mb-4 block text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">High Momentum</span>
              <h2 className="text-4xl font-black tracking-tight text-[var(--text-main)] md:text-5xl">
                Trending <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Across Platform</span>
              </h2>
            </div>
            <Link
              to="/course-list"
              className="border-b-2 border-transparent pb-1 text-sm font-black uppercase tracking-widest text-[var(--primary)] transition-all hover:border-[var(--primary)] hover:text-[var(--primary-hover)]"
            >
              View All Trending ?
            </Link>
          </div>

          <div className="relative z-10 mb-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {trendingCourses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        </div>
      )}

      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        <div className="relative z-10 mb-20 flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="mb-4 block text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">Fresh Curriculum</span>
            <h2 className="text-4xl font-black tracking-tight text-[var(--text-main)] md:text-5xl">
              New <span className="bg-gradient-to-r from-emerald-500 to-amber-500 bg-clip-text text-transparent">Arrivals</span>
            </h2>
          </div>
        </div>

        <div className="relative z-10 mb-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {newestCourses.length > 0 ? (
            newestCourses.map((course) => <CourseCard key={course._id} course={course} />)
          ) : (
            [1, 2, 3, 4].map((item) => (
              <div key={item} className="h-80 animate-pulse overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] opacity-20" />
            ))
          )}
        </div>

        <div className="relative z-10 text-center">
          <Link
            to="/course-list"
            onClick={() => window.scrollTo(0, 0)}
            className="group inline-flex items-center gap-4 rounded-2xl bg-[var(--primary)] px-12 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl transition-all active:scale-95 hover:bg-[var(--primary-hover)]"
          >
            Explore the full catalog
            <span className="text-xl transition-transform group-hover:translate-x-1">?</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;


