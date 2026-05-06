import Discussion from '../models/Discussion.js';
import responseHelper from "../utils/responseHelper.js";
import AppError from "../utils/appError.js";
import asyncHandler from "../utils/asyncHandler.js";

// Add Comment
export const addComment = asyncHandler(async (req, res, next) => {
    const { courseId, cohortId, message, parentId, lessonId } = req.body;
    const userId = req.user._id;

    if (!courseId) return next(new AppError('Strategic alignment failure: courseId is required', 400));

    const comment = await Discussion.create({
        courseId, 
        cohortId: cohortId || null,
        userId, 
        message,
        lessonId: lessonId || null,
        parentId: parentId || null
    });

    const populated = await Discussion.findById(comment._id)
        .populate('userId', 'name profilePicture role');

    return responseHelper.success(res, { comment: populated }, 'Institutional commentary provisioned successfully', 201);
});

// Get Comments (Contextual: Course or Cohort)
export const getComments = asyncHandler(async (req, res, next) => {
    const { courseId, cohortId, lessonId } = req.query;
    
    const query = { parentId: null };
    if (courseId) query.courseId = courseId;
    if (cohortId) {
        query.cohortId = cohortId;
    } else {
        // If no cohortId specified, fetch course-level global comments
        query.cohortId = null;
    }
    
    if (lessonId) query.lessonId = lessonId;

    const comments = await Discussion.find(query)
        .populate('userId', 'name profilePicture role')
        .sort({ createdAt: -1 });

    const commentsWithReplies = await Promise.all(
        comments.map(async (comment) => {
            const replies = await Discussion.find({ parentId: comment._id })
                .populate('userId', 'name profilePicture role')
                .sort({ createdAt: 1 });
            return { ...comment.toObject(), replies };
        })
    );

    return responseHelper.success(res, { comments: commentsWithReplies }, 'Institutional commentary feed synchronized');
});

// Moderate/Hide Comment (Instructor/Admin Only)
export const moderateComment = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body; // active, hidden, closed

    if (!['active', 'hidden', 'closed'].includes(status)) {
        return next(new AppError('Unrecognized status protocol', 400));
    }

    const comment = await Discussion.findByIdAndUpdate(id, { status }, { new: true });
    if (!comment) return next(new AppError('Institutional commentary artifact not found', 404));

    return responseHelper.success(res, { comment }, `Comment status evolved to ${status}`);
});

// Delete Comment
export const deleteComment = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const comment = await Discussion.findById(id);

    if (!comment) {
        return next(new AppError('Institutional commentary artifact not found', 404));
    }

    // Authorization: Owner, Instructor, or Admin
    if (comment.userId.toString() !== req.user._id.toString()
        && req.user.role !== 'admin'
        && req.user.role !== 'instructor') {
        return next(new AppError('Strategic authorization violation: Access denied', 403));
    }

    await Discussion.deleteMany({ parentId: id });
    await Discussion.findByIdAndDelete(id);

    return responseHelper.success(res, {}, 'Institutional commentary artifact decommissioned');
});

// Toggle Golden Knowledge (Instructor/Admin Only)
export const toggleGoldenKnowledge = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    
    if (!['admin', 'instructor'].includes(req.user.role)) {
        return next(new AppError('Strategic authorization violation: Executive clearance required', 403));
    }

    const disc = await Discussion.findById(id);
    if (!disc) return next(new AppError('Inquiry node not found', 404));

    disc.isGoldenKnowledge = !disc.isGoldenKnowledge;
    disc.verifiedBy = req.user._id;
    await disc.save();
    
    return responseHelper.success(res, { isGoldenKnowledge: disc.isGoldenKnowledge }, disc.isGoldenKnowledge ? "Discourse sealed as Golden Knowledge" : "Golden Status revoked");
});

