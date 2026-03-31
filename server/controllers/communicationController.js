import Message from "../models/Message.js";
import Comment from "../models/Comment.js";
import Notice from "../models/Notice.js";
import { broadcast } from "../services/pusherService.js";

// Private Messaging
export const sendMessage = async (req, res) => {
    try {
        const message = await Message.create({
            ...req.body,
            sender: req.user._id
        });
        
        // Broadcast to receiver
        await broadcast(`user-${message.receiver}`, 'new-message', message);
        
        res.json({ success: true, message });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getMessages = async (req, res) => {
    try {
        const userId = req.user._id;
        const messages = await Message.find({
            $or: [{ sender: userId }, { receiver: userId }]
        })
        .populate('sender', 'name profilePicture')
        .populate('receiver', 'name profilePicture')
        .sort({ createdAt: -1 });

        // Mark incoming messages as read
        await Message.updateMany(
            { receiver: userId, isRead: false },
            { $set: { isRead: true } }
        );

        res.json({ success: true, messages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Groups messages into conversation threads
export const getConversationThreads = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const threads = await Message.aggregate([
            {
                $match: {
                    $or: [{ sender: userId }, { receiver: userId }]
                }
            },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $gt: ["$sender", "$receiver"] },
                            { s: "$sender", r: "$receiver" },
                            { s: "$receiver", r: "$sender" }
                        ]
                    },
                    lastMessage: { $first: "$$ROOT" },
                    unreadCount: {
                        $sum: { $cond: [{ $and: [{ $eq: ["$receiver", userId] }, { $eq: ["$isRead", false] }] }, 1, 0] }
                    }
                }
            },
            { $sort: { "lastMessage.createdAt": -1 } }
        ]);

        // Further populate participant details in threads would be done here if needed
        res.json({ success: true, threads });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Generalized Comments & Q&A
export const postComment = async (req, res) => {
    try {
        const comment = await Comment.create({
            ...req.body,
            user: req.user._id
        });

        // Broadcast to course/lesson channel
        await broadcast(`${comment.targetType}-${comment.targetId}`, 'new-comment', comment);

        res.json({ success: true, comment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getComments = async (req, res) => {
    try {
        const { targetType, targetId } = req.query;
        const comments = await Comment.find({ targetType, targetId }).populate('user', 'name avatar');
        res.json({ success: true, comments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Notices / Announcements
export const postNotice = async (req, res) => {
    try {
        const notice = await Notice.create({
            ...req.body,
            instructor: req.user._id
        });
        
        // Broadcast to specific course or all
        const channel = notice.recipients === 'course' ? `course-${notice.course}` : 'global-notices';
        await broadcast(channel, 'new-notice', notice);
        
        res.json({ success: true, notice });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getNotices = async (req, res) => {
    try {
        const { courseId } = req.query;
        let query = { isPublished: true };
        
        if (courseId) {
            query.$or = [{ recipients: 'all' }, { course: courseId }];
        } else {
            query.recipients = 'all';
        }
        
        const notices = await Notice.find(query)
            .populate('instructor', 'name profilePicture')
            .sort({ createdAt: -1 });
            
        res.json({ success: true, notices });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getInstructorNotices = async (req, res) => {
    try {
        const notices = await Notice.find({ instructor: req.user._id })
            .populate('course', 'courseTitle')
            .sort({ createdAt: -1 });
        res.json({ success: true, notices });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
