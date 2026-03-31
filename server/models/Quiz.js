import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    questionText: { type: String, required: true },
    questionType: { type: String, default: 'Multiple Choice' },
    marks: { type: Number, default: 1 },
    image: { type: String },
    options: [{ type: String, required: true }],
    correctAnswer: { type: Number, required: true } // index of correct option
});

const quizSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    title: { type: String, required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    subCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory' },
    instructions: { type: String },
    duration: { type: Number, default: 30 },
    passingScore: { type: Number, default: 50 },
    minimumPercentage: { type: Number, default: 0 },
    randomizeQuestions: { type: Boolean, default: false },
    changeDefaultSettings: { type: Boolean, default: false },
    allowReview: { type: Boolean, default: true },
    attemptsAllowed: { type: Number, default: 1 },
    questionGroups: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QuestionGroup'
    }],
    questions: [questionSchema],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;
