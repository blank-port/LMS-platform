import CertificateTemplate from "../models/CertificateTemplate.js";
import Payment from "../models/Payment.js";
import Refund from "../models/Refund.js";
import Badge from "../models/Badge.js";
import User from "../models/User.js";
import Setting from "../models/Setting.js";

// Certificate Templates
export const createCertificateTemplate = async (req, res) => {
    try {
        const template = await CertificateTemplate.create(req.body);
        res.json({ success: true, template });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getCertificateTemplates = async (req, res) => {
    try {
        const templates = await CertificateTemplate.find();
        res.json({ success: true, templates });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Financials
export const getAdminRevenue = async (req, res) => {
    try {
        const Course = (await import('../models/Course.js')).default;

        const payments = await Payment.find({ status: 'completed' });
        console.log('DEBUG: Found completed payments count:', payments.length);
        if (payments.length > 0) console.log('DEBUG: First payment amount:', payments[0].amount);

        const totalRevenue = payments.reduce((acc, curr) => acc + curr.amount, 0);

        // Admin captures 30% of gross
        const adminShare = totalRevenue * 0.3;
        const instructorShare = totalRevenue * 0.7;

        // Breakdown by course
        const courses = await Course.find().select('courseTitle enrolledStudents');
        const courseBreakdown = await Promise.all(courses.map(async (courseDoc) => {
            const coursePayments = await Payment.find({
                course: courseDoc._id,
                status: 'completed'
            });
            return {
                title: courseDoc.courseTitle,
                enrollments: courseDoc.enrolledStudents.length,
                revenue: coursePayments.reduce((acc, curr) => acc + curr.amount, 0)
            };
        }));

        res.json({
            success: true,
            revenue: totalRevenue, // For simple stat cards
            report: {
                totalRevenue,
                adminShare,
                instructorShare,
                courseBreakdown
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getInstructorRevenue = async (req, res) => {
    try {
        const { id } = req.params;
        const instructorId = id || req.user._id;
        const Course = (await import('../models/Course.js')).default;

        const instructorCourses = await Course.find({ instructor: instructorId });
        const courseIds = instructorCourses.map(c => c._id);

        const payments = await Payment.find({
            course: { $in: courseIds },
            status: 'completed'
        });

        const totalRevenue = payments.reduce((acc, curr) => acc + curr.amount, 0);
        const instructorShare = totalRevenue * 0.7; // Standard 70% share
        const adminShare = totalRevenue * 0.3;

        const breakdown = instructorCourses.map(courseDoc => {
            const coursePayments = payments.filter(p => p.course.toString() === courseDoc._id.toString());
            return {
                title: courseDoc.courseTitle,
                enrollments: courseDoc.enrolledStudents.length,
                revenue: coursePayments.reduce((acc, curr) => acc + curr.amount, 0)
            };
        });

        res.json({
            success: true,
            report: {
                totalRevenue,
                instructorShare,
                adminShare,
                courseBreakdown: breakdown
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getPayments = async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate('user', 'name email')
            .populate('course', 'courseTitle')
            .sort({ createdAt: -1 });

        const mappedData = payments.map(p => ({
            id: p._id,
            user: p.user?.name || 'Anonymous',
            course: p.course?.courseTitle || 'System Asset',
            amount: p.amount,
            status: p.status === 'completed' ? 'Completed' : 'Pending',
            date: new Date(p.createdAt).toLocaleDateString()
        }));

        res.json({ success: true, data: mappedData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getRefunds = async (req, res) => {
    try {
        const refunds = await Refund.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        const mappedData = refunds.map(r => ({
            id: r._id,
            user: r.user?.name || 'Anonymous',
            course: 'Curriculum Unit', // Refund model might need course link if required
            amount: r.amount,
            status: r.status,
            date: new Date(r.createdAt).toLocaleDateString()
        }));

        res.json({ success: true, data: mappedData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const requestRefund = async (req, res) => {
    try {
        const refund = await Refund.create({
            ...req.body,
            user: req.user._id
        });
        res.json({ success: true, refund });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Gamification
export const awardBadge = async (req, res) => {
    try {
        const { userId, badgeId } = req.body;
        await User.findByIdAndUpdate(userId, { $addToSet: { badges: badgeId } });
        res.json({ success: true, message: 'Badge awarded successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const debugPayments = async (req, res) => {
    try {
        const count = await Payment.countDocuments();
        const all = await Payment.find();
        res.json({ success: true, count, all });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Payout Settings
export const getPayoutSettings = async (req, res) => {
    try {
        const keys = ['instructorCommission', 'minimumPayoutAmount', 'payoutFrequency', 'enableAutoPayout', 'paymentMethods'];
        const settings = await Setting.find({ key: { $in: keys } });
        
        const settingsMap = {};
        settings.forEach(s => {
            // Handle array vs value
            if (s.key === 'paymentMethods') {
                settingsMap[s.key] = s.value.split(',');
            } else if (s.key === 'enableAutoPayout') {
                settingsMap[s.key] = s.value === 'true';
            } else {
                settingsMap[s.key] = isNaN(s.value) ? s.value : Number(s.value);
            }
        });

        // Default values if not found
        const finalSettings = {
            instructorCommission: settingsMap.instructorCommission ?? 70,
            minimumPayoutAmount: settingsMap.minimumPayoutAmount ?? 500,
            payoutFrequency: settingsMap.payoutFrequency ?? 'monthly',
            enableAutoPayout: settingsMap.enableAutoPayout ?? false,
            paymentMethods: settingsMap.paymentMethods ?? ['bank', 'paypal', 'stripe']
        };

        res.json({ success: true, settings: finalSettings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updatePayoutSettings = async (req, res) => {
    try {
        const settings = req.body;
        const keys = Object.keys(settings);

        await Promise.all(keys.map(async (key) => {
            let value = settings[key];
            if (Array.isArray(value)) value = value.join(',');
            
            await Setting.findOneAndUpdate(
                { key },
                { key, value, isSensitive: false },
                { upsert: true, new: true }
            );
        }));

        res.json({ success: true, message: 'Remuneration protocols synchronized.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
