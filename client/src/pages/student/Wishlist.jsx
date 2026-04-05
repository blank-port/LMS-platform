import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContextObject';
import { Heart, ShoppingBag, Trash2, BookOpen, Clock, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Loading from '../../components/student/Loading';

const Wishlist = () => {
    const { getWishlist, toggleWishlist, calculateRating, calculateCourseDuration } = useContext(AppContext);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchWishlist = async () => {
        setLoading(true);
        const data = await getWishlist();
        setWishlistItems(data);
        setLoading(false);
    };

    const handleRemove = async (courseId) => {
        const success = await toggleWishlist(courseId);
        if (success) {
            setWishlistItems(prev => prev.filter(item => item._id !== courseId));
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    if (loading) return <Loading />;

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen animate-fade-in">
            <header className="mb-12">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-rose-500/10 rounded-2xl">
                        <Heart className="text-rose-500 fill-rose-500" size={32} />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Your Wishlist</h1>
                </div>
                <p className="text-slate-500 font-medium max-w-2xl leading-relaxed">
                    Save the courses that inspire you today, and take the first step towards mastery whenever you're ready.
                </p>
            </header>

            {wishlistItems.length === 0 ? (
                <div className="bg-white rounded-[2rem] p-20 text-center border-2 border-dashed border-slate-100 shadow-sm">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-slate-100">
                        <Heart className="text-slate-200" size={48} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight italic uppercase">The Archive is Empty</h2>
                    <p className="text-slate-400 font-medium mb-10 max-w-md mx-auto leading-relaxed">
                        It seems your heart hasn't chosen any paths yet. Explore our curriculum to find your next great challenge.
                    </p>
                    <Link 
                        to="/course-list" 
                        className="inline-flex items-center gap-3 px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-cyan-600 transition-all shadow-xl shadow-slate-900/10 hover:-translate-y-1"
                    >
                        Explore Curriculum <ArrowRight size={16} />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {wishlistItems.map((course) => (
                        <div 
                            key={course._id} 
                            className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden group hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 hover:-translate-y-2 flex flex-col"
                        >
                            <div className="relative aspect-video overflow-hidden">
                                <img 
                                    src={course.courseThumbnail} 
                                    alt={course.courseTitle} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <button 
                                    onClick={() => handleRemove(course._id)}
                                    className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-md text-rose-500 rounded-2xl shadow-xl transform translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-rose-500 hover:text-white"
                                    title="Remove from wishlist"
                                >
                                    <Trash2 size={18} />
                                </button>
                                <div className="absolute bottom-4 left-4">
                                    <span className="px-4 py-1.5 bg-cyan-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-cyan-600/30">
                                        {course.level}
                                    </span>
                                </div>
                            </div>

                            <div className="p-8 flex-1 flex flex-col">
                                <Link to={`/course/${course._id}`} className="block mb-4">
                                    <h3 className="text-xl font-black text-slate-900 line-clamp-2 leading-tight hover:text-cyan-600 transition-colors">
                                        {course.courseTitle}
                                    </h3>
                                    <p className="text-slate-400 text-xs font-bold mt-2 uppercase tracking-tight">by {course.instructor?.name}</p>
                                </Link>

                                <div className="flex items-center gap-6 text-slate-400 mb-8 font-bold text-[11px] uppercase tracking-wider">
                                    <div className="flex items-center gap-2">
                                        <BookOpen size={14} className="text-cyan-500" />
                                        <span>Curriculum Path</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} className="text-cyan-500" />
                                        <span>{calculateCourseDuration(course)}</span>
                                    </div>
                                </div>

                                <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-2xl font-black text-slate-900">₹{(course.coursePrice - (course.coursePrice * (course.discount || 0) / 100)).toFixed(2)}</span>
                                        {course.discount > 0 && (
                                            <span className="text-xs text-slate-300 line-through font-bold">₹{course.coursePrice}</span>
                                        )}
                                    </div>
                                    <Link 
                                        to={`/course/${course._id}`}
                                        className="inline-flex items-center gap-3 px-6 py-3 bg-slate-100 text-slate-900 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-900 hover:text-white transition-all group/btn"
                                    >
                                        Enroll Now <ShoppingBag size={14} className="group-hover/btn:scale-110 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Wishlist;
