import React, { useContext } from 'react';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContextObject.jsx';
import { Link } from 'react-router-dom';
import SafeImage from '../common/SafeImage.jsx';
import { Heart, Star, Users, ArrowRight, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const CourseCard = ({ course }) => {
    const { currency, calculateRating, settings, wishlist, toggleWishlist, token, navigate } = useContext(AppContext);

    const handleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!token) {
            navigate('/login');
            return;
        }
        toggleWishlist(course._id);
    };

    return (
        <motion.div 
            whileHover={{ y: -10 }}
            className="relative h-full flex flex-col group perspective-1000"
        >
            <Link to={`/course/${course._id}`}
                onClick={() => window.scrollTo(0, 0)}
                className="premium-card !p-0 flex flex-col h-full bg-white/40 backdrop-blur-2xl transition-all duration-700 shadow-xl shadow-emerald-900/5 group-hover:shadow-emerald-500/10 border-white/40"
            >
                {/* Visual Asset Container */}
                <div className="relative aspect-video overflow-hidden rounded-t-[2.5rem]">
                    <SafeImage 
                        src={course.courseThumbnail} 
                        alt={course.courseTitle} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]" 
                        fallback="https://placehold.co/1280x720?text=Curriculum+Asset+Active"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                    {/* Operational Badges (Glassmorphic) */}
                    <div className="absolute top-6 left-6 flex flex-col gap-2.5 z-20">
                        <div className="glass-premium px-4 py-1.5 rounded-xl shadow-sm">
                            <span className="text-slate-900 text-[9px] font-black uppercase tracking-[0.2em]">{course.level || 'Standard'}</span>
                        </div>
                        
                        {/* Status Signalers */}
                        {course.enrolledStudents?.length >= 100 && (
                            <div className="bg-amber-500 text-white text-[8px] font-black px-4 py-1.5 rounded-xl shadow-lg uppercase tracking-widest flex items-center gap-2 w-fit animate-pulse">
                                <Zap size={10} fill="currentColor" /> Trending
                            </div>
                        )}

                        {parseFloat(calculateRating(course)) >= 4.7 && (
                            <div className="bg-emerald-600 text-white text-[8px] font-black px-4 py-1.5 rounded-xl shadow-lg uppercase tracking-widest flex items-center gap-2 w-fit">
                                <span>🏆</span> Elite Tier
                            </div>
                        )}
                    </div>

                    {/* Interaction Hub (Wishlist) */}
                    <motion.button 
                        whileTap={{ scale: 0.9 }}
                        onClick={handleWishlist}
                        className={`absolute top-6 right-6 p-3 rounded-2xl shadow-xl transition-all duration-500 transform z-30 ${wishlist.includes(course._id) ? 'bg-rose-500 text-white shadow-rose-500/30' : 'bg-white/60 backdrop-blur-xl text-slate-400 hover:text-rose-500'}`}
                    >
                        <Heart size={16} fill={wishlist.includes(course._id) ? "currentColor" : "none"} />
                    </motion.button>

                    {/* Navigation Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="bg-slate-900 text-white px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl transform translate-y-6 group-hover:translate-y-0 transition-transform duration-500 border border-white/20">
                            Sync Module
                        </div>
                    </div>
                </div>

                {/* Content Engine */}
                <div className="p-8 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-5">
                        <span className="text-[9px] font-black text-emerald-600 bg-emerald-500/5 px-3 py-1.5 rounded-lg uppercase tracking-[0.3em]">
                            {course.category?.name || 'Cognitive'}
                        </span>
                        <div className="flex items-center gap-2 bg-amber-400/5 px-3 py-1 rounded-full border border-amber-400/10">
                            <Star size={12} className="text-amber-500 fill-amber-500" />
                            <span className="text-[11px] font-black text-amber-700">{calculateRating(course) || '4.8'}</span>
                        </div>
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 leading-[1.15] mb-6 group-hover:text-emerald-600 transition-colors line-clamp-2 tracking-tighter">
                        {course.courseTitle}
                    </h3>

                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-9 h-9 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden">
                            {course.instructor?.profilePicture ? (
                                <SafeImage src={course.instructor.profilePicture} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-[11px] font-black text-emerald-600">{course.instructor?.name?.charAt(0)}</span>
                            )}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Architect</p>
                            <p className="text-xs font-bold text-slate-900 truncate tracking-tight">{course.instructor?.name || 'Lead Mentor'}</p>
                        </div>
                    </div>

                    {/* Operational Footer */}
                    <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-baseline gap-2.5">
                            <span className="text-3xl font-black text-slate-900 tracking-tighter">
                                {currency}{((course.coursePrice || 0) - (course.discount || 0) * (course.coursePrice || 0) / 100).toFixed(0)}
                            </span>
                            {course.discount > 0 && (
                                <span className="text-[11px] text-slate-400 line-through font-bold">
                                    {currency}{(course.coursePrice || 0).toFixed(0)}
                                </span>
                            )}
                        </div>
                        <motion.div 
                            whileHover={{ x: 5, rotate: -15 }}
                            className="w-12 h-12 rounded-[1.2rem] bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-emerald-900/10 group-hover:bg-emerald-600 transition-all"
                        >
                            <ArrowRight size={20} />
                        </motion.div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default CourseCard;


