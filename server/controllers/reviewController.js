import Review from '../models/Review.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import { grantPoints } from '../services/gamificationService.js';
import responseHelper from "../utils/responseHelper.js";
import AppError from "../utils/appError.js";
import asyncHandler from "../utils/asyncHandler.js";

// Add Review
export const addReview = asyncHandler(async (req, res, next) => {
    const { courseId, rating, comment } = req.body;
    const userId = req.user._id;

    // Verify Enrollment
    const isEnrolled = await Enrollment.findOne({ courseId, userId });
    if (!isEnrolled) {
        return next(new AppError('Pedagogical requirement: You must be enrolled to review this course.', 403));
    }

    // Check if already reviewed
    const existing = await Review.findOne({ courseId, userId });
    if (existing) {
        existing.rating = rating;
        existing.comment = comment;
        await existing.save();
        await updateCourseRating(courseId);
        return responseHelper.success(res, { review: existing }, 'Institutional review synchronized');
    }

    const review = await Review.create({ courseId, userId, rating, comment });
    await updateCourseRating(courseId);

    // Grant points for feedback cycle
    await grantPoints(userId, 'course_review');

    return responseHelper.success(res, { review }, 'Institutional review provisioned successfully', 201);
});

// Get Reviews for a Course
export const getCourseReviews = asyncHandler(async (req, res, next) => {
    const { courseId } = req.params;
    const reviews = await Review.find({ courseId })
        .populate('userId', 'name profilePicture')
        .sort({ createdAt: -1 });
    return responseHelper.success(res, { reviews }, 'Scholarly review registry synchronized');
});
// Delete Review
export const deleteReview = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review) return next(new AppError('Review not found', 404));

    await Review.findByIdAndDelete(id);
    await updateCourseRating(review.courseId);

    return responseHelper.success(res, {}, 'Institutional review artifact decommissioned');
});

// Get All Reviews (Admin View)
export const getAllReviews = asyncHandler(async (req, res, next) => {
    const reviews = await Review.find({})
        .populate('userId', 'name profilePicture email')
        .populate('courseId', 'courseTitle')
        .sort({ createdAt: -1 });
    return responseHelper.success(res, { reviews }, 'Global review registry synchronized');
});

// Update Review Status (Admin View)
export const updateReviewStatus = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;

    const review = await Review.findByIdAndUpdate(id, { status }, { new: true });
    if (!review) return next(new AppError('Review not found', 404));

    await updateCourseRating(review.courseId);

    return responseHelper.success(res, { review }, `Review status updated to ${status}`);
});

// Helper: Update course rating average
async function updateCourseRating(courseId) {
    const reviews = await Review.find({ courseId, status: 'approved' });
    const ratings = reviews.map(r => ({ userId: r.userId, rating: r.rating }));
    await Course.findByIdAndUpdate(courseId, { courseRatings: ratings });
}
