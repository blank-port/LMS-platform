import Discussion from '../models/Discussion.js';

// Add Comment
export const addComment = async (req, res) => {
    try {
        const { courseId, message, parentId } = req.body;
        const userId = req.user._id;

        const comment = await Discussion.create({
            courseId, userId, message,
            parentId: parentId || null
        });

        const populated = await Discussion.findById(comment._id)
            .populate('userId', 'name profilePicture');

        res.json({ success: true, message: 'Comment added', comment: populated });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get Comments for a Course
export const getCourseComments = async (req, res) => {
    try {
        const { courseId } = req.params;

        // Get top-level comments
        const comments = await Discussion.find({ courseId, parentId: null })
            .populate('userId', 'name profilePicture role')
            .sort({ createdAt: -1 });

        // Get replies for each comment
        const commentsWithReplies = await Promise.all(
            comments.map(async (comment) => {
                const replies = await Discussion.find({ parentId: comment._id })
                    .populate('userId', 'name profilePicture role')
                    .sort({ createdAt: 1 });
                return { ...comment.toObject(), replies };
            })
        );

        res.json({ success: true, comments: commentsWithReplies });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Delete Comment
export const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const comment = await Discussion.findById(id);

        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        // Allow owner, instructor, or admin to delete
        if (comment.userId.toString() !== req.user._id.toString()
            && req.user.role !== 'admin'
            && req.user.role !== 'instructor') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Delete replies too
        await Discussion.deleteMany({ parentId: id });
        await Discussion.findByIdAndDelete(id);

        res.json({ success: true, message: 'Comment deleted' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
