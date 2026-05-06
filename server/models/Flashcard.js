import mongoose from 'mongoose';

const flashcardSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    lectureId: { type: String, required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    nextReviewDate: { type: Date, default: Date.now },
    isArchived: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Flashcard', flashcardSchema);
