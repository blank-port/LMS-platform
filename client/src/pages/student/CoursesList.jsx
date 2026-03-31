import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import { useParams } from 'react-router-dom';
import CourseCard from '../../components/student/CourseCard';
import SearchBar from '../../components/student/SearchBar';
import Footer from '../../components/student/Footer';

const CoursesList = () => {
  const { input } = useParams();
  const { allCourses, categories } = useContext(AppContext);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  useEffect(() => {
    let courses = allCourses;

    if (input) {
      courses = courses.filter(c =>
        c.courseTitle.toLowerCase().includes(input.toLowerCase()) ||
        c.courseDescription?.toLowerCase().includes(input.toLowerCase())
      );
    }

    if (selectedCategory) {
      courses = courses.filter(c => c.category?._id === selectedCategory);
    }

    if (selectedLevel) {
      courses = courses.filter(c => c.level === selectedLevel);
    }

    setFilteredCourses(courses);
  }, [allCourses, input, selectedCategory, selectedLevel]);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Premium Header */}
      <div className="bg-[var(--surface)] dark:bg-[#0C132B] pt-32 pb-24 relative overflow-hidden transition-all duration-500">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
        <div className="container mx-auto px-6 md:px-12 lg:px-24 relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-[var(--background)] dark:bg-white/5 border border-[var(--border)] dark:border-white/10 px-4 py-2 rounded-full mb-8">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
              <span className="text-[var(--text-muted)] dark:text-white/60 text-[10px] font-black uppercase tracking-widest leading-none">Catalog Explorer</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-[var(--text-main)] dark:text-white mb-8 tracking-tighter leading-none">
              {input ? `Search: "${input}"` : 'Discover Your Next Skill'}
            </h1>
            <p className="text-[var(--text-muted)] dark:text-white/40 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
              Unlock potential with our curated selection of professional courses taught by world-class industry experts and leaders.
            </p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 md:px-12 lg:px-24 py-20">
        <div className="flex flex-col lg:flex-row gap-16">

          {/* Sidebar Filters */}
          <aside className="lg:w-1/4">
            <div className="sticky top-24 space-y-12">
              {/* Categories */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-6">Subject Areas</h3>
                <div className="flex flex-wrap lg:flex-col gap-2">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`text-left px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!selectedCategory ? 'bg-indigo-500 text-white shadow-xl shadow-indigo-500/20' : 'text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-indigo-500'}`}
                  >
                    All Disciplines
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat._id}
                      onClick={() => setSelectedCategory(cat._id)}
                      className={`text-left px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${selectedCategory === cat._id ? 'bg-indigo-500 text-white shadow-xl shadow-indigo-500/20' : 'text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-indigo-500'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skill Level */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-6">Experience Level</h3>
                <div className="flex flex-wrap lg:flex-col gap-2">
                  {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                    <button
                      key={level}
                      onClick={() => setSelectedLevel(selectedLevel === level ? '' : level)}
                      className={`text-left px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${selectedLevel === level ? 'bg-indigo-500 text-white shadow-xl shadow-indigo-500/20' : 'text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-indigo-500'}`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sidebar Promo */}
              <div className="p-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[2rem] text-white relative overflow-hidden group shadow-2xl">
                <div className="relative z-10">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl mb-6">🚀</div>
                  <h4 className="text-xl font-black mb-2 tracking-tight">Unlimited Learning</h4>
                  <p className="text-white/70 text-xs font-bold uppercase tracking-wide mb-8 leading-relaxed">Upgrade to Premium for lifetime access to all pro courses.</p>
                  <button className="w-full bg-white text-indigo-600 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-transform">
                    Learn More
                  </button>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-700"></div>
              </div>
            </div>
          </aside>

          {/* Main Grid */}
          <div className="lg:w-3/4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12 pb-6 border-b border-[var(--border)]">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Results Grid</span>
                <p className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-tighter">
                  Showing <span className="text-[var(--text-main)]">{filteredCourses.length}</span> Premium Courses
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Filter:</span>
                <select className="bg-[var(--surface)] border-[var(--border)] px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-[var(--text-main)] outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer">
                  <option>Latest</option>
                  <option>Trending</option>
                  <option>Price: Asc</option>
                  <option>Price: Desc</option>
                </select>
              </div>
            </div>

            {filteredCourses.length === 0 ? (
              <div className="bg-[var(--surface)] rounded-[3rem] py-32 text-center border-2 border-dashed border-[var(--border)]">
                <div className="text-6xl mb-8 grayscale opacity-50">🔭</div>
                <h3 className="text-2xl font-black text-[var(--text-main)] mb-4 tracking-tight">No Results Found</h3>
                <p className="text-[var(--text-muted)] font-bold uppercase tracking-widest text-[10px] max-w-xs mx-auto">Try adjusting your selected filters or searching for something else.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                {filteredCourses.map((course, index) => (
                  <CourseCard key={index} course={course} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CoursesList;
