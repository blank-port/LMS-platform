import { v2 as cloudinary } from 'cloudinary';
import Comment from '../models/Comment.js';
import Discussion from '../models/Discussion.js';
import Message from '../models/Message.js';
import CommunicationSetting from '../models/CommunicationSetting.js';
import User from '../models/User.js';
import Notice from '../models/Notice.js';
import { broadcast } from '../services/pusherService.js';
import { createAdminNotification, createStudentNotification, createBatchNotifications } from '../services/notificationService.js';
import Enrollment from '../models/Enrollment.js';
import responseHelper from '../utils/responseHelper.js';
import AppError from '../utils/appError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getMessages = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const { limit = 50, skip = 0 } = req.query;

    const total = await Message.countDocuments({
        $or: [{ sender: userId }, { receiver: userId }]
    });
    
    const messages = await Message.find({
        $or: [{ sender: userId }, { receiver: userId }]
    })
    .populate('sender receiver', 'name avatar role')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(skip));
    
    const meta = {
        total,
        page: Math.floor(skip / limit) + 1,
        pages: Math.ceil(total / limit)
    };

    return responseHelper.success(res, { messages }, 'Conversational signals synchronized', 200, meta);
});

export const sendMessage = asyncHandler(async (req, res, next) => {
    const { receiverId, targetType = 'private', targetId, content } = req.body;
    const senderId = req.user._id;

    if (!content || content.length > 2000) {
        return next(new AppError('Conversational payload magnitude invalid (max 2000 chars)', 400));
    }

    const newMessage = await Message.create({
        sender: senderId,
        receiver: receiverId || senderId,
        targetType,
        targetId,
        content
    });

    // Real-time Relay
    const broadcastData = {
        sender: req.user.name,
        senderId: senderId,
        content: content.substring(0, 50) + '...',
        targetType
    };

    if (targetType === 'private') {
        await broadcast(`user-${receiverId}`, 'new-message', broadcastData);
    } else if (targetType === 'course') {
        const enrolled = await Enrollment.find({ courseId: targetId }).select('userId');
        const studentIds = enrolled
            .map(e => e.userId)
            .filter(id => id.toString() !== senderId.toString());

        if (studentIds.length > 0) {
            await createBatchNotifications(studentIds, {
                type: 'NEW_MESSAGE',
                message: `Broadcast from Instructor: ${content.substring(0, 30)}...`,
                module: 'communication'
            });
        }
    }

    return responseHelper.success(res, { data: newMessage }, 'Conversational signal dispatched successfully', 201);
});

export const getConversations = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;

    const messages = await Message.find({
        $or: [{ sender: userId }, { receiver: userId }],
        targetType: 'private'
    }).sort({ createdAt: -1 });

    const contactsMap = new Map();

    for (const msg of messages) {
        const partnerId = msg.sender.toString() === userId.toString() ? msg.receiver.toString() : msg.sender.toString();
        if (!contactsMap.has(partnerId)) {
            contactsMap.set(partnerId, msg);
        }
    }

    const contactIds = Array.from(contactsMap.keys());
    const contacts = await User.find({ _id: { $in: contactIds } })
        .select('name email avatar role lastActive');

    const result = contacts.map(contact => ({
        contact,
        lastMessage: contactsMap.get(contact._id.toString()),
        isOnline: (new Date() - new Date(contact.lastActive)) < 5 * 60 * 1000 
    }));

    return responseHelper.success(res, { conversations: result }, 'Conversational partners synchronized');
});

// --- Comment Moderation ---
export const getAdminComments = asyncHandler(async (req, res, next) => {
    const { type, status, limit = 50, skip = 0 } = req.query;
    let query = {};
    if (type) query.targetType = type;
    if (status) query.status = status;

    const total = await Comment.countDocuments(query);
    const comments = await Comment.find(query)
        .populate('user', 'name avatar role')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip));

    const meta = {
        total,
        page: Math.floor(skip / limit) + 1,
        pages: Math.ceil(total / limit)
    };

    return responseHelper.success(res, { comments }, 'Institutional commentary registry synchronized', 200, meta);
});

export const updateCommentStatus = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;

    if (req.user.role !== 'admin') {
        return next(new AppError('Executive credentials required for moderation recalibration', 403));
    }

    const comment = await Comment.findByIdAndUpdate(id, { status }, { new: true });
    if (!comment) return next(new AppError('Commentary artifact not found', 404));
    
    await broadcast(`user-${comment.user}`, 'comment-status-update', {
        status: status,
        commentId: id
    });

    return responseHelper.success(res, { comment }, `Commentary status recalibrated to ${status}`);
});

export const addComment = asyncHandler(async (req, res, next) => {
    const { content, targetType, targetId, parentId } = req.body;
    const userId = req.user._id;

    const settings = await CommunicationSetting.findOne();
    
    const profanityList = ['spam', 'abuse', 'hack', 'scam']; 
    if (settings && settings.profanityFilter) {
        const hasProfanity = profanityList.some(word => content.toLowerCase().includes(word));
        if (hasProfanity) {
            return next(new AppError('Conversational signal flagged by institutional profanity protocol', 400));
        }
    }

    const status = (settings && settings.autoApproveComments) ? 'approved' : 'pending';

    const comment = await Comment.create({
        user: userId,
        content,
        targetType,
        targetId,
        parentId: parentId || null,
        status
    });

    const channelType = targetType === 'Blog' ? 'global-comment-channel' : `asset-${targetId}`;
    await broadcast(channelType, 'new-comment', {
        author: req.user.name,
        content: content.substring(0, 50) + '...',
        status
    });

    await createAdminNotification({
        type: 'NEW_QUESTION',
        message: `New commentary from ${req.user.name} on ${targetType}`,
        module: 'communication',
        referenceId: comment._id
    });

    return responseHelper.success(res, { comment }, status === 'approved' ? 'Commentary published' : 'Commentary dispatched for moderation', 201);
});

export const deleteComment = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const comment = await Comment.findById(id);

    if (!comment) return next(new AppError('Commentary artifact not found', 404));

    if (comment.user.toString() !== req.user._id.toString() && 
        !['admin', 'instructor'].includes(req.user.role)) {
        return next(new AppError('Institutional authorization required for decommissioning', 403));
    }

    await Comment.deleteMany({ parentId: id });
    await Comment.findByIdAndDelete(id);

    return responseHelper.success(res, {}, 'Commentary artifact decommissioned');
});

// --- Q&A Hub (Consolidated) ---
export const addQuestion = asyncHandler(async (req, res, next) => {
    const { courseId, lessonId, message, parentId } = req.body;
    const userId = req.user._id;

    const settings = await CommunicationSetting.findOne();
    
    const profanityList = ['spam', 'abuse', 'hack', 'scam']; 
    if (settings && settings.profanityFilter) {
        const hasProfanity = profanityList.some(word => message.toLowerCase().includes(word));
        if (hasProfanity) {
            return next(new AppError('Inquiry signal flagged by institutional profanity protocol', 400));
        }
    }

    if (settings && message.length > settings.maxMessageLength) {
        return next(new AppError(`Inquiry protocol exceeds max magnitude of ${settings.maxMessageLength} characters`, 400));
    }

    if (parentId) {
        const parentDisc = await Discussion.findById(parentId);
        if (!parentDisc) return next(new AppError('Inquiry root not found', 404));

        if (parentDisc.isReserved && !['admin', 'instructor'].includes(req.user.role)) {
            return next(new AppError('Status Locked: This inquiry is under executive review', 423));
        }

        if (settings && settings.allowQuestionReplyRoles.length > 0) {
            if (!settings.allowQuestionReplyRoles.includes(req.user.role)) {
                return next(new AppError('Institutional authority insufficient for scholastic replies', 403));
            }
        }
    }

    const question = await Discussion.create({
        courseId,
        userId,
        message,
        lessonId: lessonId || null,
        parentId: parentId || null
    });

    await broadcast(`course-${courseId}`, 'new-discussion', {
        type: parentId ? 'REPLY' : 'INQUIRY',
        author: req.user.name,
        message: message.substring(0, 50) + '...'
    });

    if (parentId) {
        const parentDisc = await Discussion.findByIdAndUpdate(parentId, { isReplied: true });
        if (parentDisc && parentDisc.userId.toString() !== userId.toString()) {
            await createStudentNotification({
                userId: parentDisc.userId,
                type: 'NEW_MESSAGE',
                message: `Inter-Scholar Communication: Your inquiry has received a response from ${req.user.name}.`,
                module: 'communication',
                referenceId: question._id
            });
        }
    }

    await createAdminNotification({
        type: 'NEW_QUESTION',
        message: `New inquiry from ${req.user.name} in course curriculum`,
        module: 'communication',
        referenceId: question._id
    });

    const populated = await Discussion.findById(question._id)
        .populate('userId', 'name avatar role');

    return responseHelper.success(res, { question: populated }, 'Inquiry dispatched to scholastic nexus', 201);
});

export const getQA = asyncHandler(async (req, res, next) => {
    const { courseId, lessonId, status, isReserved, limit = 20, skip = 0 } = req.query;
    let query = {};
    if (courseId) query.courseId = courseId;
    if (lessonId) query.lessonId = lessonId;
    if (status) query.status = status;
    if (isReserved !== undefined) query.isReserved = isReserved === 'true';

    if (!req.query.all) query.parentId = null;

    const total = await Discussion.countDocuments(query);
    const discussions = await Discussion.find(query)
        .populate('userId', 'name avatar role')
        .populate('courseId', 'courseTitle')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip));

    const discussionIds = discussions.map(d => d._id);
    const allReplies = await Discussion.find({ parentId: { $in: discussionIds } })
        .populate('userId', 'name avatar role')
        .sort({ createdAt: 1 });

    const discussionsWithReplies = discussions.map(disc => {
        const replies = allReplies.filter(r => r.parentId.toString() === disc._id.toString());
        return { ...disc.toObject(), replies };
    });

    const meta = {
        total,
        page: Math.floor(skip / limit) + 1,
        pages: Math.ceil(total / limit)
    };

    return responseHelper.success(res, { discussions: discussionsWithReplies }, 'Scholastic discourse synchronized', 200, meta);
});

export const deleteQuestion = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const disc = await Discussion.findById(id);

    if (!disc) return next(new AppError('Inquiry node not found', 404));

    if (disc.userId.toString() !== req.user._id.toString() && 
        !['admin', 'instructor'].includes(req.user.role)) {
        return next(new AppError('Institutional authorization required for decommissioning', 403));
    }

    await Discussion.deleteMany({ parentId: id });
    await Discussion.findByIdAndDelete(id);

    return responseHelper.success(res, {}, 'Inquiry node decommissioned');
});

export const toggleQAReserve = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    
    if (!['admin', 'instructor'].includes(req.user.role)) {
        return next(new AppError('Administrative credentials required for discourse locking', 403));
    }

    const disc = await Discussion.findById(id);
    if (!disc) return next(new AppError('Inquiry node not found', 404));

    disc.isReserved = !disc.isReserved;
    await disc.save();
    
    return responseHelper.success(res, { isReserved: disc.isReserved }, disc.isReserved ? "Question locked for executive review" : "Question opened for scholastic discourse");
});

export const toggleGoldenKnowledge = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    
    if (!['admin', 'instructor'].includes(req.user.role)) {
        return next(new AppError('Administrative credentials required for knowledge sealing', 403));
    }

    const disc = await Discussion.findById(id);
    if (!disc) return next(new AppError('Inquiry node not found', 404));

    disc.isGoldenKnowledge = !disc.isGoldenKnowledge;
    disc.verifiedBy = req.user._id;
    await disc.save();
    
    return responseHelper.success(res, { isGoldenKnowledge: disc.isGoldenKnowledge }, disc.isGoldenKnowledge ? "Discourse sealed as Golden Knowledge" : "Golden Status revoked");
});

export const deleteNotice = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const notice = await Notice.findById(id);

    if (!notice) return next(new AppError('Notice protocol not found', 404));

    if (notice.instructor.toString() !== req.user._id.toString() && 
        !['admin', 'instructor'].includes(req.user.role)) {
        return next(new AppError('Institutional authorization required for decommissioning', 403));
    }

    await Notice.findByIdAndDelete(id);

    return responseHelper.success(res, {}, 'Notice protocol decommissioned');
});

// --- Settings ---
export const getSettings = asyncHandler(async (req, res, next) => {
    let settings = await CommunicationSetting.findOne();
    if (!settings) {
        settings = await CommunicationSetting.create({});
    }
    return responseHelper.success(res, { settings }, 'Communication protocols synchronized');
});

// --- Institutional Alerts: Notices Protocol ---
export const getNotices = asyncHandler(async (req, res, next) => {
    const { courseId, cohortId } = req.query;
    let query = { isPublished: true };
    
    if (cohortId) {
        query.$or = [{ recipients: 'all' }, { cohort: cohortId }];
    } else if (courseId) {
        query.$or = [{ recipients: 'all' }, { course: courseId }];
    } else {
        query.recipients = 'all';
    }

    const notices = await Notice.find(query)
        .populate('instructor', 'name avatar role')
        .sort({ createdAt: -1 })
        .limit(10);

    return responseHelper.success(res, { notices }, 'Institutional alerts synchronized');
});

export const getInstructorNotices = asyncHandler(async (req, res, next) => {
    const instructorId = req.user._id;
    const notices = await Notice.find({ instructor: instructorId })
        .populate('instructor', 'name avatar role')
        .sort({ createdAt: -1 });

    return responseHelper.success(res, { notices }, 'Institutional alert registry synchronized');
});

export const addNotice = asyncHandler(async (req, res, next) => {
    const { title, content, courseId, cohortId, recipients = 'all' } = req.body;
    const instructorId = req.user._id;

    if (!['admin', 'instructor'].includes(req.user.role)) {
        return next(new AppError('Institutional credentials insufficient for alert dispatch', 403));
    }

    const notice = await Notice.create({
        title,
        content,
        course: courseId || null,
        cohort: cohortId || null,
        instructor: instructorId,
        recipients
    });

    let channel = 'global-notice-channel';
    if (recipients === 'course') channel = `course-notice-${courseId}`;
    if (recipients === 'cohort') channel = `cohort-notice-${cohortId}`;

    await broadcast(channel, 'new-notice', {
        title,
        instructor: req.user.name
    });

    if (recipients === 'cohort' && cohortId) {
        const cohort = await Cohort.findById(cohortId);
        const studentIds = cohort?.students || [];

        if (studentIds.length > 0) {
            await createBatchNotifications(studentIds, {
                type: 'INSTITUTIONAL_NOTICE',
                message: `Cohort Alert: "${title}" has been posted for your batch.`,
                module: 'communication',
                referenceId: notice._id
            });
        }
    } else if (recipients === 'course' && courseId) {
        const enrolled = await Enrollment.find({ courseId, status: 'active' }).select('userId');
        const studentIds = enrolled.map(e => e.userId);

        if (studentIds.length > 0) {
            await createBatchNotifications(studentIds, {
                type: 'INSTITUTIONAL_NOTICE',
                message: `Curriculum Update: "${title}" has been posted in one of your courses.`,
                module: 'communication',
                referenceId: notice._id
            });
        }
    }

    return responseHelper.success(res, { notice }, 'Institutional alert dispatched successfully', 201);
});

export const updateSettings = asyncHandler(async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return next(new AppError('Executive credentials required for protocol synchronization', 403));
    }

    const settings = await CommunicationSetting.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    return responseHelper.success(res, { settings }, 'Institutional protocols synchronized');
});

// --- Asset Management: Cloudinary Signed Uploads ---
export const getUploadSignature = asyncHandler(async (req, res, next) => {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
        { timestamp, folder: 'lms_videos' },
        process.env.CLOUDINARY_SECRET_KEY
    );

    return responseHelper.success(res, {
        signature,
        timestamp,
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        folder: 'lms_videos'
    }, 'Cloudinary upload signature provisioned');
});

// --- Institutional Lookup: Admin Contact ---
export const getAdminContact = asyncHandler(async (req, res, next) => {
    const admin = await User.findOne({ role: 'admin' }).select('name email role avatar');
    if (!admin) {
        return next(new AppError('Administrative node not found in repository', 404));
    }
    return responseHelper.success(res, { admin }, 'Administrative contact synchronized');
});

// --- Direct Messaging: User Discovery ---
export const searchUsers = asyncHandler(async (req, res, next) => {
    const { query } = req.query;
    if (!query || query.length < 2) return responseHelper.success(res, { users: [] });

    const users = await User.find({
        $or: [
            { name: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } }
        ],
        _id: { $ne: req.user._id } // Exclude self
    }).select('name email avatar role lastActive').limit(15);

    return responseHelper.success(res, { users }, 'Scholarly nodes discovered');
});
