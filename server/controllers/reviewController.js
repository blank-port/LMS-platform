import Review from '../models/Review.js';
import Course from '../models/Course.js';
import { grantPoints } from '../services/gamificationService.js';

// Add Review
export const addReview = async (req, res) => {
    try {
        const { courseId, rating, comment } = req.body;
        const userId = req.user._id;

        // Check if already reviewed
        const existing = await Review.findOne({ courseId, userId });
        if (existing) {
            existing.rating = rating;
            existing.comment = comment;
            await existing.save();
            // Update course rating
            await updateCourseRating(courseId);
            return res.json({ success: true, message: 'Review updated' });
        }

        await Review.create({ courseId, userId, rating, comment });
        await updateCourseRating(courseId);

        // Grant points for feedback cycle
        await grantPoints(userId, 'course_review');

        res.json({ success: true, message: 'Review added' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get Reviews for a Course
export const getCourseReviews = async (req, res) => {
    try {
        const { courseId } = req.params;
        const reviews = await Review.find({ courseId })
            .populate('userId', 'name profilePicture')
            .sort({ createdAt: -1 });
        res.json({ success: true, reviews });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Delete Review
export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        if (review.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await Review.findByIdAndDelete(id);
        await updateCourseRating(review.courseId);

        res.json({ success: true, message: 'Review deleted' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Helper: Update course rating average
async function updateCourseRating(courseId) {
    const reviews = await Review.find({ courseId });
    const ratings = reviews.map(r => ({ userId: r.userId, rating: r.rating }));
    await Course.findByIdAndUpdate(courseId, { courseRatings: ratings });
}
