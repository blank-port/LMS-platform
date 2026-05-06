import { v2 as cloudinary } from 'cloudinary';
import bcrypt from 'bcrypt';
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
import Review from '../models/Review.js';
import QuizAttempt from '../models/QuizAttempt.js';
import DeviceSession from '../models/DeviceSession.js';
import responseHelper from '../utils/responseHelper.js';
import AppError from '../utils/appError.js';
import asyncHandler from '../utils/asyncHandler.js';

// Add New Course
export const addCourse = asyncHandler(async (req, res, next) => {
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

    return responseHelper.success(res, { courseId: newCourse._id }, 'Course submitted for approval', 201);
});

// Update Course
export const updateCourse = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { courseData } = req.body;
    const imageFile = req.file;

    const course = await Course.findById(id);
    if (!course) {
        return next(new AppError('Course not found', 404));
    }

    if (course.instructor.toString() !== req.user._id.toString()) {
        return next(new AppError('Not authorized to modify this curriculum', 403));
    }

    const parsedData = JSON.parse(courseData);
    Object.assign(course, parsedData);

    if (imageFile) {
        const imageUpload = await cloudinary.uploader.upload(imageFile.path);
        course.courseThumbnail = imageUpload.secure_url;
    }

    await course.save();
    return responseHelper.success(res, { course }, 'Course updated successfully');
});

// Delete Course
export const deleteCourse = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const course = await Course.findById(id);

    if (!course) {
        return next(new AppError('Course not found', 404));
    }

    if (course.instructor.toString() !== req.user._id.toString()) {
        return next(new AppError('Not authorized to terminate this curriculum', 403));
    }

    // Gather related IDs first (Atomic purge protocol)
    const quizIds = (await Quiz.find({ courseId: id }).select('_id')).map(q => q._id);

    await Promise.all([
        Course.findByIdAndDelete(id),
        Enrollment.deleteMany({ courseId: id }),
        IssuedCertificate.deleteMany({ courseId: id }),
        QuizAttempt.deleteMany({ quizId: { $in: quizIds } }),
        Quiz.deleteMany({ courseId: id }),
        User.updateMany(
            { enrolledCourses: id },
            { $pull: { enrolledCourses: id } }
        ),
        Discussion.deleteMany({ courseId: id }),
        Review.deleteMany({ courseId: id }),
    ]);

    return responseHelper.success(res, {}, 'Course permanently removed from active registry');
});

// Get Instructor Courses
export const getInstructorCourses = asyncHandler(async (req, res, next) => {
    const instructor = req.user._id;
    const courses = await Course.find({ instructor })
        .populate('category', 'name')
        .sort({ createdAt: -1 });
    return responseHelper.success(res, { courses });
});

// Get Single Instructor Course for Editing
export const getInstructorCourseById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const course = await Course.findById(id).populate('category', 'name');
    
    if (!course) {
        return next(new AppError('Course not found', 404));
    }
    if (course.instructor.toString() !== req.user._id.toString()) {
        return next(new AppError('Not authorized to view this specific curriculum', 403));
    }
    return responseHelper.success(res, { courseData: course });
});

export const instructorDashboardData = asyncHandler(async (req, res, next) => {
    const instructor = req.user._id;
    const now = new Date();
    const startOfToday = new Date(new Date(now).setHours(0, 0, 0, 0));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 1. Core Portfolio Stats
    const courses = await Course.find({ instructor }).select('courseTitle coursePrice category courseContent enrolledStudents').populate('category', 'name');
    const courseIds = courses.map(c => c._id);
    const totalCourses = courses.length;
    const totalSubjects = [...new Set(courses.map(c => c.category?.name).filter(Boolean))].length;

    // 2. Scholar Metrics (Distinct & Progress)
    const enrollments = await Enrollment.find({ courseId: { $in: courseIds } });
    const totalEnrollments = enrollments.length;
    const distinctStudents = [...new Set(enrollments.map(e => e.userId.toString()))];
    const activeStudentsCount = distinctStudents.length;

    const globalCompletionRate = enrollments.length 
        ? Math.round((enrollments.filter(e => e.completed).length / enrollments.length) * 100)
        : 0;

    // 3. Fiscal Intelligence ($facet)
    const fiscalStats = await WalletTransaction.aggregate([
        { $match: { userId: instructor, status: 'success' } },
        {
            $facet: {
                totalRevenue: [
                    { $match: { source: 'instructor_earnings' } },
                    { $group: { _id: null, sum: { $sum: "$amount" } } }
                ],
                totalWithdrawn: [
                    { $match: { source: 'withdrawal' } },
                    { $group: { _id: null, sum: { $sum: "$amount" } } }
                ],
                todayRevenue: [
                    { $match: { source: 'instructor_earnings', createdAt: { $gte: startOfToday } } },
                    { $group: { _id: null, sum: { $sum: "$amount" } } }
                ],
                monthlyEarnings: [
                    { $match: { source: 'instructor_earnings' } },
                    {
                        $group: {
                            _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
                            revenue: { $sum: "$amount" }
                        }
                    },
                    { $sort: { "_id.year": 1, "_id.month": 1 } }
                ]
            }
        }
    ]);

    const earnings = fiscalStats[0].totalRevenue[0]?.sum || 0;
    const withdrawals = fiscalStats[0].totalWithdrawn[0]?.sum || 0;
    const payoutSummary = {
        totalEarnings: earnings,
        totalWithdrawn: withdrawals,
        balance: earnings - withdrawals
    };

    // Format Monthly Data
    const monthlyEarningsRaw = fiscalStats[0].monthlyEarnings || [];
    const monthlyEarnings = Array(12).fill(0).map((_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (11 - i));
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const found = monthlyEarningsRaw.find(m => m._id.month === month && m._id.year === year);
        return {
            name: date.toLocaleString('default', { month: 'short' }),
            revenue: found ? found.revenue : 0
        };
    });

    // 4. Content Performance (Top Courses)
    const topPerformingCourses = courses.map(c => {
        const count = enrollments.filter(e => e.courseId.toString() === c._id.toString()).length;
        return {
            _id: c._id,
            title: c.courseTitle,
            revenue: count * (c.coursePrice || 0),
            enrollments: count
        };
    }).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    // 5. Engagement Insights (Drop-offs & Quiz Health)
    // a. Drop-off Analysis (Most common exit lessons)
    const dropOffMap = enrollments.reduce((acc, e) => {
        if (e.lastWatchedLessonId) {
            acc[e.lastWatchedLessonId] = (acc[e.lastWatchedLessonId] || 0) + 1;
        }
        return acc;
    }, {});

    // Flatten all lecture titles for lookup
    const allLectures = courses.flatMap(c => 
        c.courseContent?.flatMap(ch => 
            ch.chapterContent?.map(l => ({ id: l._id.toString(), title: l.lectureTitle }))
        ).filter(Boolean) || []
    );

    const dropOffPoints = Object.entries(dropOffMap)
        .map(([id, count]) => ({
            id, count, 
            title: allLectures.find(l => l.id === id)?.title || 'Modular Unit'
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

    // b. Quiz Health Across Instructor Courses
    const courseQuizzes = await Quiz.find({ courseId: { $in: courseIds } }).select('_id');
    const quizIds = courseQuizzes.map(q => q._id);
    const attempts = await QuizAttempt.find({ quizId: { $in: quizIds } });
    
    const quizPassRate = attempts.length
        ? Math.round((attempts.filter(a => a.isPassed).length / attempts.length) * 100)
        : 0;

    // 6. Recent Global Activity
    const recentEnrollmentsRaw = await Enrollment.find({ courseId: { $in: courseIds } })
        .populate('userId', 'name avatar email profilePicture')
        .populate('courseId', 'courseTitle coursePrice')
        .sort({ createdAt: -1 })
        .limit(8);

    const enrolledStudentsData = recentEnrollmentsRaw.map(e => ({
        student: e.userId,
        courseTitle: e.courseId?.courseTitle || 'Modular Unit',
        enrolledDate: e.createdAt,
        progress: e.progress,
        price: e.courseId?.coursePrice || 0
    }));

    return responseHelper.success(res, {
        dashboardData: {
            totalCourses,
            totalEnrollments,
            activeStudentsCount,
            globalCompletionRate,
            totalRevenue: earnings,
            todayRevenue: fiscalStats[0].todayRevenue[0]?.sum || 0,
            monthlyEarnings,
            topPerformingCourses,
            engagementInsights: { dropOffPoints, quizPassRate },
            payoutSummary,
            enrolledStudentsData
        }
    }, 'Creator intelligence synchronized');
});

// Seed Dashboard Test Data (Development Only)
export const seedDashboardTestData = asyncHandler(async (req, res, next) => {
    const hashedPassword = await bcrypt.hash('instructor123', 10);
    const sarah = await User.findOneAndUpdate(
        { email: 'instructor@prismed.com' },
        { 
            name: 'Sarah Wilson',
            password: hashedPassword,
            role: 'instructor',
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

    return responseHelper.success(res, {}, 'Instructor Dashboard data seeded successfully for Sarah Wilson.');
});

// Get Enrolled Students Data
export const getEnrolledStudentsData = asyncHandler(async (req, res, next) => {
    const instructor = req.user._id;
    const courses = await Course.find({ instructor });
    const courseIds = courses.map(course => course._id);

    const enrollments = await Enrollment.find({
        courseId: { $in: courseIds }
    }).populate('userId', 'name profilePicture email')
      .populate('courseId', 'courseTitle');

    const enrolledStudents = enrollments.map(e => ({
        student: e.userId,
        courseTitle: e.courseId?.courseTitle || 'Curriculum Protocol',
        enrolledDate: e.createdAt,
        progress: e.progress || 0
    }));

    return responseHelper.success(res, { enrolledStudents });
});

// ─── Instructor My Panel ───────────────────────────────────────────────
export const getInstructorMyPanel = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const tab = req.query.tab || 'purchase_history';
    console.log(`[Instructor Panel] Accessing tab: ${tab} for user: ${userId}`);

    try {
        if (tab === 'purchase_history') {
            const payments = await Payment.find({ user: userId })
                .populate('course', 'courseTitle courseThumbnail')
                .sort({ createdAt: -1 });
            return responseHelper.success(res, { data: payments }, `Panel: ${tab}`);
        }

        if (tab === 'certificates') {
            const certs = await IssuedCertificate.find({ userId })
                .populate('courseId', 'courseTitle courseThumbnail')
                .sort({ issueDate: -1 });
            return responseHelper.success(res, { data: certs }, `Panel: ${tab}`);
        }

        if (tab === 'topics') {
            const courses = await Course.find({ instructor: userId }, 'courseTitle subject category courseContent')
                .populate('category', 'name');
            const topics = courses.map(c => ({
                courseTitle: c.courseTitle,
                subject: c.subject || c.category?.name || 'General',
                totalLectures: c.courseContent?.reduce((acc, ch) => acc + (ch.chapterContent?.length || 0), 0) || 0
            }));
            return responseHelper.success(res, { data: topics }, `Panel: ${tab}`);
        }

        if (tab === 'reviews') {
            const courses = await Course.find({ instructor: userId }).select('_id');
            const courseIds = courses.map(c => c._id);
            const reviews = await Review.find({ courseId: { $in: courseIds } })
                .populate('userId', 'name profilePicture')
                .populate('courseId', 'courseTitle')
                .sort({ createdAt: -1 });
            return responseHelper.success(res, { data: reviews }, `Panel: ${tab}`);
        }

        if (tab === 'refund_cancellation') {
            const refunds = await Refund.find({ user: userId })
                .populate('course', 'courseTitle courseThumbnail')
                .sort({ createdAt: -1 });
            return responseHelper.success(res, { data: refunds }, `Panel: ${tab}`);
        }

        if (tab === 'referral') {
            const referral = await Referral.findOne({ referrer: userId })
                .populate('referees.user', 'name profilePicture email createdAt');
                
            const referralData = referral || { 
                referralCode: req.user.referralCode || 'NOT_SET',
                totalEarnings: 0, 
                referees: [] 
            };
            return responseHelper.success(res, { data: referralData }, `Panel: ${tab}`);
        }

        if (tab === 'deposit') {
            const deposits = await WalletTransaction.find({ 
                userId, 
                source: 'wallet_deposit' 
            }).sort({ createdAt: -1 });
            return responseHelper.success(res, { data: deposits }, `Panel: ${tab}`);
        }

        if (tab === 'logged_in_device') {
            console.log('[Instructor Panel] Querying Device Sessions...');
            const sessions = await DeviceSession.find({ userId }).sort({ lastActive: -1 });
            console.log(`[Instructor Panel] Found ${sessions.length} sessions`);
            return responseHelper.success(res, { data: sessions }, `Panel: ${tab}`);
        }

        return responseHelper.success(res, { data: [] }, `Panel: ${tab} (Empty)`);
    } catch (error) {
        console.error(`[Instructor Panel Error] Tab: ${tab}, Message: ${error.message}`);
        return next(new AppError(`Panel failure: ${error.message}`, 500));
    }
});

// ─── Instructor Payouts ────────────────────────────────────────────────
export const getInstructorPayouts = asyncHandler(async (req, res, next) => {
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

    return responseHelper.success(res, {
        payouts: transactions,
        summary: { totalEarnings, totalWithdrawn, balance: totalEarnings - totalWithdrawn }
    }, 'Payout ledger synchronized');
});

// ─── Instructor Revenue Report ─────────────────────────────────────────
export const getInstructorRevenue = asyncHandler(async (req, res, next) => {
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

    const courses = await Course.find({ instructor: userId }, 'courseTitle coursePrice');
    const enrollments = await Enrollment.find({ courseId: { $in: courses.map(c => c._id) } });
    const courseRevenue = courses.map(c => {
        const count = enrollments.filter(e => e.courseId.toString() === c._id.toString()).length;
        return { courseTitle: c.courseTitle, enrollments: count, revenue: count * (c.coursePrice || 0) };
    }).sort((a, b) => b.revenue - a.revenue);

    return responseHelper.success(res, { totalRevenue, monthlyBreakdown, courseRevenue, recentTransactions: transactions.slice(0, 20) }, 'Fiscal intelligence synchronized');
});

// ─── Instructor Course Statistics ──────────────────────────────────────
export const getInstructorCourseStats = asyncHandler(async (req, res, next) => {
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

    return responseHelper.success(res, { courseStats, totals }, 'Academic metrics synchronized');
});

// ─── Instructor Q&A ────────────────────────────────────────────────────
export const getInstructorQA = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const courses = await Course.find({ instructor: userId }, '_id courseTitle');
    const courseIds = courses.map(c => c._id);

    const questions = await Discussion.find({ courseId: { $in: courseIds }, parentId: null })
        .populate('userId', 'name profilePicture')
        .populate('courseId', 'courseTitle')
        .sort({ createdAt: -1 });

    const questionsWithReplies = await Promise.all(
        questions.map(async (q) => {
            const replyCount = await Discussion.countDocuments({ parentId: q._id });
            return { ...q.toObject(), replyCount };
        })
    );

    return responseHelper.success(res, { questions: questionsWithReplies }, 'Social queries synchronized');
});

// Reply to Q&A
export const replyToQuestion = asyncHandler(async (req, res, next) => {
    const { questionId, message } = req.body;
    const userId = req.user._id;

    const parent = await Discussion.findById(questionId);
    if (!parent) return next(new AppError('Original question not found in registry', 404));

    const reply = await Discussion.create({
        courseId: parent.courseId,
        userId,
        message,
        parentId: questionId
    });

    return responseHelper.success(res, { reply }, 'Intellectual response dispatched', 201);
});

// Upload Media for Curriculum
export const uploadImage = asyncHandler(async (req, res, next) => {
    if (!req.file) {
        return next(new AppError('No visual protocol data provided', 400));
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'prismed_curriculum',
        resource_type: 'auto'
    });

    return responseHelper.success(res, {
        url: result.secure_url,
        public_id: result.public_id
    }, 'Visual media integrated successfully');
});
