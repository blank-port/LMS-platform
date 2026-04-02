import { v2 as cloudinary } from 'cloudinary';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import User from '../models/User.js';
import Quiz from '../models/Quiz.js';
import WalletTransaction from '../models/WalletTransaction.js';
import Category from '../models/Category.js';
import Payment from '../models/Payment.js';
import IssuedCertificate from '../models/IssuedCertificate.js';
import Discussion from '../models/Discussion.js';
import Setting from '../models/Setting.js';
import Refund from '../models/Refund.js';
import Referral from '../models/Referral.js';

// Add New Course
export const addCourse = async (req, res) => {
    try {
        const { courseData } = req.body;
        const imageFile = req.file;
        const instructorId = req.user._id;

        const parsedCourseData = JSON.parse(courseData);
        parsedCourseData.instructor = instructorId;

        // Fetch global course approval policy
        const approvalSetting = await Setting.findOne({ key: 'course_approval' });
        // Robust Fallback: Default to 'Yes' (require approval) if setting is missing or invalid
        const requiresApproval = approvalSetting ? approvalSetting.value === 'Yes' : true;
        parsedCourseData.status = requiresApproval ? 'pending' : 'approved';
        parsedCourseData.isPublished = true;

        const newCourse = await Course.create(parsedCourseData);

        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path);
            newCourse.courseThumbnail = imageUpload.secure_url;
            await newCourse.save();
        }

        res.json({ success: true, message: 'Course submitted for approval' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Update Course
export const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { courseData } = req.body;
        const imageFile = req.file;

        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        if (course.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const parsedData = JSON.parse(courseData);
        Object.assign(course, parsedData);

        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path);
            course.courseThumbnail = imageUpload.secure_url;
        }

        await course.save();
        res.json({ success: true, message: 'Course updated' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Delete Course
export const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await Course.findById(id);

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        if (course.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await Course.findByIdAndDelete(id);
        await Enrollment.deleteMany({ courseId: id });

        res.json({ success: true, message: 'Course deleted' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get Instructor Courses
export const getInstructorCourses = async (req, res) => {
    try {
        const instructor = req.user._id;
        const courses = await Course.find({ instructor })
            .populate('category', 'name')
            .sort({ createdAt: -1 });
        res.json({ success: true, courses });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get Instructor Dashboard Data
export const instructorDashboardData = async (req, res) => {
    try {
        const instructor = req.user._id;
        const courses = await Course.find({ instructor }).populate('category', 'name');
        const totalCourses = courses.length;
        const courseIds = courses.map(course => course._id);

        const totalEnrollments = await Enrollment.countDocuments({
            courseId: { $in: courseIds }
        });

        // Unique Subjects (Categories)
        const subjectsList = [...new Set(courses.map(c => c.category?.name).filter(Boolean))];
        const totalSubjects = subjectsList.length;

        // Revenue Aggregation
        const transactions = await WalletTransaction.find({
            userId: instructor,
            source: 'instructor_earnings',
            status: 'success'
        });

        const totalRevenue = transactions.reduce((acc, trans) => acc + trans.amount, 0);

        // Period-based Revenue
        const now = new Date();
        const startOfToday = new Date(now.setHours(0, 0, 0, 0));
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const todayRevenue = transactions
            .filter(t => new Date(t.createdAt) >= startOfToday)
            .reduce((acc, t) => acc + t.amount, 0);

        const thisMonthRevenue = transactions
            .filter(t => new Date(t.createdAt) >= startOfMonth)
            .reduce((acc, t) => acc + t.amount, 0);

        // Today's Gross (Total Enrolled Amount Today)
        // We'll calculate this based on enrollments today * course prices
        const startOfTodayEnroll = new Date();
        startOfTodayEnroll.setHours(0,0,0,0);
        
        const todayEnrollments = await Enrollment.find({
            courseId: { $in: courseIds },
            createdAt: { $gte: startOfTodayEnroll }
        }).populate('courseId', 'coursePrice');

        const todayEnrolledAmount = todayEnrollments.reduce((acc, e) => acc + (e.courseId?.coursePrice || 0), 0);

        // Monthly Earnings for last 12 months
        const monthlyEarnings = Array(12).fill(0).map((_, i) => {
            const date = new Date();
            date.setMonth(date.getMonth() - (11 - i));
            const month = date.getMonth();
            const year = date.getFullYear();
            
            const monthRevenue = transactions
                .filter(t => {
                    const tDate = new Date(t.createdAt);
                    return tDate.getMonth() === month && tDate.getFullYear() === year;
                })
                .reduce((acc, t) => acc + t.amount, 0);

            return {
                name: date.toLocaleString('default', { month: 'short' }),
                revenue: monthRevenue
            };
        });

        // Payment Statistics (Daily for this month)
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const paymentStatistics = Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dayRevenue = transactions
                .filter(t => {
                    const tDate = new Date(t.createdAt);
                    return tDate.getDate() === day && tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
                })
                .reduce((acc, t) => acc + t.amount, 0);

            return {
                day: day,
                amount: dayRevenue
            };
        });

        // Collect enrolled students data
        const recentEnrollments = await Enrollment.find({
            courseId: { $in: courseIds }
        }).populate('userId', 'name profilePicture email')
          .populate('courseId', 'courseTitle coursePrice')
          .sort({ createdAt: -1 })
          .limit(8);

        const enrolledStudentsData = recentEnrollments.map(e => ({
            student: e.userId,
            courseTitle: e.courseId?.courseTitle || 'Unknown',
            enrolledDate: e.createdAt,
            progress: e.progress,
            price: e.courseId?.coursePrice || 0
        }));

        res.json({
            success: true,
            dashboardData: {
                totalCourses,
                totalEnrollments,
                totalSubjects,
                totalRevenue,
                todayEnrolledAmount,
                thisMonthRevenue,
                todayRevenue,
                monthlyEarnings,
                paymentStatistics,
                enrolledStudentsData
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Seed Dashboard Test Data (Development Only)
export const seedDashboardTestData = async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash('instructor123', 10);
        const sarah = await User.findOneAndUpdate(
            { email: 'instructor@prismed.com' },
            { 
                name: 'Sarah Wilson',
                password: hashedPassword,
                role: 'instructor',
                isEducator: true,
                isApproved: true
            },
            { upsert: true, new: true }
        );

        const studentPass = await bcrypt.hash('student123', 10);
        const student = await User.findOneAndUpdate(
            { email: 'student@prismed.com' },
            {
                name: 'Alex Student',
                password: studentPass,
                role: 'student',
                isApproved: true
            },
            { upsert: true, new: true }
        );

        const courses = await Course.find({ instructor: sarah._id });
        if (courses.length === 0) {
            // Create a dummy course for Sarah if she has none
            const category = await Category.findOne();
            const course = await Course.create({
                courseTitle: 'Quantum Physics 101',
                coursePrice: 1500,
                instructor: sarah._id,
                category: category?._id,
                isPublished: true,
                courseThumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800'
            });
            courses.push(course);
        }

        // Clean slate for these specific test records
        await Enrollment.deleteMany({ userId: student._id });
        await WalletTransaction.deleteMany({ userId: sarah._id, source: 'instructor_earnings' });

        const now = new Date();

        // 1. Create Enrollments (Unique Courses only)
        const uniqueCourses = Array.from(new Set(courses.map(c => c._id.toString())))
            .map(id => courses.find(c => c._id.toString() === id));

        for (let i = 0; i < Math.min(8, uniqueCourses.length); i++) {
            const course = uniqueCourses[i];
            const enrollmentDate = new Date();
            enrollmentDate.setDate(now.getDate() - i);
            
            await Enrollment.updateOne(
                { userId: student._id, courseId: course._id },
                { 
                    $set: { 
                        progress: Math.floor(Math.random() * 100),
                        createdAt: enrollmentDate 
                    } 
                },
                { upsert: true }
            );
        }

        // 2. Create Wallet Transactions (Revenue)
        // Today
        await WalletTransaction.create({
            userId: sarah._id,
            amount: 1575,
            type: 'credit',
            status: 'success',
            source: 'instructor_earnings',
            description: 'Course Purchase Payout',
            createdAt: now
        });

        // This Month
        const thisMonthDate = new Date();
        thisMonthDate.setDate(now.getDate() - 3);
        await WalletTransaction.create({
            userId: sarah._id,
            amount: 3250,
            type: 'credit',
            status: 'success',
            source: 'instructor_earnings',
            description: 'Course Purchase Payout',
            createdAt: thisMonthDate
        });

        // Last 12 Months for Bar Chart
        for (let i = 1; i < 12; i++) {
            const histDate = new Date();
            histDate.setMonth(now.getMonth() - i);
            histDate.setDate(10);
            await WalletTransaction.create({
                userId: sarah._id,
                amount: Math.floor(Math.random() * 6000) + 3000,
                type: 'credit',
                status: 'success',
                source: 'instructor_earnings',
                description: `Historical Revenue ${i}`,
                createdAt: histDate
            });
        }

        res.json({ success: true, message: 'Instructor Dashboard data seeded successfully for Sarah Wilson.' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get Enrolled Students Data
export const getEnrolledStudentsData = async (req, res) => {
    try {
        const instructor = req.user._id;
        const courses = await Course.find({ instructor });
        const courseIds = courses.map(course => course._id);

        const enrollments = await Enrollment.find({
            courseId: { $in: courseIds }
        }).populate('userId', 'name profilePicture email')
          .populate('courseId', 'courseTitle');

        const enrolledStudents = enrollments.map(e => ({
            student: e.userId,
            courseId: e.courseId?._id,
            courseTitle: e.courseId?.courseTitle || 'Unknown',
            enrolledDate: e.createdAt,
            progress: e.progress
        }));

        res.json({ success: true, enrolledStudents });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ─── Instructor My Panel ───────────────────────────────────────────────
export const getInstructorMyPanel = async (req, res) => {
    try {
        const userId = req.user._id;
        const tab = req.query.tab || 'purchase_history';

        if (tab === 'purchase_history') {
            const payments = await Payment.find({ user: userId })
                .populate('course', 'courseTitle courseThumbnail')
                .sort({ createdAt: -1 });
            return res.json({ success: true, tab, data: payments });
        }

        if (tab === 'certificates') {
            const certs = await IssuedCertificate.find({ userId })
                .populate('courseId', 'courseTitle courseThumbnail')
                .sort({ issueDate: -1 });
            return res.json({ success: true, tab, data: certs });
        }

        if (tab === 'topics') {
            const courses = await Course.find({ instructor: userId }, 'courseTitle subject category courseContent')
                .populate('category', 'name');
            const topics = courses.map(c => ({
                courseTitle: c.courseTitle,
                subject: c.subject || c.category?.name || 'General',
                totalLectures: c.courseContent?.reduce((acc, ch) => acc + (ch.chapterContent?.length || 0), 0) || 0
            }));
            return res.json({ success: true, tab, data: topics });
        }

        if (tab === 'refund_cancellation') {
            const refunds = await Refund.find({ user: userId })
                .populate('courseId', 'courseTitle courseThumbnail')
                .sort({ createdAt: -1 });
            return res.json({ success: true, tab, data: refunds });
        }

        if (tab === 'referral') {
            const referral = await Referral.findOne({ referrer: userId })
                .populate('referees.user', 'name profilePicture email createdAt');
                
            // If no referral record exists, return an empty structure
            const referralData = referral || { 
                referralCode: req.user.referralCode || 'NOT_SET',
                totalEarnings: 0, 
                referees: [] 
            };
            return res.json({ success: true, tab, data: referralData });
        }

        if (tab === 'deposit') {
            const deposits = await WalletTransaction.find({ 
                userId, 
                source: 'wallet_deposit' 
            }).sort({ createdAt: -1 });
            return res.json({ success: true, tab, data: deposits });
        }

        if (tab === 'logged_in_device') {
            // Mocking active sessions based on user data
            const devices = [
                {
                    device: 'Windows PC - Chrome',
                    ip: req.ip || '127.0.0.1',
                    location: 'Current Location',
                    lastLogin: req.user.lastLogin || new Date(),
                    current: true
                }
            ];
            return res.json({ success: true, tab, data: devices });
        }

        res.json({ success: true, tab, data: [] });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ─── Instructor Payouts ────────────────────────────────────────────────
export const getInstructorPayouts = async (req, res) => {
    try {
        const userId = req.user._id;
        const transactions = await WalletTransaction.find({
            userId,
            source: { $in: ['instructor_earnings', 'withdrawal'] }
        }).sort({ createdAt: -1 });

        const totalEarnings = transactions
            .filter(t => t.source === 'instructor_earnings' && t.status === 'success')
            .reduce((acc, t) => acc + t.amount, 0);

        const totalWithdrawn = transactions
            .filter(t => t.source === 'withdrawal' && t.status === 'success')
            .reduce((acc, t) => acc + t.amount, 0);

        res.json({
            success: true,
            payouts: transactions,
            summary: { totalEarnings, totalWithdrawn, balance: totalEarnings - totalWithdrawn }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ─── Instructor Revenue Report ─────────────────────────────────────────
export const getInstructorRevenue = async (req, res) => {
    try {
        const userId = req.user._id;
        const transactions = await WalletTransaction.find({
            userId, source: 'instructor_earnings', status: 'success'
        }).sort({ createdAt: -1 });

        const totalRevenue = transactions.reduce((acc, t) => acc + t.amount, 0);

        const now = new Date();
        const monthlyBreakdown = Array(12).fill(0).map((_, i) => {
            const d = new Date(); d.setMonth(d.getMonth() - (11 - i));
            const m = d.getMonth(), y = d.getFullYear();
            const amt = transactions
                .filter(t => { const td = new Date(t.createdAt); return td.getMonth() === m && td.getFullYear() === y; })
                .reduce((a, t) => a + t.amount, 0);
            return { month: d.toLocaleString('default', { month: 'short', year: '2-digit' }), revenue: amt };
        });

        // Per-course revenue
        const courses = await Course.find({ instructor: userId }, 'courseTitle coursePrice');
        const enrollments = await Enrollment.find({ courseId: { $in: courses.map(c => c._id) } });
        const courseRevenue = courses.map(c => {
            const count = enrollments.filter(e => e.courseId.toString() === c._id.toString()).length;
            return { courseTitle: c.courseTitle, enrollments: count, revenue: count * (c.coursePrice || 0) };
        }).sort((a, b) => b.revenue - a.revenue);

        res.json({ success: true, totalRevenue, monthlyBreakdown, courseRevenue, recentTransactions: transactions.slice(0, 20) });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ─── Instructor Course Statistics ──────────────────────────────────────
export const getInstructorCourseStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const courses = await Course.find({ instructor: userId })
            .populate('category', 'name');

        const courseIds = courses.map(c => c._id);
        const enrollments = await Enrollment.find({ courseId: { $in: courseIds } });

        const courseStats = courses.map(c => {
            const courseEnrollments = enrollments.filter(e => e.courseId.toString() === c._id.toString());
            const avgProgress = courseEnrollments.length
                ? Math.round(courseEnrollments.reduce((a, e) => a + (e.progress || 0), 0) / courseEnrollments.length)
                : 0;
            const completedCount = courseEnrollments.filter(e => e.completed).length;
            const avgRating = c.courseRatings?.length
                ? (c.courseRatings.reduce((a, r) => a + r.rating, 0) / c.courseRatings.length).toFixed(1)
                : 'N/A';

            return {
                _id: c._id,
                courseTitle: c.courseTitle,
                category: c.category?.name || 'Uncategorized',
                status: c.status,
                level: c.level,
                totalEnrollments: courseEnrollments.length,
                avgProgress,
                completedCount,
                courseRating: avgRating,
                revenue: courseEnrollments.length * (c.coursePrice || 0)
            };
        });

        const totals = {
            totalCourses: courses.length,
            totalEnrollments: enrollments.length,
            totalCompleted: enrollments.filter(e => e.completed).length,
            avgOverallProgress: enrollments.length
                ? Math.round(enrollments.reduce((a, e) => a + (e.progress || 0), 0) / enrollments.length)
                : 0
        };

        res.json({ success: true, courseStats, totals });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ─── Instructor Q&A ────────────────────────────────────────────────────
export const getInstructorQA = async (req, res) => {
    try {
        const userId = req.user._id;
        const courses = await Course.find({ instructor: userId }, '_id courseTitle');
        const courseIds = courses.map(c => c._id);

        const questions = await Discussion.find({ courseId: { $in: courseIds }, parentId: null })
            .populate('userId', 'name profilePicture')
            .populate('courseId', 'courseTitle')
            .sort({ createdAt: -1 });

        // Get reply counts for each question
        const questionsWithReplies = await Promise.all(
            questions.map(async (q) => {
                const replyCount = await Discussion.countDocuments({ parentId: q._id });
                return { ...q.toObject(), replyCount };
            })
        );

        res.json({ success: true, questions: questionsWithReplies });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Reply to Q&A
export const replyToQuestion = async (req, res) => {
    try {
        const { questionId, message } = req.body;
        const userId = req.user._id;

        const reply = await Discussion.create({
            courseId: (await Discussion.findById(questionId)).courseId,
            userId,
            message,
            parentId: questionId
        });

        res.json({ success: true, reply });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
