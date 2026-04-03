import Comment from '../models/Comment.js';
import Discussion from '../models/Discussion.js';
import Message from '../models/Message.js';
import CommunicationSetting from '../models/CommunicationSetting.js';
import User from '../models/User.js';
import Notice from '../models/Notice.js';
import { broadcast } from '../services/pusherService.js';
import { createAdminNotification } from '../services/notificationService.js';

export const getMessages = async (req, res) => {
    try {
        const userId = req.user._id;
        const { limit = 50, skip = 0 } = req.query;

        // Institutional Pagination Protocol v1.1
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
        
        res.json({ 
            success: true, 
            messages,
            total,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const senderId = req.user._id;

        // Validation: Magnitude Check
        if (!content || content.length > 2000) {
            return res.status(400).json({ success: false, message: "Protocol magnitude invalid." });
        }

        const newMessage = await Message.create({
            sender: senderId,
            receiver: receiverId,
            content
        });

        // Real-time Relay: Pusher Trigger
        await broadcast(`user-${receiverId}`, 'new-message', {
            sender: req.user.name,
            content: content.substring(0, 50) + '...'
        });

        // Trigger Admin Notification
        await createAdminNotification({
            type: 'NEW_MESSAGE',
            message: `New message from ${req.user.name} to receiver ${receiverId}`,
            module: 'communication',
            referenceId: newMessage._id
        });

        res.json({ success: true, message: "Protocol Dispatched", data: newMessage });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- Comment Moderation ---
export const getAdminComments = async (req, res) => {
    try {
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

        res.json({ 
            success: true, 
            comments,
            total,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateCommentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Institutional Moderation Nexus Hardening v1.1
        // Authorization: Admin only for status recalibration
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Executive Credentials Required for Moderation' });
        }

        const comment = await Comment.findByIdAndUpdate(id, { status }, { new: true });
        
        // Real-time Relay: Alert Author
        if (comment) {
            await broadcast(`user-${comment.user}`, 'comment-status-update', {
                status: status,
                commentId: id
            });
        }

        res.json({ success: true, message: `Comment status recalibrated to ${status}`, comment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const addComment = async (req, res) => {
    try {
        const { content, targetType, targetId, parentId } = req.body;
        const userId = req.user._id;

        const settings = await CommunicationSetting.findOne();
        
        // Institutional Profanity Protocol
        const profanityList = ['spam', 'abuse', 'hack', 'scam']; // Standard exclusion primitives
        if (settings && settings.profanityFilter) {
            const hasProfanity = profanityList.some(word => content.toLowerCase().includes(word));
            if (hasProfanity) {
                return res.status(400).json({ success: false, message: "Signal flagged by institutional profanity protocol." });
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

        // Real-time Relay: Alert Course Audience & Administrative Oversight
        const channelType = targetType === 'Blog' ? 'global-comment-channel' : `asset-${targetId}`;
        await broadcast(channelType, 'new-comment', {
            author: req.user.name,
            content: content.substring(0, 50) + '...',
            status
        });

        // Trigger Admin Notification
        await createAdminNotification({
            type: 'NEW_QUESTION', // Comments treated as questions for monitoring
            message: `New comment from ${req.user.name} on ${targetType}`,
            module: 'communication',
            referenceId: comment._id
        });

        res.json({ success: true, message: status === 'approved' ? 'Comment Published' : 'Comment Dispatched for Moderation', comment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const comment = await Comment.findById(id);

        if (!comment) return res.status(404).json({ success: false, message: 'Comment Not Found' });

        // Authorization: Owner, Admin, or Instructor
        if (comment.user.toString() !== req.user._id.toString() && 
            !['admin', 'instructor'].includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Institutional Authorization Required' });
        }

        // Recursive Deletion: Decommission all replies to maintain thread integrity
        await Comment.deleteMany({ parentId: id });
        await Comment.findByIdAndDelete(id);

        res.json({ success: true, message: 'Comment Protocol Decommissioned' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- Q&A Hub (Consolidated) ---
export const addQuestion = async (req, res) => {
    try {
        const { courseId, lessonId, message, parentId } = req.body;
        const userId = req.user._id;

        const settings = await CommunicationSetting.findOne();
        
        // Institutional Profanity Protocol
        const profanityList = ['spam', 'abuse', 'hack', 'scam']; 
        if (settings && settings.profanityFilter) {
            const hasProfanity = profanityList.some(word => message.toLowerCase().includes(word));
            if (hasProfanity) {
                return res.status(400).json({ success: false, message: "Inquiry signal flagged by profanity protocol." });
            }
        }

        // Validation: Magnitude Check
        if (settings && message.length > settings.maxMessageLength) {
            return res.status(400).json({ success: false, message: `Inquiry protocol exceeds max magnitude of ${settings.maxMessageLength} characters.` });
        }

        // Protocol Lock & Role Authority: Handle Replies
        if (parentId) {
            const parentDisc = await Discussion.findById(parentId);
            if (!parentDisc) return res.status(404).json({ success: false, message: "Inquiry Root Not Found" });

            // isReserved: Only specific roles can respond to locked inquiries
            if (parentDisc.isReserved && !['admin', 'instructor'].includes(req.user.role)) {
                return res.status(423).json({ success: false, message: "Status Locked: This inquiry is under administrative review." });
            }

            // Role Authority: Check allowQuestionReplyRoles
            if (settings && settings.allowQuestionReplyRoles.length > 0) {
                if (!settings.allowQuestionReplyRoles.includes(req.user.role)) {
                    return res.status(403).json({ success: false, message: "Institutional Authority Insufficient for Replies." });
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

        // Real-time Relay: Alert Course Audience & Administrative Oversight
        await broadcast(`course-${courseId}`, 'new-discussion', {
            type: parentId ? 'REPLY' : 'INQUIRY',
            author: req.user.name,
            message: message.substring(0, 50) + '...'
        });

        await broadcast('global-qa-channel', 'new-discussion', {
            type: parentId ? 'REPLY' : 'INQUIRY',
            author: req.user.name,
            message: message.substring(0, 50) + '...'
        });

        // Mark as replied if parentId exists (Instructor reply)
        if (parentId) {
            await Discussion.findByIdAndUpdate(parentId, { isReplied: true });
        }

        // Trigger Admin Notification
        await createAdminNotification({
            type: 'NEW_QUESTION',
            message: `New inquiry from ${req.user.name} in course`,
            module: 'communication',
            referenceId: question._id
        });

        const populated = await Discussion.findById(question._id)
            .populate('userId', 'name avatar role');

        res.json({ success: true, message: 'Inquiry Dispatched to Nexus', question: populated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getQA = async (req, res) => {
    try {
        const { courseId, lessonId, status, isReserved, limit = 20, skip = 0 } = req.query;
        let query = {};
        if (courseId) query.courseId = courseId;
        if (lessonId) query.lessonId = lessonId;
        if (status) query.status = status;
        if (isReserved !== undefined) query.isReserved = isReserved === 'true';

        // Only top-level inquiries for the primary list
        if (!req.query.all) query.parentId = null;

        const total = await Discussion.countDocuments(query);
        const discussions = await Discussion.find(query)
            .populate('userId', 'name avatar role')
            .populate('courseId', 'courseTitle')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        // Populate replies for each top-level inquiry (Recursive Protocol Avoided for Flat List Performance)
        const discussionsWithReplies = await Promise.all(
            discussions.map(async (disc) => {
                const replies = await Discussion.find({ parentId: disc._id })
                    .populate('userId', 'name avatar role')
                    .sort({ createdAt: 1 });
                return { ...disc.toObject(), replies };
            })
        );

        res.json({ 
            success: true, 
            discussions: discussionsWithReplies,
            total,
            pages: Math.ceil(total / limit) 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const disc = await Discussion.findById(id);

        if (!disc) return res.status(404).json({ success: false, message: 'Inquiry Node Not Found' });

        // Authorization: Owner, Instructor, or Admin
        if (disc.userId.toString() !== req.user._id.toString() && 
            !['admin', 'instructor'].includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Institutional Authorization Required' });
        }

        await Discussion.deleteMany({ parentId: id });
        await Discussion.findByIdAndDelete(id);

        res.json({ success: true, message: 'Inquiry Node Decommissioned' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const toggleQAReserve = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Authorization check: Admin or Instructor only
        if (!['admin', 'instructor'].includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Administrative Credentials Required' });
        }

        const disc = await Discussion.findById(id);
        if (!disc) return res.status(404).json({ success: false, message: 'Inquiry Node Not Found' });

        disc.isReserved = !disc.isReserved;
        await disc.save();
        
        res.json({ 
            success: true, 
            message: disc.isReserved ? "Question Locked for Administrative Review" : "Question Opened for Discourse", 
            isReserved: disc.isReserved 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- Settings ---
export const getSettings = async (req, res) => {
    try {
        let settings = await CommunicationSetting.findOne();
        if (!settings) {
            settings = await CommunicationSetting.create({});
        }
        res.json({ success: true, settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- Institutional Alerts: Notices Protocol ---
export const getNotices = async (req, res) => {
    try {
        const { courseId } = req.query;
        let query = { isPublished: true };
        
        // Scope resolution: Global or Course-specific
        if (courseId) {
            query.$or = [{ recipients: 'all' }, { course: courseId }];
        } else {
            query.recipients = 'all';
        }

        const notices = await Notice.find(query)
            .populate('instructor', 'name avatar role')
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({ success: true, notices });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const addNotice = async (req, res) => {
    try {
        const { title, content, courseId, recipients = 'all' } = req.body;
        const instructorId = req.user._id;

        // Authorization: Admin or Instructor credentials required
        if (!['admin', 'instructor'].includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Institutional Credentials Insufficient for Alert Dispatch' });
        }

        const notice = await Notice.create({
            title,
            content,
            course: courseId || null,
            instructor: instructorId,
            recipients
        });

        // Real-time Relay: Trigger Alert Channel
        const channel = recipients === 'all' ? 'global-notice-channel' : `course-notice-${courseId}`;
        await broadcast(channel, 'new-notice', {
            title,
            instructor: req.user.name
        });

        res.json({ success: true, message: "Institutional Alert Dispatched", notice });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateSettings = async (req, res) => {
    try {
        // Authorization: Admin only
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Executive Credentials Required' });
        }

        const settings = await CommunicationSetting.findOneAndUpdate({}, req.body, { new: true, upsert: true });
        res.json({ success: true, message: "Institutional Protocols Synchronized", settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
