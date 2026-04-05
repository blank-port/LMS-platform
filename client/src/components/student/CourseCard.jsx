import React, { useContext } from 'react';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContextObject.jsx';
import { Link } from 'react-router-dom';
import SafeImage from '../common/SafeImage.jsx';
import { Heart } from 'lucide-react';

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
    <div className="relative h-full flex flex-col group">
      <Link to={`/course/${course._id}`}
        onClick={() => window.scrollTo(0, 0)}
        className="premium-card overflow-hidden !p-0 flex flex-col h-full bg-[var(--surface)] transition-all duration-500 hover:shadow-[0_20px_50px_rgba(79,70,229,0.1)] border border-[var(--border)]"
      >
      {/* Thumbnail & Badges */}
      <div className="relative aspect-video overflow-hidden">
        <SafeImage 
            src={course.courseThumbnail} 
            alt={course.courseTitle} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
            fallback="https://placehold.co/1280x720?text=Curriculum+Asset+Standby"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        <div className="absolute top-4 left-4 bg-[#7C32FF] text-white text-[10px] font-bold px-3 py-1 rounded-lg shadow-lg uppercase tracking-wider scale-90 group-hover:scale-100 transition-transform">
          {course.level || 'Beginner'}
        </div>

        {/* Wishlist Button */}
        <button 
            onClick={handleWishlist}
            className={`absolute top-4 right-4 p-2.5 rounded-xl shadow-xl transition-all duration-300 transform z-20 ${wishlist.includes(course._id) ? 'bg-rose-500 text-white scale-110 opacity-100' : 'bg-white/80 backdrop-blur-md text-slate-400 hover:text-rose-500 hover:scale-110 opacity-40 hover:opacity-100 translate-y-0'}`}
        >
            <Heart size={16} fill={wishlist.includes(course._id) ? "currentColor" : "none"} />
        </button>

        {/* Action Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-white text-[#7C32FF] px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform">
            View Details
          </div>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        {/* Category & Top Info */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-black text-indigo-500 bg-indigo-500/10 px-2.5 py-1 rounded-md uppercase tracking-widest">
            {course.category?.name || 'Education'}
          </span>
          <div className="flex items-center gap-1.5 bg-amber-400/10 px-2 py-0.5 rounded-full">
            <span className="text-amber-500 text-sm">★</span>
            <span className="text-[11px] font-black text-amber-700">{calculateRating(course) || '4.5'}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-black text-[var(--text-main)] leading-tight mb-4 group-hover:text-[#7C32FF] transition-colors line-clamp-2">
          {course.courseTitle}
        </h3>

        {/* Instructor */}
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-7 h-7 rounded-full bg-[var(--background)] border-2 border-[var(--surface)] shadow-sm flex items-center justify-center overflow-hidden">
            {course.instructor?.profilePicture ? (
              <SafeImage src={course.instructor.profilePicture} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[10px] font-black text-indigo-300">{course.instructor?.name?.charAt(0)}</span>
            )}
          </div>
          <p className="text-xs font-bold text-[var(--text-muted)] truncate">
            By <span className="text-[var(--text-main)] uppercase tracking-tighter">{course.instructor?.name || 'Expert Mentor'}</span>
          </p>
          {!settings?.hide_enrollment && course.enrolledStudents && (
            <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest bg-[var(--background)] px-3 py-1 rounded-full group-hover:bg-purple-900/20 group-hover:text-purple-600 transition-colors">
              {course.enrolledStudents.length} Students
            </p>
          )}
        </div>

        {/* Pricing & Footer */}
        <div className="mt-auto pt-5 border-t border-[var(--border)] flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[var(--text-main)]">
              {currency}{((course.coursePrice || 0) - (course.discount || 0) * (course.coursePrice || 0) / 100).toFixed(0)}
            </span>
            {course.discount > 0 && (
              <span className="text-xs text-[var(--text-muted)] line-through font-bold">
                {currency}{(course.coursePrice || 0).toFixed(0)}
              </span>
            )}
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[var(--background)] flex items-center justify-center text-[#7C32FF] group-hover:bg-[#7C32FF] group-hover:text-white transition-all shadow-sm transform group-hover:rotate-12">
            <span className="text-xl font-bold">→</span>
          </div>
        </div>
      </div>
      </Link>
    </div>
  );
};

export default CourseCard;
