import asyncHandler from "../utils/asyncHandler.js";
import { createBatchNotifications } from '../services/notificationService.js';
import Cohort from '../models/Cohort.js';
import User from '../models/User.js';

// Create Announcement
export const createNotice = asyncHandler(async (req, res, next) => {
    const { title, content, course, cohort, recipients, priority, expiryDate } = req.body;
    const instructor = req.user._id;

    const notice = await Notice.create({
        title, content, course, cohort, instructor, recipients, priority, expiryDate
    });

    // Strategy: Notify target audience
    if (recipients === 'cohort' && cohort) {
        const cohortData = await Cohort.findById(cohort).select('students cohortName');
        if (cohortData && cohortData.students.length > 0) {
            await createBatchNotifications(cohortData.students, {
                type: 'INSTITUTIONAL_NOTICE',
                title: `New Batch Notice: ${title}`,
                message: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
                module: 'communication',
                referenceId: notice._id,
                actionUrl: `/student/cohort/${cohort}`
            });
        }
    } else if (recipients === 'all') {
        // For 'all', we might notify everyone or just rely on the board feed.
        // For PrismEd, let's notify all active students if priority is urgent/critical.
        if (priority === 'urgent' || priority === 'critical') {
            const allStudents = await User.find({ role: 'student' }).select('_id');
            const studentIds = allStudents.map(s => s._id);
            await createBatchNotifications(studentIds, {
                type: 'INSTITUTIONAL_NOTICE',
                title: `Urgent Institutional Alert: ${title}`,
                message: content.substring(0, 100) + '...',
                module: 'communication',
                referenceId: notice._id,
                actionUrl: '/'
            });
        }
    }

    return responseHelper.success(res, { notice }, 'Institutional announcement broadcasted successfully', 201);
});

// Get Notices (Targeted)
export const getNotices = asyncHandler(async (req, res, next) => {
    const { courseId, cohortId } = req.query;

    const query = { isPublished: true };
    
    if (courseId || cohortId) {
        query.$or = [
            { recipients: 'all' },
            { course: courseId },
            { cohort: cohortId }
        ];
    } else {
        query.recipients = 'all';
    }

    const notices = await Notice.find(query)
        .populate('instructor', 'name profilePicture')
        .sort({ createdAt: -1 });

    return responseHelper.success(res, { notices }, 'Institutional announcement feed synchronized');
});

// Delete Notice
export const deleteNotice = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const notice = await Notice.findById(id);

    if (!notice) return next(new AppError('Announcement artifact not found', 404));

    if (notice.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new AppError('Strategic authorization violation', 403));
    }

    await Notice.findByIdAndDelete(id);

    return responseHelper.success(res, {}, 'Announcement artifact decommissioned');
});
