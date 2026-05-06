import api from '@/utils/api';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import humanizeDuration from "humanize-duration";
import { AppContext } from "./AppContextObject";

export const AppContextProvider = (props) => {

    // Dynamic Backend URL for Full-Stack unified hosting
    const backendUrl = import.meta.env.PROD ? '' : (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001')
    const currency = import.meta.env.VITE_CURRENCY

    const navigate = useNavigate()

    const [token, setToken] = useState(localStorage.getItem('token') || '')
    const [user, setUser] = useState(null)
    const [wishlist, setWishlist] = useState([])
    const [isEducator, setIsEducator] = useState(false)
    const [allCourses, setAllCourses] = useState([])
    const [enrolledCourses, setEnrolledCourses] = useState([])
    const [categories, setCategories] = useState([])
    const [settings, setSettings] = useState({})

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/user/login', { email, password });
            if (data.success) {
                setToken(data.token);
                setUser(data.user);
                setIsEducator(data.user.role === 'instructor' || data.user.role === 'admin');
                localStorage.setItem('token', data.token);
                toast.success('Login successful');
                return data;
            } else {
                if (data.verifyEmail) {
                    return data;
                }
                toast.error(data.message);
                return null;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
            return null;
        }
    };

    const googleLogin = async (credential) => {
        try {
            const { data } = await api.post('/user/google-login', { credential });
            if (data.success) {
                setToken(data.token);
                setUser(data.user);
                setIsEducator(data.user.role === 'instructor' || data.user.role === 'admin');
                localStorage.setItem('token', data.token);
                toast.success('Login with Google successful');
                return data;
            } else {
                toast.error(data.message);
                return null;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Google Login failed');
            return null;
        }
    };

    const register = async (name, email, password, role, referralCode = '') => {
        try {
            const { data } = await api.post('/user/register', {
                name, email, password, role, referralCode
            });
            if (data.success) {
                if (data.verifyEmail) {
                    return data;
                }
                setToken(data.token);
                setUser(data.user);
                setIsEducator(data.user.role === 'instructor' || data.user.role === 'admin');
                localStorage.setItem('token', data.token);
                toast.success('Registration successful');
                return data;
            } else {
                toast.error(data.message);
                return null;
            }
        } catch (error) {
            return null;
        }
    };

    const verifyOtp = async (email, otp) => {
        try {
            const { data } = await api.post('/user/verify-otp', { email, otp });
            if (data.success) {
                setToken(data.token);
                setUser(data.user);
                setIsEducator(data.user.role === 'instructor' || data.user.role === 'admin');
                localStorage.setItem('token', data.token);
                toast.success('Email verified successfully');
                return data;
            } else {
                toast.error(data.message);
                return null;
            }
        } catch (error) {
            return null;
        }
    };

    const resendOtp = async (email) => {
        try {
            const { data } = await api.post('/user/resend-otp', { email });
            if (data.success) {
                toast.success('New OTP sent to your email');
                return true;
            } else {
                toast.error(data.message);
                return false;
            }
        } catch (error) {
            return false;
        }
    };

    const logout = () => {
        setToken('');
        setUser(null);
        setIsEducator(false);
        setEnrolledCourses([]);
        localStorage.removeItem('token');
        navigate('/');
        setTimeout(() => {
            toast.success('Logged out');
        }, 100);
    };

    const fetchAllCourses = async () => {
        try {
            const { data } = await api.get('/course/all');
            if (data.success) {
                setAllCourses(data.courses);
            }
        } catch (error) {
            console.error('Error fetching courses:', error.message);
        }
    };

    const fetchUserData = async () => {
        try {
            const { data } = await api.get('/user/data');
            if (data.success) {
                const userData = data.user;
                if (userData && !userData.avatar && userData.profilePicture) {
                    userData.avatar = userData.profilePicture;
                }
                setUser(userData);
                setWishlist(userData.wishlist || []);
                setIsEducator(userData.role === 'instructor' || userData.role === 'admin');
            }
        } catch (error) {
            console.error('User data sync failure');
        }
    };

    const fetchUserEnrolledCourses = async () => {
        try {
            const { data } = await api.get('/course/enrolled/my-courses');
            if (data.success) {
                setEnrolledCourses(data.enrollments);
            }
        } catch (error) {
            console.error('Error fetching enrollments:', error.message);
        }
    };

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/course/categories');
            if (data.success) {
                setCategories(data.categories);
            }
        } catch (error) {
            console.error('Error fetching categories:', error.message);
        }
    };

    const fetchPublicSettings = async () => {
        try {
            const { data } = await api.get('/setting/public');
            if (data.success) {
                setSettings(data.settings);
            }
        } catch (error) {
            console.error('Error fetching public settings:', error.message);
        }
    };


    const calculateChapterTime = (chapter) => {
        let time = 0;
        chapter.chapterContent.map((lecture) => time += lecture.lectureDuration);
        return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
    };

    const calculateCourseDuration = (course) => {
        let time = 0;
        if (!course || !course.courseContent) return '0h 0m';
        course.courseContent.map(
            (chapter) => chapter.chapterContent.map(
                (lecture) => time += lecture.lectureDuration
            )
        );
        return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
    };

    const calculateRating = (course) => {
        if (!course || !course.courseRatings || course.courseRatings.length === 0) {
            return 0;
        }
        let totalRating = 0;
        course.courseRatings.forEach(rating => {
            totalRating += rating.rating;
        });
        return Math.floor(totalRating / course.courseRatings.length);
    };

    const calculateNoOfLectures = (course) => {
        let totalLectures = 0;
        if (course && course.courseContent) {
            course.courseContent.forEach(chapter => {
                if (Array.isArray(chapter.chapterContent)) {
                    totalLectures += chapter.chapterContent.length;
                }
            });
        }
        return totalLectures;
    };

    useEffect(() => {
        fetchAllCourses();
        fetchCategories();
        fetchPublicSettings();
    }, []);


    useEffect(() => {
        if (token) {
            fetchUserData();
            fetchUserEnrolledCourses();
        }
    }, [token]);

    const fetchAllSettings = async () => {
        try {
            const { data } = await api.get('/setting/all');
            if (data.success) {
                return data.settings;
            }
        } catch (error) {
            console.error('Error fetching all settings:', error.message);
        }
        return [];
    };

    const updateBatchSettings = async (settings, isSensitive = false) => {
        try {
            const { data } = await api.post('/setting/update-batch', { settings, isSensitive });
            if (data.success) {
                setSettings(prev => ({ ...prev, ...settings }));
                toast.success(data.message);
                return true;
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            // Error handled by interceptor
        }
        return false;
    };

    const toggleWishlist = async (courseId) => {
        try {
            const { data } = await api.post(`/user/wishlist/${courseId}`, {});
            if (data.success) {
                toast.success(data.message);
                if (data.action === 'added') {
                    setWishlist(prev => [...prev, courseId]);
                } else {
                    setWishlist(prev => prev.filter(id => id !== courseId));
                }
                return true;
            }
            return false;
        } catch (error) {
            return false;
        }
    };

    const getWishlist = async () => {
        try {
            const { data } = await api.get('/user/wishlist');
            if (data.success) {
                return data.wishlist;
            }
            return [];
        } catch (error) {
            return [];
        }
    };


    const value = {
        backendUrl, currency, navigate,
        token, setToken,
        user, setUser,
        isEducator, setIsEducator,
        allCourses, fetchAllCourses,
        enrolledCourses, fetchUserEnrolledCourses,
        categories, fetchCategories,
        settings, setSettings, fetchPublicSettings,
        calculateChapterTime, calculateCourseDuration,
        calculateRating, calculateNoOfLectures,
        login, googleLogin, register, logout,
        verifyOtp, resendOtp,
        fetchAllSettings, updateBatchSettings,
        wishlist, setWishlist, toggleWishlist, getWishlist
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}




