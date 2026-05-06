import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContextObject.jsx';
import { useParams } from 'react-router-dom';
import CourseCard from '../../components/student/CourseCard';
import SearchBar from '../../components/student/SearchBar';
import Footer from '../../components/student/Footer';
import { Filter, Star, IndianRupee, Layers, SlidersHorizontal, Search, X } from 'lucide-react';

const CoursesList = () => {
  const { input } = useParams();
  const { allCourses, categories, calculateRating } = useContext(AppContext);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedRating, setSelectedRating] = useState(0);
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');

  const [sortOption, setSortOption] = useState('Latest');
  const [searchCount, setSearchCount] = useState(0);

  useEffect(() => {
    let courses = [...allCourses];

    // Search term filter
    if (input) {
      courses = courses.filter(c =>
        c.courseTitle.toLowerCase().includes(input.toLowerCase()) ||
        c.courseDescription?.toLowerCase().includes(input.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      courses = courses.filter(c => c.category?._id === selectedCategory);
    }

    // Level filter
    if (selectedLevel) {
      courses = courses.filter(c => c.level === selectedLevel);
    }

    // Rating filter
    if (selectedRating > 0) {
        courses = courses.filter(c => calculateRating(c) >= selectedRating);
    }

    // Price filter
    if (selectedPriceRange === 'free') {
        courses = courses.filter(c => c.coursePrice === 0);
    } else if (selectedPriceRange === 'premium') {
        courses = courses.filter(c => c.coursePrice > 0);
    }

    // Functional Sorting logic
    if (sortOption === 'Latest') {
      courses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortOption === 'Trending') {
      courses.sort((a, b) => (b.enrolledStudents?.length || 0) - (a.enrolledStudents?.length || 0));
    } else if (sortOption === 'Price: Asc') {
      courses.sort((a, b) => {
        const priceA = a.coursePrice - (a.discount * a.coursePrice / 100);
        const priceB = b.coursePrice - (b.discount * b.coursePrice / 100);
        return priceA - priceB;
      });
    } else if (sortOption === 'Price: Desc') {
      courses.sort((a, b) => {
        const priceA = a.coursePrice - (a.discount * a.coursePrice / 100);
        const priceB = b.coursePrice - (b.discount * b.coursePrice / 100);
        return priceB - priceA;
      });
    }

    setFilteredCourses(courses);
    setSearchCount(courses.length);
  }, [allCourses, input, selectedCategory, selectedLevel, sortOption, selectedRating, selectedPriceRange]);

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedLevel('');
    setSelectedRating(0);
    setSelectedPriceRange('all');
    setSortOption('Latest');
  };

  const hasFilters = selectedCategory || selectedLevel || selectedRating > 0 || selectedPriceRange !== 'all';

  return (
    <div className="min-h-screen bg-[#FDFDFF]">
      {/* Premium Search & Header */}
      <div className="bg-[#0C132B] pt-32 pb-40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] -ml-24 -mb-24"></div>
        
        <div className="container mx-auto px-6 md:px-12 lg:px-24 relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-2.5 rounded-2xl mb-10 backdrop-blur-md">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
              <span className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em] leading-none">Course Catalog Explorer</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white mb-10 tracking-tighter leading-none">
              {input ? (
                <span>Found <span className="text-indigo-400">{searchCount}</span> Courses for <span className="italic">"{input}"</span></span>
              ) : 'Discover Elite Courses'}
            </h1>
            <p className="text-white/40 text-xl font-bold max-w-2xl leading-relaxed mb-12">
              Sync your cognitive pathways with world-class curricula. Taught by architects of the digital age.
            </p>

            <div className="flex flex-wrap gap-4">
               {hasFilters && (
                   <button 
                    onClick={clearFilters}
                    className="flex items-center gap-2 bg-rose-500/20 text-rose-400 border border-rose-500/20 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500/30 transition-all"
                   >
                     <X size={14} /> Clear Active Filters
                   </button>
               )}
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 md:px-12 lg:px-24 py-24 -mt-20 relative z-20">
        <div className="flex flex-col lg:flex-row gap-16">

          {/* Sidebar Filters */}
          <aside className="lg:w-1/4">
            <div className="sticky top-24 space-y-12 bg-white/40 backdrop-blur-xl p-8 rounded-[3rem] border border-white shadow-2xl shadow-slate-900/5">
              
              <div className="flex items-center gap-3 mb-2">
                <SlidersHorizontal size={18} className="text-slate-900" />
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-900">Filters</h3>
              </div>

              {/* Categories */}
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                   <Layers size={12} /> Categories
                </h4>
                <div className="flex flex-wrap lg:flex-col gap-2">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`text-left px-5 py-3 rounded-2xl text-[11px] font-bold tracking-tight transition-all ${!selectedCategory ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' : 'text-slate-500 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-100'}`}
                  >
                    Global Catalog
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat._id}
                      onClick={() => setSelectedCategory(cat._id === selectedCategory ? '' : cat._id)}
                      className={`text-left px-5 py-3 rounded-2xl text-[11px] font-bold tracking-tight transition-all ${selectedCategory === cat._id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-500 hover:bg-white hover:text-indigo-600 border border-transparent hover:border-slate-100'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skill Level */}
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                    ⚡ Skill Level
                </h4>
                <div className="flex flex-wrap lg:flex-col gap-2">
                  {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                    <button
                      key={level}
                      onClick={() => setSelectedLevel(selectedLevel === level ? '' : level)}
                      className={`text-left px-5 py-3 rounded-2xl text-[11px] font-bold tracking-tight transition-all ${selectedLevel === level ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-500 hover:bg-white hover:text-indigo-600 border border-transparent hover:border-slate-100'}`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                    <Star size={12} fill="currentColor" /> Star Metrics
                </h4>
                <div className="space-y-4">
                  {[4.5, 4.0, 3.5].map(r => (
                    <button
                        key={r}
                        onClick={() => setSelectedRating(selectedRating === r ? 0 : r)}
                        className={`w-full flex items-center justify-between px-5 py-3 rounded-2xl text-[11px] font-bold transition-all ${selectedRating === r ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'text-slate-500 hover:bg-white border border-transparent hover:border-slate-100'}`}
                    >
                        <span>{r}+ Star Rating</span>
                        <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(s => <Star key={s} size={10} className={s <= Math.floor(r) ? 'text-amber-500 fill-amber-500' : 'text-slate-200'} />)}
                        </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                    <IndianRupee size={12} /> Price
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'all', label: 'Global' },
                    { id: 'free', label: 'Open' },
                    { id: 'premium', label: 'Pro' }
                  ].map(pr => (
                    <button
                      key={pr.id}
                      onClick={() => setSelectedPriceRange(pr.id)}
                      className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedPriceRange === pr.id ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20' : 'text-slate-500 bg-white border border-slate-100 hover:border-emerald-600 hover:text-emerald-600'}`}
                    >
                      {pr.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sidebar Promo */}
              <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white relative overflow-hidden group shadow-2xl">
                <div className="relative z-10 text-center">
                  <div className="w-14 h-14 bg-white/10 rounded-[1.5rem] flex items-center justify-center text-2xl mb-6 mx-auto group-hover:rotate-12 transition-transform">💎</div>
                  <h4 className="text-lg font-black mb-2 tracking-tight">Access Restricted</h4>
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-8 leading-relaxed">Unlock the Enterprise Vault for unlimited nodes.</p>
                  <button className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:scale-[1.05] transition-transform active:scale-95">
                    Pro Ingress
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Grid */}
          <div className="lg:w-3/4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 mb-16 pb-10 border-b border-slate-100">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-3">Live Result Set</span>
                <p className="text-2xl font-black text-slate-900 tracking-tighter">
                  Showing <span className="text-indigo-600">{filteredCourses.length}</span> Courses
                </p>
              </div>
              <div className="flex items-center gap-5 bg-white p-2 rounded-2.5xl shadow-sm border border-slate-50">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Seq:</span>
                <select 
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="bg-slate-50 border-none px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-900 outline-none focus:ring-4 focus:ring-slate-100 transition-all cursor-pointer appearance-none"
                >
                  <option value="Latest">Time: Latest</option>
                  <option value="Trending">Metric: Viral</option>
                  <option value="Price: Asc">Fiscal: Low</option>
                  <option value="Price: Desc">Fiscal: High</option>
                </select>
              </div>
            </div>

            {filteredCourses.length === 0 ? (
              <div className="bg-white rounded-[4rem] py-40 text-center border-2 border-dashed border-slate-100 shadow-sm animate-in fade-in duration-700">
                <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-10 text-5xl">⛓️</div>
                <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter uppercase">No Courses Found</h3>
                <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] max-w-sm mx-auto leading-relaxed">No courses match your current filters. Adjust your search or explore the full catalog.</p>
                <button 
                  onClick={clearFilters}
                  className="mt-12 px-10 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-xl active:scale-95"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12 animate-in slide-in-from-bottom-6 duration-700">
                {filteredCourses.map((course, index) => (
                  <CourseCard key={index} course={course} />
                ))}
              </div>
            )}
            
            {/* Pagination / Load More (Placeholder) */}
            {filteredCourses.length > 0 && (
                <div className="mt-24 pt-12 border-t border-slate-100 flex items-center justify-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">End of Result Set</p>
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


